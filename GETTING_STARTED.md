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
