# Quick Reference - MQTT Chat System

## 🚀 Quick Start

### Linux/Mac:
```bash
cd /home/athonk/FinalProject
bash setup.sh
```

### Windows:
```bash
cd C:\Users\YourUsername\FinalProject
setup.bat
```

### Manual:
```bash
docker-compose up --build
```

## 📱 Access Points

| Component | URL/Port | Purpose |
|-----------|----------|---------|
| Frontend | http://localhost:3001 | Chat UI |
| Backend API | http://localhost:3000 | REST API |
| MQTT Broker | localhost:1883 | Message broker |
| MongoDB | localhost:27017 | Database |

## 📁 Project Structure

```
FinalProject/
├── backend/               # Node.js Express server
│   ├── server.js         # Main server code
│   ├── package.json      # Dependencies
│   └── Dockerfile        # Container setup
├── frontend/             # React web app
│   ├── src/
│   │   ├── components/   # Chat components
│   │   ├── App.js       # Main app
│   │   └── index.js     # Entry point
│   ├── package.json     # Dependencies
│   └── Dockerfile       # Container setup
├── mosquitto/           # MQTT configuration
│   └── config.conf      # Broker settings
└── docker-compose.yml   # All services config
```

## 🔧 Common Commands

### Start Services
```bash
docker-compose up --build
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend
```

### Restart a Service
```bash
docker-compose restart backend
docker-compose restart mongodb
```

### Remove Everything (including data)
```bash
docker-compose down -v
```

## 🌐 Network Access

### Access from Same Computer
- Frontend: `http://localhost:3001`

### Access from Other Computer on Network
1. Find your IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
2. Access: `http://<YOUR-IP>:3001`
   - Example: `http://192.168.1.100:3001`

## 💬 Using the Chat

1. **Join Room**: Enter username and room name
2. **Send Message**: Type message and press Enter
3. **Leave Room**: Click "Leave" button or close tab
4. **Multiple Rooms**: Join different rooms from different browsers/tabs

## 📊 API Endpoints

```
POST   /api/rooms/:roomName/join
POST   /api/rooms/:roomName/leave
POST   /api/rooms/:roomName/messages
GET    /api/rooms/:roomName/messages
GET    /api/rooms/:roomName/users
GET    /health
```

## 🔌 MQTT Topics

```
chat/{roomName}/messages      # New messages
chat/{roomName}/users/join    # User joins
chat/{roomName}/users/leave   # User leaves
```

## ⚙️ Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
MQTT_BROKER_URL=mqtt://mosquitto:1883
MONGO_URL=mongodb://admin:password@mongodb:27017
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:3000
REACT_APP_MQTT_BROKER_URL=ws://localhost:9001
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | `docker-compose down` or change port in docker-compose.yml |
| Container won't start | `docker-compose logs <service>` to see error |
| Can't connect to MQTT | Check mosquitto container: `docker ps` |
| Messages not saving | Verify MongoDB is running: `docker-compose ps` |
| Frontend won't load | Check backend is running on port 3000 |

## 📚 Documentation Files

| File | Content |
|------|---------|
| README.md | Full project documentation |
| GETTING_STARTED.md | Detailed setup and usage guide |
| ARCHITECTURE.md | System design and technical details |
| this file | Quick reference (this file) |

## 🎯 Features

✅ Real-time messaging via MQTT
✅ Multiple rooms/channels
✅ Last 100 messages history
✅ Active user display
✅ Anonymous join (just username)
✅ Responsive UI design
✅ Automatic disconnect on tab close
✅ Docker containerization
✅ Message persistence in MongoDB
✅ Works on local network

## 🚀 Next Steps

1. Start the system: `bash setup.sh` or `setup.bat`
2. Open http://localhost:3001 in browser
3. Create test account and join a room
4. Open another browser tab/window and join same room
5. Start chatting!

## 💡 Tips

- Use descriptive room names (e.g., "project-team", "friends")
- Max username length: 20 characters
- Max room name: 30 characters
- Max message length: 500 characters
- Last 100 messages loaded from history
- Users auto-disconnect after 30 minutes of inactivity

---

For more details, see README.md or GETTING_STARTED.md
