import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const SOCKET_URL = 'http://10.0.2.2:3000'; 

let socket;

export const connectSocket = async () => {
  const accessToken = await AsyncStorage.getItem('accessToken'); 

  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
  });

  // Listen for the 'notification' event
  socket.on('notification', (message) => {
    handleNotification(JSON.parse(message));
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Disconnected from socket');
  });

  socket.emit('userOnline', { accessToken });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

const handleNotification = (notification) => {
  Toast.show({
    type: 'success',
    text1: 'New Notification',
    text2: `You have a new ${notification.type === 'reply' ? 'reply' : 'like'} on your post.`,
    visibilityTime: 4000,
    position: 'top',
  });

  console.log('New notification:', notification);
};

export const registerUser = async (userId) => {
  if (socket) {
    socket.emit('register', userId);
  }
};
