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
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getTimeDuration from '../common/TimeGenerator';
const loader = require('../../assets/loader.json');

const HomeScreen = (props) => {
  const { user } = useSelector((state) => state.user);
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

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${uri}/post`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setPosts(response.data.metadata);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onScroll = (event) => {
    const { nativeEvent } = event;
    const { contentOffset } = nativeEvent;
    const { y } = contentOffset;
    setOffsetY(y);
  };

  const onScrollEndDrag = (event) => {
    const { nativeEvent } = event;
    const { contentOffset } = nativeEvent;
    const { y } = contentOffset;
    setOffsetY(y);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts(); // Fetch posts again on refresh
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
        <View className="flex justify-center items-center pt-5">
          <Image
            source={require('../../assets/images/white.png')}
            style={{ width: 40, height: 40 }}
          />
        </View>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('Post')}
          className="p-[15px] border-b border-gray-700"
        >
          <View className="flex flex-row gap-4">
            <Image
              source={
                user?.avatar
                  ? { uri: user?.avatar }
                  : require('../../assets/images/avatar.jpg')
              }
              style={{ width: 40, height: 40, borderRadius: 100 }}
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
          renderItem={({ item }) => (
            <View className="p-[15px] border-b border-gray-700">
              <View className="relative">
                <View className="flex-row w-full">
                  <View className="flex-row w-[85%] items-center">
                    <TouchableOpacity>
                      <Image
                        source={
                          item?.user_id?.avatar
                            ? { uri: item.user_id.avatar }
                            : require('../../assets/images/avatar.jpg')
                        }
                        style={{ width: 40, height: 40, borderRadius: 100 }}
                      />
                    </TouchableOpacity>
                    <View className="pl-3 w-[70%]">
                      <Text className="text-white font-[500] text-[16px]">
                        {item?.user_id?.name || 'Unknown User'}
                      </Text>
                      <Text className="text-gray-400 text-[12px]">
                        {item?.createdAt ? getTimeDuration(item?.createdAt) : 'Time not available'}
                      </Text>
                      <Text className="text-white/80 font-normal text-[13px] mt-2">
                        {item?.title || 'No title available'}
                      </Text>
                    </View>
                  </View>
                </View>
                {/* Rendering Images */}
                {Array.isArray(item?.image) && item.image.length > 0 ? (
                  <View className="ml-[50px] my-3">
                    {item.image.map((img, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: img }}
                        style={{
                          aspectRatio: 1,
                          borderRadius: 10,
                          width: 320,
                          height: 320,
                        }}
                        onError={(error) =>
                          console.error('Error loading image:', error.nativeEvent.error)
                        } 
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-500 text-center mt-2">
                    No Image Available
                  </Text>
                )}
              </View>
            </View>
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
