import React, { createContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import io from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const { users } = useSelector(state => state.message);

  useEffect(() => {
    const newSocket = io('http://10.0.2.2:3000');
    setSocket(newSocket);

    newSocket.on('notification', (message) => {
      console.log('Received notification:', message);
      // Handle the notification message as needed
    });

    newSocket.on('getFollowingAndFollowers', (data) => {
      if (JSON.stringify(data) !== JSON.stringify(users)) {
        dispatch({ type: 'getFollowingAndFollowersSuccess', payload: data });
      }
    });

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        newSocket.emit('disconnect');
        newSocket.close();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      newSocket.off('notification');
      newSocket.off('getFollowingAndFollowers');
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