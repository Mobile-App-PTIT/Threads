/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

// Check if the channel already exists
PushNotification.channelExists('default_channel', (exists) => {
    if (!exists) {
        // Create the channel if it does not exist
        PushNotification.createChannel(
            {
                channelId: 'default_channel', // ID of the channel
                channelName: 'Default Channel', // Name of the channel
                channelDescription: 'A default channel for notifications', // Description of the channel (optional)
                soundName: 'default', // Default sound (optional)
                importance: PushNotification.Importance.HIGH, // Importance of the notification
                vibrate: true // Enable vibration
            },
            (created) => console.log(`CreateChannel returned '${created}'`) // Log the result of channel creation
        );
    } else {
        console.log('Channel already exists');
    }
});

// Xử lý thông báo trong nền
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Notification received in background:', remoteMessage);

  // Hiển thị thông báo cục bộ
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

AppRegistry.registerComponent(appName, () => App);
