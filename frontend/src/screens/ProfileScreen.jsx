import React, { useEffect, useState, useCallback } from 'react';
import {
  Text,
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import axios from 'axios';
import uri from '../../redux/uri';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/actions/userAction';
import { useFocusEffect } from '@react-navigation/native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getTimeDuration from '../common/TimeGenerator';

const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.user);
  const [followers, setFollowers] = useState();
  const [userData, setUserData] = useState();
  const [sharedPosts, setSharedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Threads'); // Default tab
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      const followerCount = async () => {
        try {
          const response = await axios.get(`${uri}/user/followers/${user._id}`);
          setFollowers(response.data.totalFollowers);
        } catch (error) {
          console.log(error);
        }
      };

      const getUserInfo = async () => {
        try {
          const response = await axios.get(`${uri}/user/${user._id}`);
          setUserData(response.data.metadata);
        } catch (error) {
          console.log(error);
        }
      };

      getUserInfo();
      followerCount();
    }, [user]),
  );

  const fetchSharedPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${uri}/post/share/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSharedPosts(response.data.metadata);
    } catch (error) {
      console.error('Error fetching shared posts:', error);
    }
  };

  const handleTabPress = tabName => {
    setActiveTab(tabName);
    if (tabName === 'Reposts') {
      fetchSharedPosts();
    }
  };

  const logoutHandler = () => {
    logoutUser()(dispatch);
  };

  const renderHeader = () => (
    <SafeAreaView style={{ backgroundColor: '#1c1c1e' }}>
      <View className="flex-row justify-between m-5">
        <View>
          <SimpleLineIcons name="globe" size={27} color="white" />
        </View>
        <View className="flex-row gap-5">
          <AntDesign name="instagram" size={32} color="white" />
          <Feather name="menu" size={32} color="white" />
        </View>
      </View>
      <View className="flex-row justify-between m-5 items-center">
        <View>
          <Text className="text-white font-bold text-4xl">
            {userData?.name}
          </Text>
          {userData?.subname ? (
            <Text className="text-white text-lg">{userData.subname}</Text>
          ) : (
            <Text className="text-white text-lg">Update your subname</Text>
          )}
        </View>
        <Image
          source={
            userData?.avatar
              ? { uri: userData.avatar }
              : require('../../assets/images/avatar.jpg')
          }
          style={{ width: 70, height: 70, borderRadius: 100 }}
        />
      </View>
      <View className="mx-5">
        {userData?.bio ? (
          <Text className="text-white">{userData.bio}</Text>
        ) : (
          <Text className="text-white">Update your bio</Text>
        )}
      </View>

      <View className="mx-5 mt-5">
        <Text className="text-white">{followers} Followers</Text>
      </View>

      <View className="flex-row items-center justify-between m-5 mt-7">
        <TouchableOpacity
          className="w-[45%] border border-gray-500 h-[40] rounded-xl"
          onPress={() => navigation.navigate('EditProfile')}>
          <Text className="text-white text-center pt-2">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-[45%] border border-gray-500 h-[40] rounded-xl"
          onPress={logoutHandler}>
          <Text className="text-white text-center pt-2">Log out</Text>
        </TouchableOpacity>
      </View>

      <View
        className="border-b border-gray-500"
        style={{ paddingBottom: 10, paddingTop: 20 }}>
        <View className="flex-row justify-between items-center mx-4">
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => handleTabPress('Threads')}>
            <Text
              className={`text-[16px] ${
                activeTab === 'Threads' ? 'text-white' : 'text-gray-400'
              }`}>
              Threads
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => handleTabPress('Replies')}>
            <Text
              className={`text-[16px] ${
                activeTab === 'Replies' ? 'text-white' : 'text-gray-400'
              }`}>
              Replies
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => handleTabPress('Reposts')}>
            <Text
              className={`text-[16px] ${
                activeTab === 'Reposts' ? 'text-white' : 'text-gray-400'
              }`}>
              Reposts
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  return (
    <FlatList
      data={activeTab === 'Reposts' ? sharedPosts : []} 
      ListHeaderComponent={renderHeader}
      keyExtractor={item => item._id.toString()}
      renderItem={({ item }) => (
        <View className="bg-zinc-900 p-5 mb-5 border border-gray-700 rounded-lg">
          {/* User info */}
          <View className="flex-row items-center mb-3">
            <Image
              source={{
                uri:
                  item.user_id?.avatar || 'https://example.com/default-avatar.jpg',
              }} 
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <View className="ml-3">
              <Text className="text-white font-bold">
                {item.user_id?.name || 'Unknown User'}
              </Text>
              <Text className="text-gray-500 text-sm">{getTimeDuration(item.createdAt)}</Text>
            </View>
          </View>

          {/* Post title and status */}
          <Text className="text-white mb-3 font-semibold">
            {item.title}
          </Text>
          <Text className="text-gray-400 mb-3">{item.status}</Text>

          {/* Post image (if available) */}
          {item.image?.length > 0 && (
            <Image
              source={{ uri: item.image[0] }}
              style={{ width: '100%', height: 200, borderRadius: 10 }}
              resizeMode="cover"
            />
          )}
        </View>
      )}
      ListEmptyComponent={
        <Text className="text-white mt-5 mx-5">Nothing here</Text>
      }
      style={{ backgroundColor: '#1c1c1e' }} 
      contentContainerStyle={{ paddingBottom: 20, backgroundColor: '#1c1c1e' }}
    />
  );
};

export default ProfileScreen;
