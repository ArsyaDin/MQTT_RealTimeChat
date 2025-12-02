import React, { useState } from 'react';
import axios from 'axios';
import './JoinScreen.css';

const JoinScreen = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !roomName.trim()) {
      setError('Please enter both username and room name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `/api/rooms/${roomName}/join`,
        { username }
      );

      if (response.data.success) {
        onJoin({ username, roomName });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-container">
      <div className="join-card">
        <h1>💬 MQTT Chat</h1>
        <form onSubmit={handleJoin}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              maxLength="20"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={loading}
              maxLength="30"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
        <p className="hint">Join a room to start chatting!</p>
      </div>
    </div>
  );
};

export default JoinScreen;
