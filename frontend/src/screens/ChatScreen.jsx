import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';
import { useState } from 'react';

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleInputText = (text) => {
    setInputMessage(text);
  };

  const renderMessage = (props) => {
    const { currentMessage } = props;
    return (
      <View key={currentMessage._id} style={{ marginVertical: 5, alignItems: 'flex-end' }}>
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: 'white',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 10,
              marginRight: 12,
            },
          }}
          textStyle={{
            right: {
              color: 'black',
            },
          }}
        />
        <Text style={{ fontSize: 10, color: 'gray', marginRight: 15 }}>
          {new Date(currentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const submitMessage = () => {
    const message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: {
        _id: 1,
      },
    };

    setMessages((previousMessages) => GiftedChat.append(previousMessages, [message]));
    setInputMessage('');
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
            <View className="h-3 w-3 rounded-full bg-green-500 absolute top-10 right-0 z-50 border border-white"></View>
            <Image
              source={require('../../assets/avatar/user2.jpeg')}
              className="h-14 w-14 rounded-full"
            />
          </View>
          <View className="ml-4">
            <Text className="text-gray-300 font-medium">Anuska Sharmas</Text>
            <Text className="text-gray-500">Online</Text>
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
      <GiftedChat
        messages={messages}
        renderInputToolbar={() => null}
        user={{ _id: 1 }}
        minInputToolbarHeight={0}
        renderMessage={renderMessage}
      />

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
