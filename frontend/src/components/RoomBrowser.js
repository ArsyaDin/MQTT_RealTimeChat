import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RoomBrowser.css';

const RoomBrowser = ({ onSelectRoom, onCreateRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('lastMessageAt');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, [sortBy]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${window.location.origin}/api/rooms`, {
        params: {
          sort: sortBy,
          order: 'desc',
          limit: 50
        }
      });
      setRooms(response.data.rooms || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="room-browser">
      <div className="browser-header">
        <h2>Available Rooms</h2>
        <button className="create-room-btn" onClick={onCreateRoom}>
          + Create Room
        </button>
      </div>

      <div className="browser-controls">
        <input
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="lastMessageAt">Most Active</option>
          <option value="userCount">Most Users</option>
          <option value="createdAt">Newest</option>
          <option value="messageCount">Most Messages</option>
        </select>
      </div>

      <div className="rooms-list">
        {loading ? (
          <div className="loading">Loading rooms...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredRooms.length === 0 ? (
          <div className="empty">
            <p>No rooms found. Create one to get started!</p>
            <button onClick={onCreateRoom}>Create Room</button>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room._id}
              className="room-card"
              onClick={() => onSelectRoom(room.name)}
            >
              <div className="room-card-header">
                <h3 className="room-name">#{room.name}</h3>
                <span className="room-users">
                  👥 {room.userCount}
                </span>
              </div>
              <p className="room-preview">{room.lastMessagePreview}</p>
              <div className="room-footer">
                <span className="room-time">
                  {formatDate(room.lastMessageAt)}
                </span>
                <span className="room-messages">
                  {room.messageCount} messages
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoomBrowser;
