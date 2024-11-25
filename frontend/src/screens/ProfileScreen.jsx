import React, { useCallback, useContext, useState } from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import uri from '../../redux/uri';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/actions/userAction';
import { useFocusEffect } from '@react-navigation/native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reposts from '../components/Reposts';
import UserReplied from '../components/UserReplied';
import { SocketContext } from '../components/SocketContext';

const ProfileScreen = ({ navigation, route }) => {
  const { user } = useSelector(state => state.user);
  const [followers, setFollowers] = useState();
  const [userData, setUserData] = useState();
  const [sharedPosts, setSharedPosts] = useState([]);
  const [ownerPosts, setOwnerPosts] = useState([]);
  const [ownerRepliedPosts, setOwnerRepliedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Threads'); // Default tab
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext);

  const user_id = route.params?.from === 'onClick' ? route.params.user_id : undefined;
  const currentUserId = user_id !== undefined ? user_id : user._id;

  const getUserInfo = async () => {
    try {
      const response = await axios.get(`${uri}/user/${currentUserId}`);
      setUserData(response.data.metadata);
      setFollowers(response.data.metadata.followers.length);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSharedPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${uri}/post/user/${currentUserId}/share`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSharedPosts(response.data.metadata);
    } catch (error) {
      console.error('Error fetching shared posts:', error);
    }
  };

  const fetchOwnerPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${uri}/post/user/${currentUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOwnerPosts(response.data.metadata);
    } catch (error) {
      console.error('Error fetching owner posts:', error);
    }
  };

  const fetchOwnerRepliedPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${uri}/user/replied/${currentUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOwnerRepliedPosts(response.data.metadata);
    } catch (error) {
      console.error('Error fetching owner replied posts:', error);
    }
  };

  const toggleLike = async (postId, isLiked, index) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.patch(`${uri}/post/${postId}/${isLiked ? 'unlike' : 'like'}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserInfo();
      if (activeTab === 'Threads') {
        fetchOwnerPosts();
      } else if (activeTab === 'Replies') {
        fetchOwnerRepliedPosts();
      } else if (activeTab === 'Reposts') {
        fetchSharedPosts();
      }
    }, [currentUserId, activeTab])
  );

  const handleTabPress = tabName => {
    setActiveTab(tabName);
    if (tabName === 'Reposts') {
      fetchSharedPosts();
    } else if (tabName === 'Threads') {
      fetchOwnerPosts();
    } else if (tabName === 'Replies') {
      fetchOwnerRepliedPosts();
    }
  };

  const logoutHandler = () => {
    socket.emit('cus-disconnect');
    socket.close;
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
        <Text className="text-white">{followers > 1 ? `${followers} Followers` : `${followers} Follower`}</Text>
      </View>

      {currentUserId === user._id ? (
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
      ) : (
        <View className="flex-row items-center justify-between m-5 mt-7">
          <TouchableOpacity
            className="w-[45%] border border-gray-500 h-[40] rounded-xl"
            onPress={() => navigation.navigate('EditProfile')}>
            <Text className="text-white text-center pt-2">Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-[45%] border border-gray-500 h-[40] rounded-xl"
            onPress={logoutHandler}>
            <Text className="text-white text-center pt-2">Mention</Text>
          </TouchableOpacity>
        </View>
      )}

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
    <View style={{ flex: 1 }}>
      {activeTab === 'Threads' && (
        <Reposts
          data={ownerPosts}
          user={user}
          navigation={navigation}
          activeTab={activeTab}
          ListHeaderComponent={renderHeader}
          toggleLike={toggleLike}
        />
      )}
      {activeTab === 'Replies' && (
        <UserReplied
          replies={ownerRepliedPosts}
          ListHeaderComponent={renderHeader}
        />
      )}
      {activeTab === 'Reposts' && (
        <Reposts
          data={sharedPosts}
          user={user}
          navigation={navigation}
          activeTab={activeTab}
          ListHeaderComponent={renderHeader}
          toggleLike={toggleLike}
        />
      )}
    </View>
  );
};

export default ProfileScreen;
