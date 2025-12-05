import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JoinScreen from './components/JoinScreen';
import ChatRoom from './components/ChatRoom';
import './App.css';

function App() {
  const [roomInfo, setRoomInfo] = useState(null);

  useEffect(() => {
    const tryRestoreSession = async () => {
      try {
        const raw = sessionStorage.getItem('chat_session');
        if (!raw) return;
        const session = JSON.parse(raw);
        if (!session || !session.username || !session.roomName) return;

        // Attempt to call join so server refreshes user TTL and room exists
        const resp = await axios.post(`${window.location.origin}/api/rooms/${session.roomName}/join`, {
          username: session.username
        });
        if (resp.data && resp.data.success) {
          setRoomInfo({ username: session.username, roomName: session.roomName });
        } else {
          // cleanup invalid session
          sessionStorage.removeItem('chat_session');
        }
      } catch (err) {
        console.warn('Failed to restore session:', err);
        sessionStorage.removeItem('chat_session');
      }
    };

    tryRestoreSession();
  }, []);

  const handleJoin = (info) => {
    setRoomInfo(info);
  };

  const handleLeave = () => {
    setRoomInfo(null);
  };

  return (
    <div className="app">
      {!roomInfo ? (
        <JoinScreen onJoin={handleJoin} />
      ) : (
        <ChatRoom
          username={roomInfo.username}
          roomName={roomInfo.roomName}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}

export default App;
