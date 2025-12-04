import React, { useState } from 'react';
import axios from 'axios';
import RoomBrowser from './RoomBrowser';
import './JoinScreen.css';

const JoinScreen = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBrowser, setShowBrowser] = useState(false);

  const handleJoin = async (e, selectedRoom = null) => {
    e.preventDefault();
    setError('');

    const finalRoom = selectedRoom || roomName;

    if (!username.trim() || !finalRoom.trim()) {
      setError('Please enter both username and room name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${window.location.origin}/api/rooms/${finalRoom}/join`,
        { username }
      );

      if (response.data.success) {
        onJoin({ username, roomName: finalRoom });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (room) => {
    setRoomName(room);
    setShowBrowser(false);
    if (username.trim()) {
      handleJoin(
        { preventDefault: () => {} },
        room
      );
    }
  };

  if (showBrowser) {
    return (
      <div className="join-container">
        <div className="browser-wrapper">
          <div className="username-bar">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              maxLength="20"
              className="username-input"
            />
            <button
              onClick={() => setShowBrowser(false)}
              className="back-btn"
            >
              ← Back
            </button>
          </div>
          <RoomBrowser
            onSelectRoom={handleSelectRoom}
            onCreateRoom={() => {
              setShowBrowser(false);
              setRoomName('');
            }}
          />
        </div>
      </div>
    );
  }

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
              placeholder="Enter room name or browse..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={loading}
              maxLength="30"
              onFocus={() => {
                if (!roomName) setShowBrowser(true);
              }}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Joining...' : 'Join Room'}
          </button>
          {username && (
            <button
              type="button"
              onClick={() => setShowBrowser(true)}
              className="browse-btn"
            >
              Browse Available Rooms
            </button>
          )}
        </form>
        <p className="hint">Join a room to start chatting!</p>
      </div>
    </div>
  );
};

export default JoinScreen;
