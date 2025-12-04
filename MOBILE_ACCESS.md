# Mobile Access Guide

## Accessing MQTT Real-Time Chat from Your Mobile Phone

This guide explains how to access the chat system from your mobile phone on the same network as your computer.

## Prerequisites

- Your computer running the Docker containers with the chat system
- Mobile phone (iOS or Android) connected to the **same Wi-Fi network** as your computer
- Modern web browser on mobile (Chrome, Safari, Firefox, etc.)

## Step 1: Find Your Computer's IP Address

### On Linux/Windows WSL:
```bash
hostname -I
```

Look for the IP address that starts with your network range (commonly `192.168.x.x` or `10.0.x.x` or `172.x.x.x`)

### Example Output:
```
172.26.231.60 172.17.0.1 172.18.0.1
```

Use the first IP address: **`172.26.231.60`** (in this example)

## Step 2: Access from Mobile

### Open Mobile Browser
1. On your mobile phone, open any web browser (Chrome, Safari, etc.)
2. Enter the following URL in the address bar:
   ```
   http://172.26.231.60:3001
   ```
   *(Replace `172.26.231.60` with your actual computer IP address from Step 1)*

3. Press Enter to navigate to the application

## Step 3: Use the Chat

1. **Enter Username**: Type any username you want
2. **Enter Room Name**: Choose a room name to join
3. **Click "Join Room"**: Start chatting!

### Features Available:
- ✅ Real-time messaging with other connected users
- ✅ See active users in the room
- ✅ View chat history when joining
- ✅ Automatic disconnect when closing the browser
- ✅ Leave room option

## Troubleshooting

### "Cannot connect to server"
- **Solution 1**: Verify both devices are on the same Wi-Fi network
- **Solution 2**: Check firewall settings - ensure ports 3001 (frontend), 3000 (backend), and 9001 (MQTT) are accessible
- **Solution 3**: Ping your computer from mobile:
  ```bash
  ping 172.26.231.60  # Use your actual IP
  ```

### "Connection error" in app
- **Solution 1**: Refresh the page (Ctrl+R or Command+R on mobile)
- **Solution 2**: Check Docker containers are running:
  ```bash
  docker ps
  ```
- **Solution 3**: Check backend logs:
  ```bash
  docker logs chat_backend
  ```

### Mobile browser won't load the page
- **Solution 1**: Ensure you're using `http://` (not `https://`)
- **Solution 2**: Try a different browser on mobile
- **Solution 3**: Restart Docker containers:
  ```bash
  docker restart chat_frontend chat_backend
  ```

## Network Architecture

```
Mobile Phone (on Wi-Fi)
    ↓
Router
    ↓
Your Computer (172.26.231.60)
    ├── Frontend (React) on port 3001
    ├── Backend (Node.js) on port 3000
    ├── MQTT Broker (Mosquitto) on port 9001
    └── MongoDB on port 27017
```

## Multiple Devices

You can have **multiple devices** on the same network joining the chat simultaneously:

1. Device 1 (Desktop): `http://localhost:3001`
2. Device 2 (Mobile): `http://172.26.231.60:3001`
3. Device 3 (Tablet): `http://172.26.231.60:3001`

All connected devices will see real-time messages and active user lists!

## Port Forwarding (Advanced - For External Network Access)

To access from outside your local network, you can set up port forwarding on your router:

1. Forward external port 3001 → internal IP 172.26.231.60:3001
2. Forward external port 1883 → internal IP 172.26.231.60:1883
3. Forward external port 9001 → internal IP 172.26.231.60:9001

Then access from anywhere using your public IP address. **Note**: This exposes your system to the internet - use with caution.

## Checking System Status

Monitor your chat system:

```bash
# View all running containers
docker ps

# Check backend logs
docker logs chat_backend -f

# Check MQTT broker logs
docker logs mqtt_broker -f

# Check frontend logs
docker logs chat_frontend -f
```

## Performance Tips

- For best performance, ensure your Wi-Fi signal is strong
- Close unnecessary browser tabs on the device
- If experiencing lag, check Docker container resource usage:
  ```bash
  docker stats
  ```

## Security Note

This setup is intended for **local network use only**. For production deployments or external access, implement:
- HTTPS/WSS encryption
- Authentication mechanisms
- Rate limiting
- Input validation
