import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useContext, useEffect, useState } from 'react';
import { messsagesData } from '../../assets';
import { SocketContext } from '../components/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';

const ListMessageScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector(state => state.message);
  const { socket } = useContext(SocketContext);
  const [search, setSearch] = useState('');
  // const [data, setData] = useState(users);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        socket.emit('getList', token);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();

    socket.on('getFollowingAndFollowers', (data) => {
      console.log('[Client] Get following and followers');
      if (JSON.stringify(data) !== JSON.stringify(users)) {
        dispatch({ type: 'getFollowingAndFollowersSuccess', payload: data });
        console.log('Data:', data);
      }
    });

    return () => {
      socket.off('getFollowingAndFollowers');
    };
  }, [socket, dispatch]);

  const handleSearch = text => {
    setSearch(text);
    if (text.length > 0) {
      const filteredData = messsagesData.filter(item => {
        return item.fullName.toLowerCase().includes(text.toLowerCase());
      });

      // setData(filteredData);
    } else {
      // setData(messsagesData);
    }
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        className="flex-row w-full items-center justify-between"
        key={index}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            userId: item.id,
            userName: item.fullName,
            userImg: item.userImg
          })
        }>
        {/*   style={[styles.userContainer, index % 2 !== 0 ? styles.background: null]} */}
        <View className="py-4">
          {item.isOnline && item.isOnline === true && (
            <View className="h-5 w-5 rounded-full bg-green-500 absolute top-4 right-0 z-50 border border-white"></View>
          )}
          <Image
            source={item.userImg ? { uri: item.userImg } : require('../../assets/images/avatar.jpg')}
            resizeMode="contain"
            className="h-20 w-20 rounded-full"
          />
        </View>
        <View className="flex-row w-[280px]">
          <View className="flex-col">
            <Text className="text-gray-300 font-semibold mb-1 text-[14px]">
              {item.fullName}
            </Text>
            <Text className="text-gray-500">
              {item.lastMessage !== '' ? item.lastMessage : 'Start a new chat'}
            </Text>
          </View>
          <View className="absolute right-[4px] items-center">
            <Text className="text-white text-[12px]">
              {item.lastMessageTime !== '' ? item.lastMessageTime : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    return (
      <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-row items-center bg-neutral-800 h-18 w-[380px] my-[15px] px-[15px] rounded-xl">
          <TouchableOpacity>
            <Ionicon name="search" size={26} color="gray" />
          </TouchableOpacity>
          <TextInput
            onChangeText={handleSearch}
            value={search}
            placeholder="Search"
            placeholderTextColor="gray"
            className="flex-1 h-[100%] mx-[8px] text-white"
          />
          <TouchableOpacity>
            <Feather name="edit" size={24} color="gray" />
          </TouchableOpacity>
        </View>
        {/* Render chat */}
        <View>
          {isLoading ? (
            <View className="flex-1 flex-col justify-start items-center">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : (
            users.length === 0 ? (
              <Text className="text-white text-center mt-5">
                You don't have any followers or following yet!
              </Text>
            ) : (
              <FlatList
                data={users}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
              />
            )
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 h-full bg-zinc-900 text-white">
      <View className="p-5 items-center">{renderContent()}</View>
    </SafeAreaView>
  );
};

export default ListMessageScreen;
