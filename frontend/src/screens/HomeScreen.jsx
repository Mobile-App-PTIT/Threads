import axios from 'axios';
import uri from '../../redux/uri';
import {
  Animated,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome5Brands from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getTimeDuration from '../common/TimeGenerator';
import SharePopup from '../components/SharePopup';

const HomeScreen = props => {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.user);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offsetY, setOffsetY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [extraPaddingTop] = useState(new Animated.Value(0));
  const [isSharePopupVisible, setSharePopupVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

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

  const fetchFollowing = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${uri}/user/following/${user._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      // console.log(response.data);
      setFollowing(response.data.following.map(f => f._id));
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchFollowing();
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
    await fetchPosts();
    await fetchFollowing();
    setIsRefreshing(false);
  };

  const onSharePress = post_id => {
    setSelectedPostId(post_id);
    setSharePopupVisible(true);
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

  const handleFollowPress = async id => {
    try {
      console.log('Following user:', id);
      await axios.patch(
        `${uri}/user/follow/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const isFollowing = following.includes(id);
      setFollowing(prevFollowing =>
        isFollowing
          ? prevFollowing.filter(userId => userId !== id)
          : [...prevFollowing, id],
      );
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <>
      <SafeAreaView className="bg-zinc-900 flex-1">
        <View className="flex flex-row justify-center items-center pt-5">
          <Image
            source={require('../../assets/images/white.png')}
            style={{width: 40, height: 40}}
          />
          <TouchableOpacity
            onPress={() => props.navigation.navigate('ListMessageScreen')}
            className="absolute right-[20px] bottom-[5px]">
            <FontAwesome5Brands
              name="facebook-messenger"
              color={'white'}
              size={30}
            />
          </TouchableOpacity>
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
                <Feather name="video" color={'gray'} size={20} />
                <Feather name="mic" color={'gray'} size={18} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {/* <LottieView
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
        /> */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => (
            <View className="p-[15px] border-b border-gray-700">
              <View className="relative">
                <View className="flex-row w-full">
                  <View className="flex-row w-[85%] items-center">
                    <TouchableOpacity
                      onPress={() => {
                        if (user?._id !== item?.user_id?._id) {
                          handleFollowPress(item?.user_id?._id);
                        }
                      }}>
                      <Image
                        source={
                          item?.user_id?.avatar
                            ? {uri: item.user_id.avatar}
                            : require('../../assets/images/avatar.jpg')
                        }
                        style={{width: 40, height: 40, borderRadius: 100}}
                      />
                    </TouchableOpacity>

                    <View className="pl-3 w-[70%]">
                      <TouchableOpacity
                        onPress={() => {
                          props.navigation.navigate('Profile', {
                            user_id: item?.user_id?._id,
                            from: 'onClick',
                          });
                        }}>
                        <Text className="text-white font-[500] text-[16px]">
                          {item?.user_id?.name || 'Unknown User'}
                        </Text>
                      </TouchableOpacity>

                      <Text className="text-gray-400 text-[12px]">
                        {item?.createdAt
                          ? getTimeDuration(item?.createdAt)
                          : 'Time not available'}
                      </Text>
                      <Text className="text-white/80 font-normal text-[13px] mt-2">
                        {item?.title || 'No title available'}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() =>
                        navigation.navigate('PostDetailScreen', {
                          post_id: item._id,
                        })
                      }>
                  {Array.isArray(item?.media) && item.media.length > 0 ? (
                    <ScrollView
                      horizontal
                      className="ml-[50px] my-3 flex flex-row">
                      {item.media.map((img, idx) => (
                        <Image
                          key={idx}
                          source={{uri: img}}
                          style={{
                            aspectRatio: 1,
                            borderRadius: 10,
                            width: 320,
                            height: 320,
                            marginRight: 20,
                          }}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  ) : (
                    <Text className="text-gray-500 text-center mt-2">
                      No Image Available
                    </Text>
                  )}

                  <View className="pl-[50px] pt-4 flex-row">
                    <TouchableOpacity
                      onPress={() =>
                        toggleLike(
                          item._id,
                          item.likes.includes(user._id),
                          index,
                        )
                      }
                      className="flex-row items-center mr-4">
                      <Ionicons
                        name={
                          item.likes.includes(user._id)
                            ? 'heart'
                            : 'heart-outline'
                        }
                        size={20}
                        color={item.likes.includes(user._id) ? 'red' : 'white'}
                      />
                      <Text className="text-[16px] text-white ml-2">
                        {item.likes.length}{' '}
                        {item.likes.length > 1 ? 'Likes' : 'Like'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('PostDetailScreen', {
                          post_id: item._id,
                        })
                      }
                      className="flex-row items-center mr-4">
                      <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color="white"
                      />
                      <Text className="text-[16px] text-white ml-2">
                        {item?.replies?.length
                          ? `${item?.replies?.length} Replies`
                          : '0 Replies'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => onSharePress(item._id)}
                      className="flex-row items-center">
                      <Feather name="share-2" size={18} color="white" />
                      <Text className="text-[16px] text-white ml-2">Share</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
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
          // ListHeaderComponent={
          //   <Animated.View
          //     style={{
          //       paddingTop: extraPaddingTop,
          //     }}
          //   />
          // }
        />
      </SafeAreaView>
      <SharePopup
        isVisible={isSharePopupVisible}
        onClose={() => setSharePopupVisible(false)}
        post_id={selectedPostId}
      />
    </>
  );
};

export default HomeScreen;
