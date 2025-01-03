import {View, Text, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Image} from 'react-native';
import getTimeDuration from '../common/TimeGenerator';
import {
  addLikes,
  addLikesToRepliesReply,
  addLikesToReply,
  removeLikes,
  removeLikesFromRepliesReply,
  removeLikesFromReply,
} from '../../redux/actions/postAction';
import axios from 'axios';
import {uri} from '../../redux/uri';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostDetailsCard = ({
  item,
  isReply,
  navigation,
  postId,
  isRepliesReply,
}) => {
  const {user, token, users} = useSelector(state => state.user);
  const {posts} = useSelector(state => state.post);
  const dispatch = useDispatch();
  const [active, setActive] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Bui Nguyen Tung Lam',
    userName: 'Software Engineer',
    avatar: {
      url: '../../assets/images/avatar.jpg',
    },
  });

  const time = item?.createdAt;
  const formattedDuration = getTimeDuration(time);

  const profileHandler = async e => {
    await axios
      .get(`${uri}/get-user/${e._id}`, {
        headers: {Authorization: `Bearer ${token}`},
      })
      .then(res => {
        if (res.data.user._id !== user._id) {
          navigation.navigate('UserProfile', {
            item: res.data.user,
          });
        } else {
          navigation.navigate('Profile');
        }
      });
  };

  const reactsHandler = e => {
    if (item.likes.length !== 0) {
      const isLikedBefore = item.likes.find(i => i.userId === user._id);
      if (isLikedBefore) {
        removeLikes({postId: postId ? postId : e._id, posts, user})(dispatch);
      } else {
        addLikes({postId: postId ? postId : e._id, posts, user})(dispatch);
      }
    } else {
      addLikes({postId: postId ? postId : e._id, posts, user})(dispatch);
    }
  };

  const replyReactHanlder = e => {
    if (e.likes.length !== 0) {
      const isLikedBefore = e.likes.find(i => i.userId === user._id);
      if (isLikedBefore) {
        removeLikesFromReply({
          postId: postId ? postId : e._id,
          posts,
          replyId: e._id,
          user,
          title: e.title,
        })(dispatch);
      } else {
        addLikesToReply({
          postId: postId ? postId : e._id,
          posts,
          replyId: e._id,
          user,
          title: e.title,
        })(dispatch);
      }
    } else {
      addLikesToReply({
        postId: postId ? postId : e._id,
        posts,
        replyId: e._id,
        user,
        title: e.title,
      })(dispatch);
    }
  };

  const handlePress = async e => {
    setActive(!active);
    await AsyncStorage.setItem('replyId', e._id);
  };

  const repliesReplyReactHandler = async e => {
    const replyId = await AsyncStorage.getItem('replyId');
    if (e.likes.length !== 0) {
      const isLikedBefore = e.likes.find(i => i.userId === user._id);
      if (isLikedBefore) {
        removeLikesFromRepliesReply({
          postId: postId,
          posts,
          replyId,
          singleReplyId: e._id,
          user,
          title: e.title,
        })(dispatch);
      } else {
        addLikesToRepliesReply({
          postId: postId,
          posts,
          replyId,
          singleReplyId: e._id,
          user,
          title: e.title,
        })(dispatch);
      }
    } else {
      addLikesToRepliesReply({
        postId: postId,
        posts,
        replyId,
        singleReplyId: e._id,
        user,
        title: e.title,
      })(dispatch);
    }
  };

  useEffect(() => {
    if (users) {
      const updatedUsers = [...users, user];
      const userData = updatedUsers.find(user => user._id === item.user._id);
      setUserInfo(userData);
    }
  }, [users]);

  return (
    <View
      className={`p-[15px] ${!isReply && 'border-b-[#00000017] border-b'}`}
      style={{left: isReply ? 20 : 0, width: isReply ? '95%' : '100%'}}>
      <View className="relative">
        <View className="flex-row w-full justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => profileHandler(userInfo)}>
              <Image
                source={
                  userInfo?.avatar?.url
                    ? {uri: userInfo.avatar.url}
                    : require('../../assets/images/avatar.jpg')
                }
                width={40}
                height={40}
                borderRadius={100}
              />
            </TouchableOpacity>
            <View className="pl-3">
              <TouchableOpacity onPress={() => profileHandler(userInfo)}>
                <View className="relative flex-row items-center">
                  <Text className="text-black font-[500] text-[16px]">
                    {userInfo.name}
                  </Text>
                  {item.role === 'Admin' && (
                    <Image
                      source={{
                        uri: 'https://cdn-icons-png.flaticon.com/128/1828/1828640.png',
                      }}
                      width={15}
                      height={15}
                      className="ml-1 absolute bottom-0 left-0"
                    />
                  )}
                </View>
                <Text className="text-[13px] text-white">
                  {userInfo?.userName}
                </Text>
              </TouchableOpacity>
              <Text className="text-white font-[500] text-[13px]">
                {item.title}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="text-white">{formattedDuration}</Text>
            <TouchableOpacity>
              <Text className="text-white pl-4 font-[700] mb-[8px]">...</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="ml-[50px] my-3">
          {item?.image && (
            <Image
              source={
                item?.image?.url
                  ? {uri: item?.image?.url}
                  : require('../../assets/images/praha.jpg')
              }
              style={{aspectRatio: 1, borderRadius: 10, zIndex: 1111}}
              resizeMode="contain"
            />
          )}
        </View>
        {item?.image ? (
          <View className="absolute top-14 left-5 h-[90%] w-[1px] bg-[#00000017]" />
        ) : (
          <View className="absolute top-12 left-5 h-[60%] w-[1px] bg-[#00000017]" />
        )}
        <View className="flex-row items-center left-[50px] top-[5px]">
          <TouchableOpacity
            onPress={() =>
              !isRepliesReply
                ? !isReply
                  ? reactsHandler(item)
                  : replyReactHanlder(item)
                : repliesReplyReactHandler(item)
            }>
            {item.likes.length > 0 ? (
              <>
                {item.likes.find(i => i.userId === user._id) ? (
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/2589/2589175.png',
                    }}
                    width={30}
                    height={30}
                  />
                ) : (
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/2589/2589197.png',
                    }}
                    width={30}
                    height={30}
                  />
                )}
              </>
            ) : (
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/2589/2589197.png',
                }}
                width={30}
                height={30}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('CreateReplies', {
                item: item,
                navigation: navigation,
                postId: postId,
              });
            }}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/5948/5948565.png',
              }}
              width={22}
              height={22}
              className="ml-5"
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/3905/3905866.png',
              }}
              width={25}
              height={25}
              className="ml-5"
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/10863/10863770.png',
              }}
              width={25}
              height={25}
              className="ml-5"
            />
          </TouchableOpacity>
        </View>

        <View className="pl-[50px] pt-4 flex-row">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PostDetails', {
                data: item,
              })
            }></TouchableOpacity>
          <Text className="text-[16px] text-white">
            {item.likes.length} {item.likes.length > 1 ? 'likes' : 'like'}
          </Text>
        </View>

        {isRepliesReply && (
          <View className="pl-[50px] pt-4 flex-row">
            <Text className="text-[16px] text-white">
              {item.likes.length} {item.likes.length > 1 ? 'likes' : 'like'}
            </Text>
          </View>
        )}
      </View>
      {item.reply && (
        <>
          {item.reply.length !== 0 && (
            <>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => handlePress(item)}>
                  <Text className="ml-[50px] mt-[20px] text-white text-[16px]">
                    {active ? 'Hide Replies' : 'View Replies'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="ml-[10px] mt-[20px] text-white text-[16px]">
                    {item.likes.length}{' '}
                    {item.likes.length > 1 ? 'likes' : 'like'}
                  </Text>
                </TouchableOpacity>
              </View>
              {active && (
                <>
                  {item.reply.map(i => (
                    <PostDetailsCard
                      navigation={navigation}
                      item={i}
                      key={i._id}
                      isReply={true}
                      postId={postId}
                      isRepliesReply={true}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
};

export default PostDetailsCard;
