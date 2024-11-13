import React, {useEffect, useState, useCallback} from 'react';
import {Text, SafeAreaView, View, Image, TouchableOpacity} from 'react-native';
import axios from 'axios';
import uri from '../../redux/uri';
import {useSelector, useDispatch} from 'react-redux';
import {logoutUser} from '../../redux/actions/userAction';
import {useFocusEffect} from '@react-navigation/native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reposts from '../components/Reposts';

const ProfileScreen = ({navigation, route}) => {
  const {user} = useSelector(state => state.user);
  const [followers, setFollowers] = useState();
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState();
  const [sharedPosts, setSharedPosts] = useState([{}]);
  const [ownerPosts, setOwnerPosts] = useState([{}]);
  const [activeTab, setActiveTab] = useState('Threads'); // Default tab
  const dispatch = useDispatch();

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

  useFocusEffect(
    useCallback(() => {
      getUserInfo();
    }, [currentUserId])
  );

  const fetchSharedPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${uri}/post/user/${user._id}/share`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSharedPosts(response.data.metadata);
    } catch (error) {
      console.error('Error fetching shared posts:', error);
    }
  };

  const fetchOwnerPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${uri}/post/user/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOwnerPosts(response.data.metadata);
    } catch (error) {
      console.error('Error fetching owner posts:', error);
    }
  };

  const handleTabPress = tabName => {
    setActiveTab(tabName);
    if (tabName === 'Reposts') {
      fetchSharedPosts();
    } else if (tabName === 'Threads') {
      fetchOwnerPosts();
    }
  };

  const logoutHandler = () => {
    logoutUser()(dispatch);
  };

  const toggleLike = async (postId, liked, index) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.patch(
        `${uri}/post/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setPosts(prevPosts =>
        prevPosts.map((post, i) =>
          i === index
            ? {
                ...post,
                likes: liked
                  ? post.likes.filter(id => id !== user._id)
                  : [...post.likes, user._id],
              }
            : post,
        ),
      );
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const renderHeader = () => (
    <SafeAreaView style={{backgroundColor: '#1c1c1e'}}>
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
              ? {uri: userData.avatar}
              : require('../../assets/images/avatar.jpg')
          }
          style={{width: 70, height: 70, borderRadius: 100}}
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

      {currentUserId  === user._id ? (
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
        style={{paddingBottom: 10, paddingTop: 20}}>
        <View className="flex-row justify-between items-center mx-4">
          <TouchableOpacity
            style={{flex: 1, alignItems: 'center'}}
            onPress={() => handleTabPress('Threads')}>
            <Text
              className={`text-[16px] ${
                activeTab === 'Threads' ? 'text-white' : 'text-gray-400'
              }`}>
              Threads
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flex: 1, alignItems: 'center'}}
            onPress={() => handleTabPress('Replies')}>
            <Text
              className={`text-[16px] ${
                activeTab === 'Replies' ? 'text-white' : 'text-gray-400'
              }`}>
              Replies
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flex: 1, alignItems: 'center'}}
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
    <Reposts
      data={activeTab === 'Reposts' ? sharedPosts : posts}
      user={user}
      toggleLike={toggleLike}
      navigation={navigation}
      activeTab={activeTab}
      ListHeaderComponent={renderHeader}
    />
  );
};

export default ProfileScreen;
