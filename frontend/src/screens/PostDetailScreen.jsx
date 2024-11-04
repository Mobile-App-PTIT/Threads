import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import axios from 'axios';
import uri from '../../redux/uri';
import React, {useEffect, useState} from 'react';
import getTimeDuration from '../common/TimeGenerator';
import {useSelector} from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostDetailsScreen = ({navigation, route}) => {
  const post_id = route.params.post_id;
  const {user} = useSelector(state => state.user);
  const [postData, setPostData] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false); 
  const [image, setImage] = useState([]);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const postResponse = await axios.get(`${uri}/post/${post_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setPostData(postResponse.data.metadata);
        setComments(postResponse.data.metadata.replies);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPostAndComments();
  }, [post_id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${uri}/post/${post_id}/reply`,
        {title: newComment},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setComments([response.data.metadata, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const togglePostLike = async (postId, liked) => {
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

      // Update local state for post like count and liked status
      setPostData(prevData => ({
        ...prevData,
        likes: liked
          ? prevData.likes.filter(id => id !== user._id)
          : [...prevData.likes, user._id],
      }));
    } catch (error) {
      console.error('Error toggling post like:', error);
    }
  };

  const toggleCommentLike = async (reply_id, liked, index) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.patch(
        `${uri}/reply/${reply_id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setComments(prevComments =>
        prevComments.map((comment, i) =>
          i === index
            ? {
                ...comment,
                likes: liked
                  ? comment.likes.filter(id => id !== user._id)
                  : [...comment.likes, user._id],
              }
            : comment,
        ),
      );
    } catch (error) {
      console.error('Error liking/unliking comment:', error);
    }
  };

  const uploadPostImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.8,
      includeBase64: true,
      multiple: true,
    }).then(images => {
      if (images.length > 0) {
        const selectedImages = images.map(
          image => 'data:image/jpeg;base64,' + image.data,
        );
        setImage([...image, ...selectedImages]);
      }
    });
  };

  const removeImage = (index) => {
    setImage(prevImages => prevImages.filter((_, i) => i !== index));
  };
  console.log(postData);

  return (
    <SafeAreaView className="bg-zinc-900 flex-1">
      <ScrollView>
        {/* Header with Back Button */}
        <View className="flex-row items-center p-4 bg-zinc-900 border-b border-gray-700">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="pr-4">
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/2223/2223615.png',
              }}
              style={{width: 24, height: 24, tintColor: 'white'}}
            />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Post Details</Text>
        </View>

        <View className="p-4 border-b border-gray-700">
          <View className="flex-row items-center">
            <Image
              source={
                postData?.user_id?.avatar
                  ? {uri: postData.user_id.avatar}
                  : require('../../assets/images/avatar.jpg')
              }
              style={{width: 40, height: 40, borderRadius: 20}}
            />
            <View className="pl-3">
              <Text className="text-white font-bold">
                {postData?.user_id?.name || 'Unknown User'}
              </Text>
              <Text className="text-gray-500">
                {getTimeDuration(postData?.createdAt)}
              </Text>
            </View>
          </View>
          <Text className="mt-2 text-white font-semibold">
            {postData?.title || 'No Title'}
          </Text>
          
          {postData?.image && (
            <ScrollView horizontal className="my-3 flex flex-row">
              {postData?.image?.map((i, _id) => (
                <Image
                  key={_id}
                  source={{uri: i}}
                  style={{
                    aspectRatio: 1,
                    borderRadius: 10,
                    width: 260,
                    height: 260,
                    marginRight: 20,
                  }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}

          <View className="flex-row items-center mt-3">
            <TouchableOpacity
              onPress={() =>
                togglePostLike(post_id, postData.likes?.includes(user._id))
              }>
              <Ionicons
                name={
                  postData.likes?.includes(user._id) ? 'heart' : 'heart-outline'
                }
                size={24}
                color={postData.likes?.includes(user._id) ? 'red' : 'white'}
              />
            </TouchableOpacity>
            <Text className="ml-2 text-gray-400">
              {postData?.likes?.length || 0} Likes
            </Text>
          </View>
        </View>

        {/* Comments Section*/}
        <View className="p-4">
          <Text className="text-lg text-white font-bold">
            {comments.length} {comments.length > 1 ? 'Comments' : 'Comment'}
          </Text>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <View key={index} className="mt-4 p-3 border-b border-gray-700">
                <View className="flex-row items-center">
                  <Image
                    source={
                      comment?.user_id?.avatar
                        ? {uri: comment.user_id.avatar}
                        : require('../../assets/images/avatar.jpg')
                    }
                    style={{width: 35, height: 35, borderRadius: 17.5}}
                  />
                  <View className="pl-3">
                    <Text className="text-white font-medium">
                      {comment?.user_id?.name || 'Unknown User'}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {getTimeDuration(comment?.createdAt)}
                    </Text>
                  </View>
                </View>
                <Text className="mt-2 text-gray-400">
                  {comment?.title || 'No Content'}
                </Text>
                <View className="flex-row items-center mt-2">
                  <TouchableOpacity
                    onPress={() =>
                      toggleCommentLike(
                        comment._id,
                        comment.likes.includes(user._id),
                        index,
                      )
                    }
                    className="flex-row items-center mr-4">
                    <Ionicons
                      name={
                        comment.likes.includes(user._id)
                          ? 'heart'
                          : 'heart-outline'
                      }
                      size={20}
                      color={comment.likes.includes(user._id) ? 'red' : 'white'}
                    />
                    <Text className="ml-2 text-gray-400">
                      {comment.likes.length || 0} Likes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('ReplyDetailsScreen', {
                        reply_id: comment._id,
                      })
                    }
                    className="ml-1 flex flex-row">
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="white"
                    />
                    <Text className="ml-2 text-gray-400">
                    {comment?.replies?.length || 0} Replies
                  </Text>
                  </TouchableOpacity>
                  
                </View>
              </View>
            ))
          ) : (
            <Text className="mt-4 text-gray-500">No comment yet.</Text>
          )}
        </View>
      </ScrollView>

      {image.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{height: 100}}
          className="flex-row p-2 bg-zinc-800 border-t border-gray-700 z-50">
          {image.map((image, index) => (
            <View key={index} className="mr-2 relative">
              <Image
                source={{ uri: image }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 10,
                  padding: 2,
                }}>
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <KeyboardAvoidingView behavior="padding">
        <View className="p-4 bg-zinc-800 border-t border-gray-700 flex-row items-center gap-2">
          {!isInputFocused && (
            <>
              <TouchableOpacity>
                <Feather name="video" color={'white'} size={21} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Feather name="mic" color={'white'} size={21} />
              </TouchableOpacity>
              <TouchableOpacity className="mr-2" onPress={uploadPostImage}>
                <Ionicons name="images-outline" size={22} color="white" />
              </TouchableOpacity>
            </>
          )}

          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            placeholderTextColor="#999"
            className="flex-1 bg-zinc-700 text-white p-2 rounded-lg"
            onFocus={() => setIsInputFocused(true)} 
            onBlur={() => setIsInputFocused(false)} 
          />

          <TouchableOpacity onPress={handleAddComment} className="ml-3">
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostDetailsScreen;
