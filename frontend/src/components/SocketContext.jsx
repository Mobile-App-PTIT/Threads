import React, { createContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const setupSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      const newSocket = io('http://10.0.2.2:3000', {
        query: { token }
      });
      setSocket(newSocket);

      newSocket.on('notification', (message) => {
        console.log('Received notification:', message);
        // Handle the notification message as needed
      });

      newSocket.on('online', (userId) => {
        console.log('User online:', userId);
        dispatch({ type: 'online', payload: userId });
      });

      newSocket.on('offline', (userId) => {
        console.log('User offline:', userId);
        dispatch({ type: 'offline', payload: userId });
      });

      newSocket.on('newLastMessage', (message) => {
        console.log('New message:', message);
        dispatch({ type: 'newLastMessage', payload: message });
      });

      const handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'inactive' || nextAppState === 'background') {
          console.log('[Client] Close socket connection');
          newSocket.emit('disconnect');
          newSocket.close();
        }
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        newSocket.off('notification');
        newSocket.off('online');
        newSocket.off('offline');
        newSocket.off('newLastMessage');
        newSocket.close();
        subscription.remove();
      };
    };

    setupSocket();
  }, [dispatch]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};