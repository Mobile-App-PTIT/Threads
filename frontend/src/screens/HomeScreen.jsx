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
const loader = require('../../assets/loader.json');

const postData = [
  {
    title: 'Happen apply peace likely agency maintain put.',
    image: {
      public_id: '2dcf841d-3d89-4363-9353-b21c51f1883b',
      url: '',
    },
    user: {
      name: 'Jennifer Brown',
      userName: 'george84',
      userId: '1c6374b4-be49-4867-9ff5-d3a21743fc38',
      userAvatar: '../assets/images/avatar.jpg',
    },
    likes: [
      {
        name: 'Rachel Gonzalez',
        userName: 'luisharrison',
        userId: 'b631a27c-c586-45f7-873f-8ecd4ca975f5',
        userAvatar: '../../assets/images/avatar.jpg',
      },
      {
        name: 'Mark King',
        userName: 'garysharp',
        userId: '80a7e7d3-e601-4d5c-b9cf-1a81098509ac',
        userAvatar: '../../assets/images/avatar.jpg',
      },
      {
        name: 'Jennifer Wolfe',
        userName: 'rsherman',
        userId: '8f402fb3-ca5c-42bb-ab82-71bb34396772',
        userAvatar: '../../assets/images/avatar.jpg',
      },
    ],
    replies: [
      {
        user: {
          name: 'Jennifer Brown',
          userName: 'george84',
          userId: '1c6374b4-be49-4867-9ff5-d3a21743fc38',
          userAvatar: '../../assets/images/avatar.jpg',
        },
        title: 'Great post!',
        image: {
          public_id: 'xyz123',
          url: '',
        },
        createdAt: '2024-09-21 08:58:31',
        likes: [
          {
            name: 'Carol Byrd',
            userName: 'pchristian',
            userId: '650e6ed4-c75b-476f-ab9d-978cff5a9d56',
            userAvatar: '../../assets/images/avatar.jpg',
          },
        ],
        reply: [],
      },
    ],
  },
];

const userData = {
  name: 'Jennifer Brown',
  userName: 'george84',
  avatar: '',
};

const HomeScreen = props => {
  const {posts, isLoading} = useSelector(state => state.post);
  const dispatch = useDispatch();
  const [offsetY, setOffsetY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [extraPaddingTop] = useState(new Animated.Value(0));
  const refreshingHeight = 100;
  const lottieViewRef = useRef(null);

  let progress = 0;
  if (offsetY < 0 && !isRefreshing) {
    const maxOffsetY = -refreshingHeight;
    progress = Math.min(offsetY / maxOffsetY, 1);
  }

  const onScroll = event => {
    const {nativeEvent} = event;
    const {contentOffset} = nativeEvent;
    const {y} = contentOffset;
    setOffsetY(y);
  };

  const onRelease = () => {
    if (offsetY <= -refreshingHeight && !isRefreshing) {
      setIsRefreshing(true);
      setTimeout(() => {
        getAllPosts()(dispatch);
        setIsRefreshing(false);
      }, 3000);
    }
  };

  const onScrollEndDrag = event => {
    const {nativeEvent} = event;
    const {contentOffset} = nativeEvent;
    const {y} = contentOffset;
    setOffsetY(y);

    if (y <= -refreshingHeight && !isRefreshing) {
      setIsRefreshing(true);
      setTimeout(() => {
        getAllPosts()(dispatch);
        setIsRefreshing(false);
      }, 3000);
    }
  };

  //   useEffect(() => {
  //     getAllPosts()(dispatch);
  //     getAllUsers()(dispatch);
  //   }, [dispatch]);

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
                userData?.avatar
                  ? {uri: userData.avatar}
                  : require('../../assets/images/avatar.jpg')
              }
              style={{width: 40, height: 40, borderRadius: 100}}
            />
            <View className="flex flex-col gap-6">
              <View>
                <Text className="text-white">{userData.name}</Text>
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
        {/* custom loader not working in android that's why I used here built in loader for android and custom loader for android but both working perfectly */}
        {Platform.OS === 'ios' ? (
          <FlatList
            data={postData}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <PostCard navigation={props.navigation} item={item} />
            )}
            onScroll={onScroll}
            onScrollEndDrag={onScrollEndDrag}
            onResponderRelease={onRelease}
            ListHeaderComponent={
              <Animated.View
                style={{
                  paddingTop: extraPaddingTop,
                }}
              />
            }
          />
        ) : (
          <FlatList
            data={postData}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <PostCard navigation={props.navigation} item={item} />
            )}
            onScroll={onScroll}
            onScrollEndDrag={onScrollEndDrag}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  //   getAllPosts()(dispatch);
                  //   getAllUsers()(dispatch).then(() => {
                  //     setRefreshing(false);
                  //   });
                }}
                progressViewOffset={refreshingHeight}
              />
            }
            onResponderRelease={onRelease}
            ListHeaderComponent={
              <Animated.View
                style={{
                  paddingTop: extraPaddingTop,
                }}
              />
            }
          />
        )}
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;
