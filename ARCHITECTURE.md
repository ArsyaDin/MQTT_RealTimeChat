# System Architecture - MQTT Chat Application

## Overview

This document describes the architecture and design of the Real-Time MQTT Chat System.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Local Network                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                    ┌──────────────┐       │
│  │   Browser 1  │                    │   Browser 2  │       │
│  │  (Frontend)  │                    │  (Frontend)  │       │
│  └──────┬───────┘                    └──────┬───────┘       │
│         │                                    │                │
│         └────────────────┬───────────────────┘               │
│                          │                                    │
│  ┌───────────────────────▼──────────────────────┐            │
│  │         Docker Network: chat_network         │            │
│  │                                               │            │
│  │  ┌─────────────────────────────────────┐   │            │
│  │  │  Container: Frontend (port 3001)    │   │            │
│  │  │  - React App                        │   │            │
│  │  │  - MQTT Client (WebSocket 9001)    │   │            │
│  │  └────────────┬────────────────────────┘   │            │
│  │               │ HTTP/WS                     │            │
│  │  ┌────────────▼────────────────────────┐   │            │
│  │  │  Container: Backend (port 3000)     │   │            │
│  │  │  - Express Server                   │   │            │
│  │  │  - REST API Routes                  │   │            │
│  │  │  - MQTT Client (TCP 1883)           │   │            │
│  │  └────────────┬─────────────┬──────────┘   │            │
│  │               │             │               │            │
│  │  ┌────────────▼┐      ┌─────▼───────┐     │            │
│  │  │  Mosquitto  │      │  MongoDB    │     │            │
│  │  │ (port 1883) │      │ (port 27017)│     │            │
│  │  │             │      │             │     │            │
│  │  │ - MQTT      │      │ - Messages  │     │            │
│  │  │   Broker    │      │ - Users     │     │            │
│  │  └─────────────┘      └─────────────┘     │            │
│  │                                               │            │
│  └───────────────────────────────────────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend (React)

**Location**: `frontend/` directory

**Key Features**:
- **Join Screen Component** - Username and room input
- **Chat Room Component** - Message display, active users, input box
- **MQTT Client** - Real-time connection using WebSocket
- **Responsive UI** - Beautiful, modern design

**Technologies**:
- React.js v18
- MQTT.js (WebSocket connection)
- Axios (HTTP client)
- CSS3 with gradients and animations

**Ports**:
- HTTP: 3001 (user access)
- WebSocket to MQTT: 9001 (real-time messaging)

### 2. Backend (Node.js + Express)

**Location**: `backend/` directory

