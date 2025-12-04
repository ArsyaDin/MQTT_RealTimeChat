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
  const [chatHistoryLoaded, setChatHistoryLoaded] = useState(false);
  const mqttClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history on room join
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        // Use window.location.origin for backend API calls (respects current page origin)
        const messagesRes = await axios.get(`${window.location.origin}/api/rooms/${roomName}/messages`);
        setMessages(messagesRes.data.messages || []);

        const usersRes = await axios.get(`${window.location.origin}/api/rooms/${roomName}/users`);
        setUsers(usersRes.data.users || []);

        setChatHistoryLoaded(true);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError('Failed to load chat history');
        setChatHistoryLoaded(true); // Allow MQTT to connect even if history fails
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [roomName]);

  // Establish MQTT connection after chat history loads
  useEffect(() => {
    if (!chatHistoryLoaded) return;

    // Construct MQTT WebSocket URL properly
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const mqttBrokerUrl = `${protocol}://${window.location.hostname}:9001`;

    console.log('🔌 Attempting MQTT connection');
    console.log('   URL:', mqttBrokerUrl);
    console.log('   Hostname:', window.location.hostname);
    console.log('   Port: 9001');
    console.log('   Protocol:', protocol);

    const client = mqtt.connect(mqttBrokerUrl, {
      clientId: `mqtt_${username}_${Date.now()}`,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30000,
      keepalive: 60
    });

    client.on('connect', () => {
      console.log('✅ MQTT Connected successfully');
      client.subscribe(`chat/${roomName}/messages`, (err) => {
        if (err) console.error('Subscribe error:', err);
        else console.log('✅ Subscribed to messages');
      });
      client.subscribe(`chat/${roomName}/users/join`, (err) => {
        if (err) console.error('Subscribe error:', err);
        else console.log('✅ Subscribed to join events');
      });
      client.subscribe(`chat/${roomName}/users/leave`, (err) => {
        if (err) console.error('Subscribe error:', err);
        else console.log('✅ Subscribed to leave events');
      });
    });

    client.on('message', async (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());

        if (topic === `chat/${roomName}/messages`) {
          setMessages((prev) => [...prev, data]);
        } else if (topic === `chat/${roomName}/users/join`) {
          setUsers((prev) => [...new Set([...prev, data.username])]);
        } else if (topic === `chat/${roomName}/users/leave`) {
          setUsers((prev) => prev.filter((u) => u !== data.username));
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });

    client.on('error', (err) => {
      console.error('❌ MQTT Error:', err);
      console.error('   Error code:', err.code);
      console.error('   Error message:', err.message);
      setError('Cannot connect to chat broker - Check network connection');
    });

    client.on('offline', () => {
      console.warn('⚠️ MQTT offline - reconnecting...');
    });

    client.on('close', () => {
      console.log('🔌 MQTT connection closed');
    });

    mqttClientRef.current = client;

    // Cleanup
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
      }
    };
  }, [roomName, username, chatHistoryLoaded]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    try {
      await axios.post(`${window.location.origin}/api/rooms/${roomName}/messages`, {
        username,
        content: messageInput.trim()
      });
      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleLeave = async () => {
    try {
      await axios.post(`${window.location.origin}/api/rooms/${roomName}/leave`, { username });
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
      await axios.post(`${window.location.origin}/api/rooms/${roomName}/leave`, { username });
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
