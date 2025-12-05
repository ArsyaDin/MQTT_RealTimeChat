# Real-Time MQTT Chat System

A modern, real-time chat application using MQTT protocol with Node.js backend, React frontend, and MongoDB for persistence.

## Features

- 🏠 **Room-based Chat** - Join any room by entering a room name
- 👤 **Anonymous Users** - No login required, just enter a username
- ⚡ **Real-time Messaging** - Instant message delivery using MQTT protocol
- 💾 **Chat History** - Last 100 messages stored and displayed on room join
- 👥 **Active Users** - See who's currently in the room
- 📱 **Responsive Design** - Beautiful UI that works on desktop and mobile
- 🐳 **Docker Support** - Full containerized setup for easy deployment

## Architecture

The system consists of 4 main services:

1. **MQTT Broker (Mosquitto)** - Message broker for real-time communication
2. **Backend (Node.js + Express)** - API server and MQTT client
3. **Frontend (React)** - Interactive web interface
4. **Database (MongoDB)** - Message and user storage

## Prerequisites

- Docker and Docker Compose
- Or locally: Node.js v18+, MongoDB running on localhost:27017

## Quick Start with Docker

1. **Clone the repository**

2. **Build and start all services**
   ```bash
   docker compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - MQTT Broker: localhost:1883 (or ws://localhost:9001 for WebSocket)

### For more detailed information, access [this link](GETTING_STARTED.md) 


## Technology Stack

- **Backend**: Node.js, Express.js, MQTT.js
- **Frontend**: React.js, MQTT.js
- **Database**: MongoDB
- **Message Broker**: Eclipse Mosquitto
- **Deployment**: Docker, Docker Compose

## Project Structure

```
FinalProject/
├── backend/                          # Node.js backend server
│   ├── server.js                     # Main Express server with REST API & MQTT
│   ├── package.json                  # Dependencies
│   ├── Dockerfile                    # Backend container
│   └── .env.example                  # Environment variables template
│
├── frontend/                         # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── JoinScreen.js         # Login/room selection screen
│   │   │   ├── RoomBrowser.js        # Room discovery & browsing
│   │   │   ├── ChatRoom.js           # Main chat interface with MQTT
│   │   │   ├── JoinScreen.css        # Join screen styles
│   │   │   ├── RoomBrowser.css       # Room browser styles
│   │   │   └── ChatRoom.css          # Chat room styles
│   │   ├── App.js                    # Main app component with session management
│   │   ├── App.css                   # App styles
│   │   └── index.js                  # React entry point
│   ├── public/
│   │   └── index.html                # HTML template
│   ├── package.json                  # Dependencies
│   ├── Dockerfile                    # Frontend container
│   └── .env.example                  # Environment variables template
│
├── mosquitto/                        # MQTT Broker configuration
    └── config.conf                   # Mosquitto configuration
```

To see more about the system's structure and how it works [click here](ARCHITECTURE.md)

## API Endpoints

### Join a Room
```
POST /api/rooms/:roomName/join
Body: { "username": "string" }
```

### Leave a Room
```
POST /api/rooms/:roomName/leave
Body: { "username": "string" }
```

### Send a Message
```
POST /api/rooms/:roomName/messages
Body: { "username": "string", "content": "string" }
```

### Get Last 100 Messages
```
GET /api/rooms/:roomName/messages
```

### Get Active Users
```
GET /api/rooms/:roomName/users
```

## MQTT Topics

- `chat/{roomName}/messages` - Messages in a room
- `chat/{roomName}/users/join` - User join events
- `chat/{roomName}/users/leave` - User leave events

## Accessing from Other Computers

To access the chat from other device on the same network click [this link](WSL_PORT_FORWARDING.md)

## Future Enhancements

- User authentication and accounts
- Direct messaging between users
- Message reactions and emojis
- User typing indicators
- File sharing
- Message search
- Room permissions and privacy settings
- Message notifications

## License

MIT License - feel free to use this project for your own purposes.


