import React, { createContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import io from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('notification', (message) => {
      console.log('Received notification:', message);
      // Handle the notification message as needed
    });

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        newSocket.close();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      newSocket.off('notification');
      newSocket.close();
      subscription.remove();
    };
  }, []);

  const notifyOnlineStatus = (accessToken) => {
    if (socket) {
      socket.emit('userOnline', { accessToken });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifyOnlineStatus }}>
      {children}
    </SocketContext.Provider>
  );
};