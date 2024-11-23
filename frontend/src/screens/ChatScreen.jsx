import { ActivityIndicator, Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import uri from '../../redux/uri';
import Toast from 'react-native-toast-message';
import { SocketContext } from '../components/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';

const ChatScreen = ({ navigation, route }) => {
  const { userId, userName, userImg } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { socket } = useContext(SocketContext);
  const { users } = useSelector(state => state.message);
  const dispatch = useDispatch();

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
          { lastSeen: seenAt },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );
        if (res.status === 200) {
          console.log('Seen status updated');
          dispatch({ type: 'updateLastSeenSuccess', payload: { userId, seenAt } });
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
        const { data } = await axios.get(
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
          const message = {
            _id: data[i]._id,
            text: data[i].content,
            createdAt: new Date(data[i].created_at),
            user: {
              _id: data[i].receiver_id
            }
          };
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

  const handleInputText = (text) => {
    setInputMessage(text);
  };

  const pickImage = async () => {
    setIsImageLoading(true);
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets?.[0]) {
      const image = result.assets[0];
      setSelectedImage(image.uri);
    }
    setIsImageLoading(false);
  };


  const renderMessage = (props) => {
    const { currentMessage } = props;
    const isCurrentUser = currentMessage.user._id === userId;
    return (
      <View key={currentMessage._id}
            style={{
              marginVertical: 5,
              alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
            }}
      >

        {currentMessage.image ? (
          <Image
            source={{ uri: currentMessage.image }}
            style={{
              width: 200,
              height: 200,
              borderRadius: 10,
              marginBottom: 5,
              marginRight: isCurrentUser ? 0 : 10,
              marginLeft: isCurrentUser ? 10 : 0
            }}
          />
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
          {new Date(currentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const formatDate = (date) => {
    const isoString = new Date(date).toISOString();
    return isoString.replace('T', ' ').substring(0, 19);
  };

  const uriToBase64 = (uri) => {
    return new Promise((resolve, reject) => {
      const fetchImage = async () => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);
      };

      fetchImage();
    });
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
          content: await uriToBase64(selectedImage),
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
      dispatch({ type: 'sendMessage', payload: message });

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

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      {/* Header */}
      <View className="flex-row justify-between p-4 border border-b-gray-500">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mx-[12px]">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <View
              className={`h-3 w-3 rounded-full absolute top-10 right-0 z-50 border border-white ${users.find(u => u.id === userId).isOnline ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <Image
              source={userImg ? { uri: userImg } : require('../../assets/images/avatar.jpg')}
              className="h-14 w-14 rounded-full"
            />
          </View>
          <View className="ml-4">
            <Text className="text-gray-300 font-medium">{userName}</Text>
            <Text className="text-gray-500">{users.find(u => u.id === userId).isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>

        <View className="flex-row items-center p-4">
          <TouchableOpacity className="mx-5">
            <Feather name="video" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="phone" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Render Chat */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ffffff" />
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
            user={{ _id: userId }}
            minInputToolbarHeight={0}
            renderMessage={renderMessage}
          />
        )
      )}

      {/* Input Bar */}
      <View className="bg-zinc-900 h-18 items-center justify-center">
        {selectedImage && (
          <View className="w-full relative bg-gray-300 p-2 rounded-xl mb-2"
                style={{ backgroundColor: 'rgba(128, 128, 128, 0.5)' }}>
            <Image
              source={{ uri: selectedImage }}
              style={{ width: 50, height: 50, borderRadius: 10 }}
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
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
            {isImageLoading && (
              <ActivityIndicator
                size="small"
                color="#ffffff"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: [{ translateX: -12 }, { translateY: -12 }]
                }}
              />
            )}
          </View>
        )}
        <View className="h-18 w-[400px] flex-row justify-center items-center border rounded-xl bg-neutral-600">
          <TouchableOpacity className="px-2" onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="white" />
          </TouchableOpacity>
          <TextInput
            className="text-white flex-1 px-4"
            placeholder="Type here"
            placeholderTextColor="white"
            value={inputMessage}
            onChangeText={handleInputText}
          />
          <TouchableOpacity className="px-4" onPress={submitMessage}>
            <Feather name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
