import './global.css';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import Auth from './src/navigation/Auth';
import Main from './src/navigation/Main';
import Store from './redux/store';
import { Provider, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SocketProvider } from './src/components/SocketContext';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import uri from './redux/uri';
import PushNotification from 'react-native-push-notification';

function App() {
  // useEffect(() => {
  //   connectSocket();
  //
  //   return () => {
  //     disconnectSocket();
  //   };
  // }, []);

  return (
    <Provider store={Store}>
      <NavigationContainer>
        <AppStack />
        {/*<Toast ref={(ref) => Toast.setRef(ref)} />*/}
        <Toast />
      </NavigationContainer>
    </Provider>
  );
}

const AppStack = () => {
  const { isAuthenticated, isLoading } = useSelector(state => state.user);
  const [isLogin, setIsLogin] = useState(true);



  useEffect(() => {
    // Yêu cầu quyền nhận thông báo
    const requestPermission = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          console.log('Authorization status:', authStatus);
          // Push notification example
          PushNotification.localNotification({
            channelId: 'default_channel', // ID kênh phải trùng
            title: 'Welcome', // Tiêu đề thông báo
            message: 'Welcome to the app', // Nội dung thông báo
            bigText: 'Welcome to the app', // Nội dung thông báo chi tiết
            playSound: true, // Cho phép phát âm thanh
            soundName: 'default', // Tên âm thanh mặc định
            priority: 'high' // Độ ưu tiên thông báo
          })
          if (isAuthenticated) {
            // Lấy token FCM từ server
            const data = await axios.get(`${uri}/auth/fcm-token`);
            const status = data.status;
            if (status === 200 && data.data.fcmToken === '') {
              const token = await messaging().getToken();
              console.log('Token:', token);
              const response = await axios.post(`${uri}/auth/fcm-token`, { fcmToken: token });
            }
          }
        }
      } catch (error) {
        console.log('Error:', error);
      }
    };

    requestPermission();

    // Nhận thông báo khi app đang chạy
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('Notification in foreground:', remoteMessage);

      // Hiển thị thông báo cục bộ
      Toast.show({
        type: 'success',
        text1: remoteMessage.notification?.title || 'Notification',
        text2: remoteMessage.notification?.body || 'You have a new message!',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
        position: 'top',
        onPress: () => {
          console.log('Toast clicked');
        }
      });
    });

    const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async token => {
      console.log('Token refreshed:', token);
      if (isAuthenticated) {
        await axios.post(`${uri}/auth/fcm-token`, { fcmToken: token });
      }
    });

    // Nhận thông báo khi app bị tắt
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Notification in background:', remoteMessage);

      // Hiển thị thông báo trong nền
      PushNotification.localNotification({
        channelId: 'default_channel', // ID kênh phải trùng
        title: remoteMessage.notification?.title || 'Notification',
        message: remoteMessage.notification?.body || 'You have a new message!',
        bigText: remoteMessage.notification?.body || 'You have a new message!',
        playSound: true,
        soundName: 'default',
        priority: 'high'
      });
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnTokenRefresh();
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return <Text className="text-black">Loading</Text>;
  }

  return isAuthenticated ? (
    <SocketProvider>
      <Main />
    </SocketProvider>
  ) : (
    <Auth />
  );
};

export default App;
