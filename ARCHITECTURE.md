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
Browser                Backend              MQTT              MongoDB
  │                      │                  │                   │
  ├─ POST /join ────────>│                  │                   │
  │                      ├─ Store user ────────────────────────>│
  │                      │                  │                   │
  │                      ├─ Publish join ──>│                   │
  │                      │                  ├─ Broadcast ──────>│
  │                      │                  │ (other clients)   │
  │<─ 200 OK ────────────┤                  │                   │
  │                      │                  │                   │
```

### 2. Send Message

```
Browser                Backend              MQTT              MongoDB
  │                      │                  │                   │
  ├─ POST /messages ────>│                  │                   │
  │                      ├─ Publish msg ───>│                   │
  │                      │                  ├─ Broadcast ──────>│
  │                      │                  │ (all clients)     │
  │                      │<─ Receive msg ───│                   │
  │                      ├─ Store in DB ────────────────────────>│
  │<─ 200 OK ────────────┤                  │                   │
```

### 3. Receive Messages

```
Backend              MQTT              Browser (via WebSocket)
  │                  │                 │
  ├─ Subscribe ─────>│                 │
  │                  ├─ Message ──────>│
  │                  │                 ├─ Update state
  │                  │                 ├─ Re-render
  │                  │                 └─ Scroll to bottom
```

## Communication Protocols

### 1. HTTP/REST (Frontend → Backend)

Used for:
- Room join/leave
- Sending messages
- Fetching message history
- Fetching active users

**Advantages**: Reliable, stateless, easy to debug

### 2. WebSocket/MQTT (Frontend ↔ Backend ↔ MQTT)

Used for:
- Real-time message delivery
- User presence updates
- Instant chat experience

**Advantages**: Bi-directional, low-latency, maintains connection

### 3. MQTT (Backend ↔ MQTT ↔ Clients)

Topics:
- `chat/{room}/messages` - Text messages
- `chat/{room}/users/join` - Join events
- `chat/{room}/users/leave` - Leave events

**Message Format (JSON)**:
```json
{
  "username": "Alice",
  "content": "Hello everyone!",
  "timestamp": "2024-12-02T10:30:00Z"
}
```

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
