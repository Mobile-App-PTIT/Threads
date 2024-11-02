import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uri from '../../redux/uri';
import { useSelector } from 'react-redux';

const SearchScreen = () => {
  const { user } = useSelector((state) => state.user);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${uri}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if each user is in the current user's following list
      const usersWithFollowStatus = response.data.metadata.map((item) => ({
        ...item,
        following: user.following.includes(item._id),
      }));

      setData(usersWithFollowStatus);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to fetch users');
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    if (text.length > 0) {
      const filteredUsers = data.filter((user) =>
        user.name.toLowerCase().includes(text.toLowerCase())
      );
      setData(filteredUsers);
    } else {
      fetchUsers();
    }
  };

  const handleFollow = async (userId, index) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.patch(`${uri}/user/follow/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the 'followed' status of the user
      setData((prevData) =>
        prevData.map((user, i) =>
          i === index ? { ...user, following: !user.following } : user
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to follow/unfollow user');
      console.error('Error following/unfollowing user:', error);
    }
  };

  return (
    <SafeAreaView className="bg-zinc-900 flex-1">
      <View className="p-5 bg-zinc-900">
        <Text className="text-white text-3xl font-[700]">Search</Text>
        <View className="relative pt-2">
          <FontAwesome
            name="search"
            size={22}
            color="gray"
            className="top-[30px] left-4 absolute z-10"
          />
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Search"
            placeholderTextColor={'gray'}
            className="w-full h-[50px] bg-neutral-800 rounded-[8px] pl-14 pt-2 text-white mt-[10px]"
          />
        </View>

        <FlatList
          className="mt-5"
          data={data}
          keyExtractor={(item) => item._id.toString()}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchUsers}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('UserProfile', {
                  item: item,
                })
              }
              className="bg-zinc-900"
            >
              <View className="flex-row my-3">
                <Image
                  source={
                    item?.avatar
                      ? { uri: item.avatar }
                      : require('../../assets/images/avatar.jpg')
                  }
                  style={{ width: 40, height: 40, borderRadius: 100 }}
                />
                <View className="w-[89%] flex-row justify-between border-b border-gray-700 pb-3">
                  <View>
                    <View className="flex-row items-center relative">
                      <Text className="pl-3 text-[18px] text-white">
                        {item.name}
                      </Text>
                      {item?.role === 'Admin' && (
                        <Image
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/128/1828/1828640.png',
                          }}
                          width={18}
                          height={18}
                          className="ml-1"
                        />
                      )}
                    </View>

                    <Text
                      className="pl-3 text-[14px] text-gray-400"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item?.subname || 'No subname'}
                    </Text>
                    <Text className="pl-3 mt-3 text-[14px] text-white">
                      {item.followers.length} followers
                    </Text>
                  </View>
                  <View>
                    {item.following ? null : (
                      <TouchableOpacity
                        onPress={() => handleFollow(item._id, index)}
                        className="rounded-[8px] w-[100px] flex-row justify-center items-center h-[35px] border border-slate-700"
                      >
                        <Text className="text-white">Follows</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
