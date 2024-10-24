import axios from 'axios';
import uri from '../../redux/uri';
import {
  FlatList,
  Animated,
  Easing,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getAllPosts} from '../../redux/actions/postAction';
import PostCard from '../components/PostCard';
import LottieView from 'lottie-react-native';
import {getAllUsers} from '../../redux/actions/userAction';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const loader = require('../../assets/loader.json');

const HomeScreen = (props) => {
  const token = AsyncStorage.getItem('token');
  const {user} = useSelector(state => state.user);  
  const [posts, setPosts] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [offsetY, setOffsetY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [extraPaddingTop] = useState(new Animated.Value(0));
  const refreshingHeight = 100;
  const lottieViewRef = useRef(null);

  let progress = 0;
  if (offsetY < 0 && !isRefreshing) {
    const maxOffsetY = -refreshingHeight;
    progress = Math.min(offsetY / maxOffsetY, 1);
  }

  // API call to fetch posts
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${uri}/post`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });  
      setPosts(response.data.metadata);  
      console.log('Posts:', response.data.metadata);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, []);

  const onScroll = event => {
    const {nativeEvent} = event;
    const {contentOffset} = nativeEvent;
    const {y} = contentOffset;
    setOffsetY(y);
  };

  const onScrollEndDrag = event => {
    const {nativeEvent} = event;
    const {contentOffset} = nativeEvent;
    const {y} = contentOffset;
    setOffsetY(y);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts();  // Fetch posts again on refresh
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isRefreshing) {
      Animated.timing(extraPaddingTop, {
        toValue: refreshingHeight,
        duration: 0,
        useNativeDriver: false,
      }).start();
      lottieViewRef.current?.play();
    } else {
      Animated.timing(extraPaddingTop, {
        toValue: 0,
        duration: 400,
        easing: Easing.elastic(1.3),
        useNativeDriver: false,
      }).start();
    }
  }, [isRefreshing]);

  return (
    <>
      <SafeAreaView className="bg-zinc-900 flex-1">
        <View className='flex justify-center items-center pt-5'>
          <Image
            source={require('../../assets/images/white.png')}
            style={{width: 40, height: 40}}
          />
        </View>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('Post')}
          className="p-[15px] border-b border-gray-700">
          <View className="flex flex-row gap-4">
            <Image
              source={
                user?.avatar
                  ? {uri: user?.avatar}
                  : require('../../assets/images/avatar.jpg')
              }
              style={{width: 40, height: 40, borderRadius: 100}}
            />
            <View className="flex flex-col gap-6">
              <View>
                <Text className="text-white">{user?.name}</Text>
                <Text className="text-gray-500">What's new?</Text>
              </View>
              <View className="flex flex-row gap-4">
                <Ionicons name="images-outline" color={'gray'} size={20} />
                <Feather name="camera" color={'gray'} size={20} />
                <Feather name="mic" color={'gray'} size={18} />
                <Feather name="hash" color={'gray'} size={20} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <LottieView
          ref={lottieViewRef}
          style={{
            height: refreshingHeight,
            display: isRefreshing ? 'flex' : 'none',
            position: 'absolute',
            top: 15,
            left: 0,
            right: 0,
          }}
          loop={false}
          source={loader}
          progress={progress}
        />
        {/* Display posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <PostCard navigation={props.navigation} item={item} />
          )}
          keyExtractor={(item, index) => index.toString()}
          onScroll={onScroll}
          onScrollEndDrag={onScrollEndDrag}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing || isLoading}
              onRefresh={onRefresh}
              progressViewOffset={refreshingHeight}
            />
          }
          ListHeaderComponent={
            <Animated.View
              style={{
                paddingTop: extraPaddingTop,
              }}
            />
          }
        />
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;
