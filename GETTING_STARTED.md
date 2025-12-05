# Getting Started Guide - MQTT Chat System

## Prerequisites

Before you begin, make sure you have the following installed:

- **Docker** (version 20.10+)
- **Docker Compose** (version 1.29+)

## Installation & Quick Start

### Manual Docker Compose
Change to your project directory and run this command

```bash
docker-compose up --build
```

## What Gets Deployed

When you run the setup, you'll get:

- **MongoDB** (Port 27017) - Database for storing messages and user sessions
- **Mosquitto MQTT Broker** (Port 1883, 9001) - Message broker for real-time communication
- **Node.js Backend** (Port 3000) - REST API and MQTT bridge
- **React Frontend** (Port 3001) - Web interface

## Accessing the Application

1. **Open your browser** and go to: `http://localhost:3001`
2. **Enter a username** (e.g., "Alice", "Bob")
3. **Enter a room name** (e.g., "general", "friends", "project")
4. **Click "Join Room"** to start chatting

### Multiple Users on Same Network

To access the chat from another computer on your local network:

1. Find your computer's IP address:
   - **Windows**: Open Command Prompt and type `ipconfig`
   - **Mac/Linux**: Open Terminal and type `ifconfig`
   - Look for IPv4 Address (e.g., 192.168.1.100)

2. From the other computer, open browser and go to:
   ```
   http://<your-ip>:3001
   ```
   For example: `http://192.168.1.100:3001`

## Stopping the Services

### Graceful Shutdown:
- Press `Ctrl+C` in the terminal where docker-compose is running

### Force Stop:
```bash
docker-compose down
```

### Remove All Data (including chat history):
```bash
docker-compose down -v
```

## File Structure Overview

```
FinalProject/
├── backend/                    # Node.js backend
│   ├── server.js              # Main server code
│   ├── package.json           # Dependencies
│   ├── Dockerfile             # Container instructions
│   └── .env.example           # Environment template
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # Chat components
│   │   ├── App.js            # Main component
│   │   └── index.js          # Entry point
│   ├── package.json          # Dependencies
│   ├── Dockerfile            # Container instructions
│   └── .env.example          # Environment template
│
├── mosquitto/
│   └── config.conf           # MQTT broker configuration
│
├── docker-compose.yml        # Multi-container setup
├── README.md                 # Full documentation
├── setup.sh                  # Linux/Mac setup script
└── setup.bat                 # Windows setup script
```

## Using the Chat Application

### Creating a New Room
1. Enter any room name that doesn't exist yet
2. It will be created automatically when you join
3. Others can join the same room using the same name

### Joining an Existing Room
1. Enter a room name that already has users
2. You'll see chat history (last 100 messages)
3. You'll see who else is online

### Sending Messages
1. Type your message in the input box at the bottom
2. Press Enter or click Send
3. Message is instantly broadcast to all users in the room

### Seeing Other Users
- Active users are shown in the right sidebar
- Green dot indicates they're online
- Your name is highlighted with a "You" badge

### Leaving the Room
- Click the "Leave" button in the top-right
- Or simply close the browser tab
- You'll automatically disconnect
---
