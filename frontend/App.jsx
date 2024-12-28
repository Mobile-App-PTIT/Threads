import './global.css';
import React, {useContext, useEffect} from 'react';
import Auth from './src/navigation/Auth';
import Main from './src/navigation/Main';
import Store from './redux/store';
import {Alert, SafeAreaView, StyleSheet, Text} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {SocketContext, SocketProvider} from './src/components/SocketContext';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import uri from './redux/uri';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    CallingState,
    RingingCallContent,
    StreamCall,
    StreamVideo,
    useCall,
    useCalls,
    useCallStateHooks,
    useConnectedUser
} from "@stream-io/video-react-native-sdk";

const CallContent = () => {
    const call = useCall();
    const {useCallCallingState, useCallMembers} = useCallStateHooks();
    const callingState = useCallCallingState();
    const {socket} = useContext(SocketContext);
    const dispatch = useDispatch();
    const members = useCallMembers();
    const connectedUser = useConnectedUser();


    const formatDate = (date) => {
        const isoString = new Date(date).toISOString();
        return isoString.replace('T', ' ').substring(0, 19);
    };

    useEffect(() => {
        const leftCall = async () => {
            if (callingState === CallingState.LEFT) {
                call?.endCall();
                Alert.alert('Thông báo', 'Cuộc gọi đã kết thúc');
                if (call?.isCreatedByMe) {
                    const otherMember = members
                        .map(({user}) => user)
                        .filter((user) => user.id !== connectedUser?.id)[0];

                    const otherUserId = otherMember?.id;
                    const token = await AsyncStorage.getItem('token');
                    const message = {
                        _id: Math.random().toString(36).substring(7),
                        text: 'The call has ended',
                        type: 'call',
                        createdAt: formatDate(new Date()),
                        user: {
                            _id: otherUserId
                        },
                        accessToken: token
                    };
                    socket.emit('sendMessage', message);
                    dispatch({type: 'sendMessage', payload: message});
                }
            }
        }

        leftCall();
    }, [callingState, call]);

    return <RingingCallContent/>;
};

const RingingCalls = () => {
    // filter for ringing calls
    const calls = useCalls().filter((c) => c.ringing);
    const call = calls[0];

    if (!call) return null;

    return (
        <StreamCall call={call}>
            <SafeAreaView style={StyleSheet.absoluteFill}>
                <CallContent/>
            </SafeAreaView>
        </StreamCall>
    );
};

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
                <AppStack/>
                {/*<Toast ref={(ref) => Toast.setRef(ref)} />*/}
                <Toast/>
            </NavigationContainer>
        </Provider>
    );
}

const AppStack = () => {
    const {isAuthenticated, isLoading, user, streamClient} = useSelector(state => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        // Yêu cầu quyền nhận thông báo
        const requestPermission = async () => {
            try {
                const authStatus = await messaging().requestPermission();
                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
                if (enabled) {

                    // Push notification example
                    // PushNotification.localNotification({
                    //   channelId: 'default_channel', // ID kênh phải trùng
                    //   title: 'Welcome', // Tiêu đề thông báo
                    //   message: 'Welcome to the app', // Nội dung thông báo
                    //   bigText: 'Welcome to the app', // Nội dung thông báo chi tiết
                    //   playSound: true, // Cho phép phát âm thanh
                    //   soundName: 'default', // Tên âm thanh mặc định
                    //   priority: 'high' // Độ ưu tiên thông báo
                    // })

                    if (isAuthenticated) {
                        // Lấy token FCM từ server
                        const token = await AsyncStorage.getItem('token');

                        const config = {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        };
                        const tokenFCM = await messaging().getToken();
                        console.log('Token:', tokenFCM);
                        const response = await axios.post(`${uri}/auth/fcm-token`, {fcmToken: tokenFCM}, config);

                        messaging().onTokenRefresh(async token => {
                            console.log('Token refreshed:', token);
                            if (isAuthenticated) {
                                const token = await AsyncStorage.getItem('token');
                                const config = {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`
                                    }
                                }
                                await axios.post(`${uri}/auth/fcm-token`, {fcmToken: token}, config);
                            }
                        });
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
            streamClient?.disconnectUser();
            dispatch({type: 'getStreamClient', payload: null});
        };
    }, [isAuthenticated]);

    if (isLoading) {
        return <Text className="text-black">Loading</Text>;
    }

    return isAuthenticated && streamClient ? (
        <SocketProvider>
            <StreamVideo client={streamClient}>
                <Main/>
                <RingingCalls/>
            </StreamVideo>
        </SocketProvider>
    ) : (
        <Auth/>
    );
};

export default App;
