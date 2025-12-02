import React, { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import axios from 'axios';
import './ChatRoom.css';

const ChatRoom = ({ username, roomName, onLeave }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mqttClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat room
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        // Fetch last 100 messages
        const messagesRes = await axios.get(`/api/rooms/${roomName}/messages`);
        setMessages(messagesRes.data.messages);

        // Fetch active users
        const usersRes = await axios.get(`/api/rooms/${roomName}/users`);
        setUsers(usersRes.data.users);

        // Connect to MQTT
        const backendUrl = window.location.origin;
        const mqttBrokerUrl = `ws://${window.location.hostname}:9001`;

        const client = mqtt.connect(mqttBrokerUrl, {
          clientId: `client_${username}_${Date.now()}`,
          clean: true,
          reconnectPeriod: 5000
        });

        client.on('connect', () => {
          console.log('Connected to MQTT');
          // Subscribe to room topics
          client.subscribe(`chat/${roomName}/messages`);
          client.subscribe(`chat/${roomName}/users/join`);
          client.subscribe(`chat/${roomName}/users/leave`);
        });

        client.on('message', (topic, payload) => {
          try {
            const message = JSON.parse(payload.toString());

            if (topic === `chat/${roomName}/messages`) {
              // Add new message
              setMessages((prev) => [...prev, {
                _id: Date.now(),
                username: message.username,
                content: message.content,
                timestamp: new Date(message.timestamp)
              }]);
            } else if (topic === `chat/${roomName}/users/join`) {
              // Refresh users list
              fetchUsers();
            } else if (topic === `chat/${roomName}/users/leave`) {
              // Refresh users list
              fetchUsers();
            }
          } catch (err) {
            console.error('Error processing message:', err);
          }
        });

        client.on('error', (err) => {
          console.error('MQTT error:', err);
          setError('Connection error. Trying to reconnect...');
        });

        mqttClientRef.current = client;
        setLoading(false);
      } catch (err) {
        setError('Failed to load room');
        setLoading(false);
      }
    };

    initializeRoom();

    // Cleanup on component unmount
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
      }
    };
  }, [roomName, username]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/api/rooms/${roomName}/users`);
      setUsers(res.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    try {
      await axios.post(`/api/rooms/${roomName}/messages`, {
        username,
        content: messageInput.trim()
      });
      setMessageInput('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleLeave = async () => {
    try {
      await axios.post(`/api/rooms/${roomName}/leave`, { username });
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
      }
      onLeave();
    } catch (err) {
      console.error('Error leaving room:', err);
    }
  };

  const handleWindowClose = async () => {
    try {
      await axios.post(`/api/rooms/${roomName}/leave`, { username });
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
      }
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  };

  // Handle page close/unload
  useEffect(() => {
    window.addEventListener('beforeunload', handleWindowClose);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
    };
  }, [roomName, username]);

  if (loading) {
    return <div className="chat-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <h2>#{roomName}</h2>
          <span className="user-count">👥 {users.length} online</span>
        </div>
        <button className="leave-btn" onClick={handleLeave}>Leave</button>
      </div>

      <div className="chat-main">
        <div className="messages-section">
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-messages">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={`message ${msg.username === username ? 'own' : 'other'}`}
                >
                  <div className="message-header">
                    <span className="username">{msg.username}</span>
                    <span className="timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">{msg.content}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              maxLength="500"
            />
            <button type="submit">Send</button>
          </form>
        </div>

        <div className="users-sidebar">
          <div className="sidebar-header">Active Users</div>
          <div className="users-list">
            {users.map((user, idx) => (
              <div key={idx} className={`user-item ${user.username === username ? 'current' : ''}`}>
                <span className="user-indicator">●</span>
                <span className="user-name">{user.username}</span>
                {user.username === username && <span className="you-badge">You</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
