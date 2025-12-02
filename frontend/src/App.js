import React, { useState } from 'react';
import JoinScreen from './components/JoinScreen';
import ChatRoom from './components/ChatRoom';
import './App.css';

function App() {
  const [roomInfo, setRoomInfo] = useState(null);

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
