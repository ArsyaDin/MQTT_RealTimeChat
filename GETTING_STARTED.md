# Getting Started Guide - MQTT Chat System

## Prerequisites

Before you begin, make sure you have the following installed:

- **Docker** (version 20.10+)
- **Docker Compose** (version 1.29+)

If you don't have Docker installed, download from: https://www.docker.com/products/docker-desktop

## Installation & Quick Start

### Option 1: Using Setup Script (Recommended)

#### On Linux/Mac:
```bash
cd /home/athonk/FinalProject
bash setup.sh
```

#### On Windows:
```bash
cd C:\Users\YourUsername\FinalProject
setup.bat
```

The script will:
1. Check for Docker installation
2. Create environment files
3. Build all containers
4. Start all services

### Option 2: Manual Docker Compose

```bash
cd /home/athonk/FinalProject
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

## Viewing Logs

To see what's happening in your services:

```bash
# View all service logs
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mosquitto
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f
```

## Troubleshooting

### Problem: "Cannot connect to Docker daemon"
**Solution**: Make sure Docker Desktop is running. Start Docker and try again.

### Problem: "Port 3001 is already in use"
**Solution**: Either:
- Stop the service using that port: `docker-compose down`
- Or modify the port in `docker-compose.yml` and change `3001:3000` to `3002:3000`

### Problem: "Cannot reach backend from frontend"
**Solution**: 
- Check that all containers are running: `docker-compose ps`
- Verify backend logs: `docker-compose logs backend`
- Ensure there are no firewall issues

### Problem: "Messages not persisting"
**Solution**: 
- Check MongoDB is running: `docker-compose ps`
- Ensure MongoDB volume isn't corrupted: `docker-compose down -v && docker-compose up`

### Problem: "Cannot connect from other computer"
**Solution**:
- Verify your computer's firewall isn't blocking port 3001
- Check your local IP address is correct
- Ensure both computers are on the same network

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

## Advanced: Local Development (Without Docker)

If you want to develop without Docker:

### Backend Setup:
```bash
cd backend
npm install
export MONGO_URL=mongodb://admin:password@localhost:27017
export MQTT_BROKER_URL=mqtt://localhost:1883
npm run dev
```

### Frontend Setup:
```bash
cd frontend
npm install
export REACT_APP_BACKEND_URL=http://localhost:3000
export REACT_APP_MQTT_BROKER_URL=ws://localhost:9001
npm start
```

You'll need to have MongoDB and Mosquitto running separately.

## Performance Tips

- **First load may be slow** - React compilation on first start takes time
- **Keep chat history reasonable** - Displaying 100 messages works well
- **Close unused rooms** - Helps reduce memory usage
- **Limit concurrent users** - Works great with 10-50 users per room

## Next Steps

1. ✅ Start the application with `setup.sh` or `setup.bat`
2. 🧪 Test with multiple browser tabs or computers
3. 💬 Create different rooms and test messaging
4. 🚀 Invite others to join from the network

## Support & Issues

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify all containers are running: `docker-compose ps`
3. Try restarting: `docker-compose down && docker-compose up --build`
4. Review the main README.md for more detailed information

Enjoy chatting! 🎉
