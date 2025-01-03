import {
    ActivityIndicator,
    Image,
    Linking,
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {Bubble, GiftedChat} from 'react-native-gifted-chat';
import {useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import uri from '../../redux/uri';
import Toast from 'react-native-toast-message';
import {SocketContext} from '../components/SocketContext';
import {useDispatch, useSelector} from 'react-redux';
import ImagePicker from "react-native-image-crop-picker";
import RNFS from 'react-native-fs';
import {useStreamVideoClient} from "@stream-io/video-react-native-sdk";

const ChatScreen = ({navigation, route}) => {
    const {userId, userName, userImg} = route.params;
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const {socket} = useContext(SocketContext);
    const {users, newCallMess} = useSelector(state => state.message);
    const dispatch = useDispatch();
    const client = useStreamVideoClient();
    const {user} = useSelector(state => state.user);

    const deleteMessage = (messageId) => {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
    };

    useEffect(() => {
        const updateLastSeen = async () => {
            const token = await AsyncStorage.getItem('token');
            const seenAt = new Date();
            try {
                const res = await axios.post(
                    `${uri}/message/update-seen-status/${userId}`,
                    {lastSeen: seenAt},
                    {
                        headers: {Authorization: `Bearer ${token}`},
                        withCredentials: true
                    }
                );
                if (res.status === 200) {
                    console.log('Seen status updated');
                    dispatch({type: 'updateLastSeenSuccess', payload: {userId, seenAt}});
                } else if (res.status === 404) {
                    console.log('Messages not found');
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: res.response.data.message
                    });
                }
            } catch (error) {
                console.error('Error updating last seen:', error.response?.data?.message || error.message);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.response?.data?.message || error.message
                });
            }
        };

        updateLastSeen();

        return () => {
            updateLastSeen();
        };
    }, [userId, dispatch]);

    useEffect(() => {
        // Fetch messages from the backend
        const fetchMessages = async () => {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true
                };
                const {data} = await axios.get(
                    `${uri}/message/get-messages-by-user-ids/${userId}`,
                    config
                );
                // check status code
                if (data.status === 404) {
                    return;
                }

                // clear viewed messages in gift chat
                if (messages.length > 0) {
                    for (let i = 0; i < messages.length; i++) {
                        deleteMessage(messages[i]._id);
                    }
                    setMessages([]);
                }

                for (let i = 0; i < data.length; i++) {
                    let message = {
                        _id: data[i]._id,
                        text: data[i].content,
                        createdAt: new Date(data[i].created_at),
                        user: {
                            _id: data[i].receiver_id
                        }
                    };

                    if (data[i].type === 'image') {
                        message.image = {
                            uri: data[i].content
                        };
                    }
                    setMessages((previousMessages) => GiftedChat.append(previousMessages, [message]));
                }

                setIsLoading(false);
            } catch (error) {
                if (error.response.status === 404) {
                    console.log('No messages found');
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: error.response.data.message
                    });
                }
                setIsLoading(false);
            }
        };

        fetchMessages();

        socket.on('receiveMessage', (message) => {
            console.log('Receive message:', message);
            setMessages((previousMessages) => GiftedChat.append(previousMessages, [message]));
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, [socket]);

    useEffect(() => {
        if (newCallMess) {
            setMessages((previousMessages) => GiftedChat.append(previousMessages, [newCallMess]));
        }
    }, [newCallMess]);

    const handleInputText = (text) => {
        setInputMessage(text);
    };

    const pickImage = async () => {
        setIsImageLoading(true);
        const result = await ImagePicker.openPicker({
            cropping: true,
            includeBase64: true,
            multiple: false,
        });

        if (result) {
            const imageSize = result.size / 1024 / 1024;
            if (imageSize > 5) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Image size should not exceed 5MB'
                });
                setIsImageLoading(false);
                return;
            }

            const imageData = {
                uri: result.path,
                type: result.mime,
                name: result.path.split('/').pop(),
                base64: `data:${result.mime};base64,${result.data}`
            }

            setSelectedImage(imageData);
        }
        // const result = await launchImageLibrary({
        //   mediaType: 'photo',
        //   includeBase64: true,
        //   quality: 0.8,
        // });
        // if (!result.didCancel && result.assets?.[0]) {
        //   const image = result.assets[0];
        //   const base64 = `data:${image.type};base64,${image.base64}`;
        //   const imageName = image.fileName;
        //   const imageType = image.type.split('/')[0];
        //
        //   const imageData = {
        //     uri: image.uri,
        //     type: imageType,
        //     name: imageName,
        //     base64: base64
        //   }
        //
        //   setSelectedImage(imageData);
        // }
        setIsImageLoading(false);
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android' && parseInt(Platform.Version, 10) >= 29) {
            try {
                const permissionGranted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                );

                console.log('Permission granted:', permissionGranted);

                if (!permissionGranted) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                        {
                            title: 'Storage Permission',
                            message: 'This app needs access to your storage to download images.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        }
                    );

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        ToastAndroid.show('Storage permission denied.', ToastAndroid.LONG);
                        await Linking.openSettings();
                        return false;
                    }
                }
                return true;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };


    const downloadImage = async (imageUri) => {
        try {
            const permissionGranted = await requestStoragePermission();
            if (!permissionGranted) {
                return;
            }

            const fileName = imageUri.split('/').pop();
            const downloadDest = `${RNFS.ExternalStorageDirectoryPath}/DCIM/Camera/${fileName}`;
            await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}/DCIM/Camera`).catch(err => {
                console.log('Thư mục đã tồn tại hoặc không thể tạo:', err);
            });
            const options = {
                fromUrl: imageUri,
                toFile: downloadDest,
            };
            const result = await RNFS.downloadFile(options).promise;

            if (Platform.OS === 'android') {
                await RNFS.scanFile(downloadDest);
            }

            if (result.statusCode === 200) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Image downloaded successfully'
                });
            } else {
                throw new Error('Failed to download image');
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message
            });
        }
    };

    const renderMessage = (props) => {
        const {currentMessage} = props;
        const isCurrentUser = currentMessage.user._id === userId;
        return (
            <View key={currentMessage._id}
                  style={{
                      marginVertical: 5,
                      alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
                  }}
            >

                {currentMessage.image ? (
                    <View>
                        <Image
                            source={{uri: currentMessage.image.uri}}
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: 10,
                                marginBottom: 5,
                                marginRight: isCurrentUser ? 0 : 10,
                                marginLeft: isCurrentUser ? 10 : 0
                            }}
                        />
                        <TouchableOpacity onPress={() => downloadImage(currentMessage.image.uri)}>
                            <Text style={{color: 'white', textAlign: 'center'}}>Download</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Bubble
                        {...props}
                        position={isCurrentUser ? 'right' : 'left'}
                        wrapperStyle={{
                            left: {
                                backgroundColor: 'gray',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 10,
                                marginLeft: 12,
                                marginBottom: 6
                                // hide time on left side
                            },
                            right: {
                                backgroundColor: 'white',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 10,
                                marginRight: 12,
                                marginBottom: 6
                            }
                        }}
                        textStyle={{
                            left: {
                                color: 'white'
                            },
                            right: {
                                color: 'black'
                            }
                        }}
                    />
                )}

                <Text style={{
                    fontSize: 10,
                    color: isCurrentUser ? 'gray' : 'white',
                    marginRight: isCurrentUser ? 15 : 0,
                    marginLeft: !isCurrentUser ? 15 : 0
                }}>
                    {new Date(currentMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                </Text>
            </View>
        );
    };

    const formatDate = (date) => {
        const isoString = new Date(date).toISOString();
        return isoString.replace('T', ' ').substring(0, 19);
    };

    const submitMessage = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            let message = {
                _id: Math.random().toString(36).substring(7),
                text: inputMessage,
                type: 'text',
                image: selectedImage ? selectedImage : null,
                createdAt: formatDate(new Date()),
                user: {
                    _id: userId
                },
                accessToken: token
            };

            if (selectedImage) {
                message = {
                    _id: Math.random().toString(36).substring(7),
                    type: 'image',
                    image: selectedImage ? selectedImage : null,
                    createdAt: formatDate(new Date()),
                    user: {
                        _id: userId
                    },
                    accessToken: token
                };
            }

            // Send message to the backend through socket
            socket.emit('sendMessage', message);

            // store message in the redux store
            dispatch({type: 'sendMessage', payload: message});

            setMessages((previousMessages) => GiftedChat.append(previousMessages, [message]));
            setInputMessage('');
            setSelectedImage(null);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response.data.message
            });
        }
    };

    const joinVideoCall = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.post(
                `${uri}/message/join-call`,
                {receiverId: userId, callType: 'video'},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        withCredentials: true
                    }
                }
            );
            if (response.status === 200) {
                const _call = client?.call('default', response.data.callId);

                await _call?.getOrCreate({
                    data: {
                        members: [
                            {user_id: user._id.toString()},
                            {user_id: userId.toString()},
                        ],
                        settings_override: {
                            ring: {
                                auto_cancel_timeout_ms: 30000,
                                incoming_call_timeout_ms: 5000,
                            },
                        }
                    },
                    ring: true,
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || error.message
            });
            console.error('Error joining video call:', error.response?.data?.message || error.message);
        }
    };

    const joinVoiceCall = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.post(
                `${uri}/message/join-call`,
                {receiverId: userId, callType: 'voice'},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        withCredentials: true
                    }
                }
            );
            console.log(response);
            if (response.status === 200) {
                const _call = client?.call('default', response.data.callId);

                await _call?.getOrCreate({
                    data: {
                        members: [
                            {user_id: user._id.toString()},
                            {user_id: userId.toString()},
                        ],
                        settings_override: {
                            ring: {
                                auto_cancel_timeout_ms: 30000,
                                incoming_call_timeout_ms: 5000,
                            },
                            audio: {
                                mic_default_on: true,
                                speaker_default_on: true,
                                default_device: "speaker"
                            },
                            video: {
                                enabled: false,
                                camera_default_on: false,
                                target_resolution: {
                                    width: 240,
                                    height: 240,
                                    bitrate: 0
                                }
                            }
                        }
                    },
                    ring: true,
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.data.message
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response.data.message || error.message
            });
            console.error('Error joining voice call:', error.response.data.message || error.message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-900">
            {/* Header */}
            <View className="flex-row justify-between p-4 border border-b-gray-500">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mx-[12px]">
                        <Ionicons name="arrow-back" size={24} color="white"/>
                    </TouchableOpacity>
                    <View>
                        <View
                            className={`h-3 w-3 rounded-full absolute top-10 right-0 z-50 border border-white ${users.find(u => u.id === userId).isOnline ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        <Image
                            source={userImg ? {uri: userImg} : require('../../assets/images/avatar.jpg')}
                            className="h-14 w-14 rounded-full"
                        />
                    </View>
                    <View className="ml-4">
                        <Text className="text-gray-300 font-medium">{userName}</Text>
                        <Text
                            className="text-gray-500">{users.find(u => u.id === userId).isOnline ? 'Online' : 'Offline'}</Text>
                    </View>
                </View>

                <View className="flex-row items-center p-4">
                    <TouchableOpacity className="mx-5" onPress={joinVideoCall}>
                        <Feather name="video" size={24} color="white"/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={joinVoiceCall}>
                        <Feather name="phone" size={24} color="white"/>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Render Chat */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#ffffff"/>
                </View>
            ) : (
                // check if messages is empty
                messages.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-white">No messages yet</Text>
                    </View>
                ) : (
                    // render messages
                    <GiftedChat
                        messages={messages}
                        renderInputToolbar={() => null}
                        renderTime={() => null}
                        user={{_id: userId}}
                        minInputToolbarHeight={0}
                        renderMessage={renderMessage}
                    />
                )
            )}

            {/* Input Bar */}
            <View className="bg-zinc-900 h-18 items-center justify-center">
                {selectedImage && (
                    <View className="w-full relative bg-gray-300 p-2 rounded-xl mb-2"
                          style={{backgroundColor: 'rgba(128, 128, 128, 0.5)'}}>
                        <Image
                            source={{uri: selectedImage.uri}}
                            style={{width: 50, height: 50, borderRadius: 10}}
                        />
                        <TouchableOpacity
                            onPress={() => setSelectedImage(null)} // Xóa ảnh khi nhấn vào dấu "x"
                            style={{
                                position: 'absolute',
                                top: 5,
                                right: 5,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                borderRadius: 12,
                                padding: 5
                            }}
                        >
                            <Ionicons name="close-circle" size={20} color="white"/>
                        </TouchableOpacity>
                        {isImageLoading && (
                            <ActivityIndicator
                                size="small"
                                color="#ffffff"
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: [{translateX: -12}, {translateY: -12}]
                                }}
                            />
                        )}
                    </View>
                )}
                <View className="h-18 w-[400px] flex-row justify-center items-center border rounded-xl bg-neutral-600">
                    <TouchableOpacity className="px-2" onPress={pickImage}>
                        <Ionicons name="image-outline" size={24} color="white"/>
                    </TouchableOpacity>
                    <TextInput
                        className="text-white flex-1 px-4"
                        placeholder="Type here"
                        placeholderTextColor="white"
                        value={inputMessage}
                        onChangeText={handleInputText}
                    />
                    <TouchableOpacity className="px-4" onPress={submitMessage}>
                        <Feather name="send" size={24} color="white"/>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ChatScreen;
