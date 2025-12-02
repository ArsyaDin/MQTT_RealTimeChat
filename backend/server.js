const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUrl = process.env.MONGO_URL || 'mongodb://admin:password@localhost:27017';
mongoose.connect(mongoUrl, {
  authSource: 'admin',
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✓ MongoDB connected'))
.catch(err => console.error('✗ MongoDB connection error:', err));

// MongoDB Schemas
const messageSchema = new mongoose.Schema({
  roomName: String,
  username: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});

messageSchema.index({ roomName: 1, timestamp: -1 });

const userSchema = new mongoose.Schema({
  roomName: String,
  username: String,
  joinedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) }
});

userSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model('Message', messageSchema);
const User = mongoose.model('User', userSchema);

// MQTT Connection
const mqttBroker = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const mqttClient = mqtt.connect(mqttBroker, {
  reconnectPeriod: 5000,
  connectTimeout: 10000
});

mqttClient.on('connect', () => {
  console.log('✓ MQTT connected');
  // Subscribe to all room messages
  mqttClient.subscribe('chat/+/messages', (err) => {
    if (!err) console.log('✓ Subscribed to message topics');
  });
  mqttClient.subscribe('chat/+/users/join', (err) => {
    if (!err) console.log('✓ Subscribed to user join topics');
  });
  mqttClient.subscribe('chat/+/users/leave', (err) => {
    if (!err) console.log('✓ Subscribed to user leave topics');
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    const topicParts = topic.split('/');
    const roomName = topicParts[1];
    const messageType = topicParts[3];
    const data = JSON.parse(message.toString());

    if (messageType === 'messages') {
      // Save message to MongoDB
      const newMessage = new Message({
        roomName,
        username: data.username,
        content: data.content,
        timestamp: new Date(data.timestamp)
      });
      await newMessage.save();
    }
  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
});

// API Routes

// Join a room
app.post('/api/rooms/:roomName/join', async (req, res) => {
  try {
    const { roomName } = req.params;
    const { username } = req.body;

    if (!username || !roomName) {
      return res.status(400).json({ error: 'Username and room name required' });
    }

    // Add user to room
    const user = new User({
      roomName,
      username,
      joinedAt: new Date()
    });
    await user.save();

    // Publish user join event to MQTT
    const joinEvent = {
      username,
      timestamp: new Date().toISOString(),
      action: 'join'
    };
    mqttClient.publish(`chat/${roomName}/users/join`, JSON.stringify(joinEvent));

    res.json({ success: true, message: 'Joined room', userId: user._id });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Leave a room
app.post('/api/rooms/:roomName/leave', async (req, res) => {
  try {
    const { roomName } = req.params;
    const { username } = req.body;

    // Remove user from room
    await User.deleteOne({ roomName, username });

    // Publish user leave event to MQTT
    const leaveEvent = {
      username,
      timestamp: new Date().toISOString(),
      action: 'leave'
    };
    mqttClient.publish(`chat/${roomName}/users/leave`, JSON.stringify(leaveEvent));

    res.json({ success: true, message: 'Left room' });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

// Send a message
app.post('/api/rooms/:roomName/messages', (req, res) => {
  try {
    const { roomName } = req.params;
    const { username, content } = req.body;

    if (!username || !content || !roomName) {
      return res.status(400).json({ error: 'Username, content, and room name required' });
    }

    // Publish message to MQTT
    const messagePayload = {
      username,
      content,
      timestamp: new Date().toISOString()
    };
    mqttClient.publish(`chat/${roomName}/messages`, JSON.stringify(messagePayload));

    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get last 100 messages from a room
app.get('/api/rooms/:roomName/messages', async (req, res) => {
  try {
    const { roomName } = req.params;

    const messages = await Message.find({ roomName })
      .sort({ timestamp: 1 })
      .limit(100)
      .exec();

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get active users in a room
app.get('/api/rooms/:roomName/users', async (req, res) => {
  try {
    const { roomName } = req.params;

    const users = await User.find({ roomName }).select('username joinedAt').exec();

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Backend server running on port ${PORT}`);
});