**Key Features**:
- **REST API** - Endpoints for room operations
- **MQTT Bridge** - Listens to all MQTT topics and stores messages
- **User Management** - Track active users in rooms
- **Message Persistence** - Save all messages to MongoDB

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/rooms/:roomName/join` | User joins a room |
| POST | `/api/rooms/:roomName/leave` | User leaves a room |
| POST | `/api/rooms/:roomName/messages` | Send a message |
| GET | `/api/rooms/:roomName/messages` | Fetch last 100 messages |
| GET | `/api/rooms/:roomName/users` | Get active users |
| GET | `/health` | Health check |

**Technologies**:
- Node.js v18
- Express.js (HTTP server)
- MQTT.js (MQTT client)
- Mongoose (MongoDB ORM)
- CORS enabled for frontend

**Ports**:
- HTTP: 3000 (API access)
- MQTT: 1883 (message broker connection)

### 3. MQTT Broker (Mosquitto)

**Location**: `mosquitto/config.conf`

**Key Features**:
- **Message Routing** - Routes messages between subscribers
- **Topic-based Publishing** - Organized by room names
- **WebSocket Support** - Allows browser connections
- **Persistence** - Retains configuration and logs

**Ports**:
- TCP: 1883 (MQTT protocol)
- WebSocket: 9001 (browser connections)

**Topic Structure**:
```
chat/
├── {roomName}/
│   ├── messages          # Messages in the room
│   └── users/
│       ├── join         # User join events
│       └── leave        # User leave events
```

### 4. Database (MongoDB)

**Location**: Docker container

**Collections**:

#### Messages Collection
```javascript
{
  _id: ObjectId,
  roomName: String,
  username: String,
  content: String,
  timestamp: Date
}
```

#### Users Collection
```javascript
{
  _id: ObjectId,
  roomName: String,
  username: String,
  joinedAt: Date,
  expiresAt: Date  // TTL index for auto-cleanup
}
```

**Indexes**:
- `messages`: Compound index on (roomName, timestamp)
- `users`: TTL index on expiresAt for auto-expiration (30 min)

## Data Flow

### 1. User Joins Room

```
Browser                Backend                  MQTT              MongoDB
  │                      │                        │                   │
  ├─ POST /join ────────>│                        │                   │
  │                      ├─ Find/Create room ────────────────────────>│
  │                      ├─ Create/Update user (idempotent) ─────────>│
  │                      │ (if refresh: refresh TTL only) (no         │
  │                      │  userCount increment)                      │
  │                      ├─ Increment userCount ─────────────────────>│
  │                      │ (only if new user)                         │
  │                      ├─ Publish join event ──>│                   │
  │                      │                        ├─ Broadcast ──────>│
  │                      │                        │ (other clients)   │
  │<─ 200 OK + room ─────┤                        │                   │
  │ (store to sessionStorage)                     │                   │
  │                      │                        │                   │
  ├─ Connect MQTT WS ───────────────────────────────────────────>     │
  │ (ws://host:9001)     │                        │                   │
  │                      │                        ├─ MQTT Connected   │
  ├─ Subscribe topics ───────────────────────────────────────────────>│
  │ chat/:room/messages  │                        ├─ Subscribed       │
  │ chat/:room/users/#   │                        │                   │
```

### 2. Send Message

```
Browser                Backend                MQTT              MongoDB
  │                      │                     │                   │
  ├─ POST /messages ────>│                     │                   │
  │ (username, content)  │                     │                   │
  │                      ├─ Save message ─────────────────────────>│
  │                      │ (messages collection)                   │
  │                      ├─ Update room metadata ─────────────────>│
  │                      │ (lastMessageAt, lastMessagePreview,     │
  │                      │  lastMessageUser, messageCount)         │
  │                      ├─ Publish message ──>│                   │
  │                      │                     ├─ Broadcast ──────>│
  │                      │                     │ (all subscribers) │
  │<─ 200 OK ────────────┤                     │                   │
  │                      │                     ├─ Message ────────>│
  │                      │                     │ (self + others)   │
  │ ← Update UI (via MQTT message received)    │                   │
```

### 3. Receive Messages

```
All Connected Clients   Backend         MQTT Broker          MongoDB
        │                  │                  │                    │
        │                  ├─ Subscribe ─────>│                    │
        │                  │ chat/:room/msg   │                    │
        │                  │                  │                    │
        │                  │                  │ Publish ──────────>│ (already stored)
        │                  │<─ Message ───────│                    │
        │<─ Message ─────────────────────────────────────────────> │
        │ (via MQTT WS)    │                  │                    │
        ├─ Update state    │                  │                    │
        ├─ Re-render UI    │                  │                    │
        └─ Scroll to bottom                   │                    │
```

### 4. Room Browsing

```
Browser                Backend              MongoDB
  │                      │                   │
  ├─ GET /api/rooms ────>│                   │
  │ (sort, search, limit)│                   │
  │                      ├─ Query rooms ────>│
  │                      │ (apply filters)   │
  │<─ JSON array ────────┤<─ Return results ─┤
  │ + metadata           │                   │
  │ (userCount,          │                   │
  │  lastMessage,        │                   │
  │  createdAt, etc.)    │                   │
```

### 5. User Leaves Room

```
Browser                Backend              MQTT              MongoDB
  │                      │                  │                   │
  ├─ POST /leave ───────>│                  │                   │
  │ (username)           │                  │                   │
  │                      ├─ Delete user ───────────────────────>│
  │                      │ (users collection)                   │
  │                      ├─ Decrement userCount ───────────────>│
  │                      │                  │                   │
  │                      ├─ Publish leave ─>│                   │
  │                      │ event            ├─ Broadcast ──────>│
  │                      │                  │ (other clients)   │
  │<─ 200 OK ────────────┤                  │                   │
  │ → Clear sessionStorage                  │                   │
  │ → Disconnect MQTT    │                  │                   │
```

## Communication Protocols

### 1. HTTP/REST (Frontend → Backend)

Used for:
- Room join/leave (`POST /api/rooms/:roomName/join`, `/leave`)
- Sending messages (`POST /api/rooms/:roomName/messages`)
- Fetching message history (`GET /api/rooms/:roomName/messages`)
- Fetching active users (`GET /api/rooms/:roomName/users`)
- Browsing rooms (`GET /api/rooms`)
- Room details (`GET /api/rooms/:roomName/details`)

**Advantages**: Reliable, stateless, easy to debug

**Key Behavior**: Join endpoint is **idempotent** — calling it multiple times with the same username for the same room will only increment userCount once. Subsequent calls refresh the user's TTL and return success.

### 2. WebSocket/MQTT (Frontend ↔ MQTT Broker)

Used for:
- Real-time message delivery
- User presence updates (join/leave)
- Instant chat experience

**Advantages**: Bi-directional, low-latency, maintains connection

**Connection Flow**:
1. Frontend connects to `ws://host:9001` (MQTT broker WebSocket)
2. Frontend subscribes to room-specific topics
3. Backend publishes to same topics when events occur
4. Both frontend and backend receive published messages

### 3. TCP MQTT (Backend ↔ MQTT Broker)

Used for:
- Backend to publish join/leave/message events
- Backend to subscribe to all room topics (for logging/persistence)

**Topics**:
- `chat/{room}/messages` — Text messages; payload: `{ username, content, timestamp }`
- `chat/{room}/users/join` — Join events; payload: `{ username, timestamp, action: "join" }`
- `chat/{room}/users/leave` — Leave events; payload: `{ username, timestamp, action: "leave" }`

**Message Format (JSON)**:
```json
{
  "username": "Alice",
  "content": "Hello everyone!",
  "timestamp": "2024-12-05T10:30:00Z"
}
```

## Session Persistence & Refresh Behavior

### Per-Tab Session Management

**Storage**: Browser `sessionStorage` (scoped per tab)
- Stores: `{ username, roomName }`
- Cleared when tab is closed or user clicks "Leave"
- **Not shared** across browser tabs (prevents impersonation bug)

**Flow**:
1. User joins room → frontend stores session in `sessionStorage`
2. User refreshes page → App.js reads `sessionStorage` and calls join endpoint
3. Backend's idempotent join refreshes the user's TTL (does not create duplicate)
4. Frontend reconnects MQTT and resubscribes to room topics
5. User sees same room and username (refresh-safe)

**New Tab Behavior**:
- Opens with empty `sessionStorage` (no previous user)
- Shows Join Screen, requires username entry
- User cannot accidentally impersonate another tab's user

### TTL & Heartbeat

**User Document Expiry** (`expiresAt` field):
- Set to 30 minutes in the future when user joins
- MongoDB TTL index automatically removes expired user documents

**Heartbeat** (Client-side periodic refresh):
- Frontend heartbeat runs every 4 minutes (while user is in ChatRoom)
- Calls `POST /api/rooms/:roomName/join` with current username
- Backend updates `expiresAt` to 30 minutes into the future
- Keeps user active if tab remains open

**Result**: If user closes tab and reopens later, they start fresh (new join). If user stays in app, they remain in room across refreshes and MQTT reconnects.

## Docker Container Orchestration

### docker-compose.yml

Services:
1. **mosquitto** - MQTT broker (image: eclipse-mosquitto)
2. **mongodb** - Document database (image: mongo)
3. **backend** - Node.js API server (built from Dockerfile)
4. **frontend** - React app (built from Dockerfile)

**Networks**: All containers connected to `chat_network` bridge network

**Volumes**:
- `mongodb_data` - Persists MongoDB data
- `mosquitto_data` - MQTT persistence files
- `mosquitto_logs` - MQTT logs

**Startup Order**:
1. MongoDB starts first
2. MQTT Broker starts
3. Backend starts (after MQTT and MongoDB are ready)
4. Frontend starts (after Backend is ready)

## Security Considerations

### Current Implementation
- No authentication required (anonymous access by design)
- All messages in plain text
- No encryption in transit (HTTP/WS)
- No message encryption at rest

### Production Considerations (Future)
- Add username/password authentication
- Use TLS/SSL for all connections
- Implement room permissions
- Rate limiting on API endpoints
- Input validation and sanitization
- Admin dashboard for moderation

## Scalability

### Current Setup
- Suitable for 1-100 concurrent users per room
- Single backend instance
- Single MongoDB instance
- Single MQTT broker

### Horizontal Scaling (Future)
- Multiple backend instances with load balancer
- MongoDB replica set
- MQTT broker clustering
- Redis caching layer
- Message queue (RabbitMQ/Kafka) for backend communication

## Performance Characteristics

### Latency
- Message sending: 50-200ms (typical)
- UI update: <100ms
- History fetch: <500ms

### Storage
- Per message: ~200 bytes
- 100 messages per room: ~20KB
- With 50 rooms × 100 messages: ~1MB

### Network Bandwidth
- Typical user: 10-50 KB/min (messages + presence)
- With 50 users: 500 KB - 2.5 MB/min

## Development Workflow

1. **Edit code** in `backend/` or `frontend/`
2. **Containers auto-reload** (volumes mounted)
3. **Check logs** with `docker-compose logs`
4. **Test in browser** at `localhost:3001`

## Monitoring & Debugging

### Logs
```bash
docker-compose logs backend      # Backend logs
docker-compose logs frontend     # Frontend logs
docker-compose logs mosquitto    # MQTT logs
docker-compose logs mongodb      # Database logs
```

### Database Inspection
```bash
# Connect to MongoDB
docker exec -it mongo_db mongo -u admin -p password
use admin
db.messages.find()
db.users.find()
```

### MQTT Topic Inspection
```bash
# Subscribe to all topics
mosquitto_sub -h localhost -t 'chat/#' -v
```

## Deployment

For production deployment:

1. Use docker-compose with production configuration
2. Set up reverse proxy (Nginx) for SSL/TLS
3. Use environment-specific .env files
4. Configure MongoDB authentication properly
5. Set up monitoring (Prometheus, Grafana)
6. Implement proper logging (ELK stack)
7. Regular database backups
8. Container image registry (DockerHub, ECR)

## Future Enhancements

1. **User Authentication** - OAuth, JWT tokens
2. **Direct Messaging** - Private 1-to-1 chats
3. **File Sharing** - Images, documents
4. **Typing Indicators** - Show when someone is typing
5. **Message Search** - Full-text search
6. **Reactions** - Emoji reactions to messages
7. **Read Receipts** - Message read status
8. **Mobile App** - Native iOS/Android apps
9. **Admin Panel** - Room management, user moderation
10. **Analytics** - Usage statistics, message trends
