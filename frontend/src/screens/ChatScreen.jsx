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
import { useSelector } from 'react-redux';

const ChatScreen = ({ navigation, route }) => {
  const { userId, userName, userImg } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useContext(SocketContext);
  const { users } = useSelector(state => state.message);

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

        for (let i = 0; i < data.length; i++) {
          const message = {
            _id: data[i]._id,
            text: data[i].content,
            createdAt: new Date(data[i].created_at),
            user: {
              _id: data[i].sender_id
            }
          };
          setMessages((previousMessages) => GiftedChat.append(previousMessages, [message]));
        }

        setIsLoading(false);

        // Update seen status
        const seenAt = new Date();
        const res = await axios.post(
          `${uri}/message/update-seen-status/${userId}`,
          { seenAt },
          config
        );
        if (res.status === 200) {
          console.log('Seen status updated');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: res.response.data.message
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response.data.message
        });
        setIsLoading(false);
      }
    };

    fetchMessages();

    socket.on('receiveMessage', (message) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, [message]));
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [socket]);

  const handleInputText = (text) => {
    setInputMessage(text);
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

  const submitMessage = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const message = {
        _id: Math.random().toString(36).substring(7),
        text: inputMessage,
        createdAt: new Date(),
        user: {
          _id: userId
        },
        accessToken: token
      };

      // Send message to the backend through socket
      socket.emit('sendMessage', message);

      setMessages((previousMessages) => GiftedChat.append(previousMessages, [message]));
      setInputMessage('');
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
        <View className="h-18 w-[400px] flex-row justify-center items-center border rounded-xl bg-neutral-600">
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
