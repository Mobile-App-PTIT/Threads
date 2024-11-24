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
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Popup from '../components/Popup';

const PostDetailsScreen = ({navigation, route}) => {
  const post_id = route.params.post_id;
  const {user} = useSelector(state => state.user);
  const [postData, setPostData] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedComment, setSelectedComment] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);

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
      const formData = new FormData();
      formData.append('title', newComment);
      formData.append('post_id', post_id);

      // Append media files to formData
      mediaFiles.forEach((file, index) => {
        formData.append('mediaFiles', {
          uri: file.uri,
          type: file.type,
          name: `mediaFile_${index}.${file.type.split('/')[1]}`,
        });
      });

      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${uri}/post/${post_id}/reply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setComments([response.data.metadata, ...comments]);
      setNewComment('');
      setMediaFiles([]);
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

  const uploadPostMedia = type => {
    const options = {
      multiple: true,
      compressImageQuality: 0.8,
      includeBase64: true,
    };
    if (type === 'image') {
      ImagePicker.openPicker({...options, mediaType: 'photo'}).then(files => {
        const selectedFiles = files.map(file => ({
          uri: `data:image/jpeg;base64,${file.data}`,
          type: 'image/jpeg',
        }));
        setMediaFiles(prevFiles => [...prevFiles, ...selectedFiles]);
      });
    } else if (type === 'video') {
      ImagePicker.openPicker({...options, mediaType: 'video'}).then(files => {
        const selectedFiles = files.map(file => ({
          uri: file.path,
          type: 'video/mp4',
        }));
        setMediaFiles(prevFiles => [...prevFiles, ...selectedFiles]);
      });
    } else if (type === 'audio') {
      // Here you can use a different picker for audio, if available
      Alert.alert('Audio upload is currently not supported in this demo.');
    }
  };

  const removeMediaFile = index => {
    setMediaFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const onPressDelete = (comment_id) => {
    setSelectedComment(comment_id);
    setIsDeletePopupVisible(true);
  };

  return (
    <>
      <SafeAreaView className="bg-zinc-900 flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingBottom: mediaFiles.length > 0 ? 130 : 0, // Adjust padding based on mediaFiles
          }}>
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
            <Text className="text-white text-lg font-bold">Post Detail</Text>
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

            {postData?.media && (
              <ScrollView horizontal className="my-3 flex flex-row">
                {postData?.media?.map((i, _id) => (
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
                    postData.likes?.includes(user._id)
                      ? 'heart'
                      : 'heart-outline'
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
                  <View className='flex flex-row justify-between'>
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
                    <TouchableOpacity
                      className=""
                      onPress={() => onPressDelete(comment?._id)}>
                      <Ionicons
                        name="ellipsis-horizontal"
                        color="white"
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text className="mt-2 text-gray-400">
                    {comment?.title || 'No Content'}
                  </Text>

                  {/* Render Media */}
                  {comment?.media && comment.media.length > 0 && (
                    <ScrollView horizontal className="my-3 flex flex-row">
                      {comment.media.map((mediaItem, idx) => {
                        const isImage = mediaItem.match(
                          /\.(jpeg|jpg|gif|png)$/i,
                        );
                        const isVideo =
                          mediaItem.match(/\.(mp4|mov|avi|mkv)$/i);

                        if (isImage) {
                          return (
                            <Image
                              key={idx}
                              source={{uri: mediaItem}}
                              style={{
                                width: 260,
                                height: 260,
                                borderRadius: 10,
                                marginRight: 20,
                              }}
                              resizeMode="cover"
                            />
                          );
                        } else if (isVideo) {
                          return (
                            <Video
                              key={idx}
                              source={{uri: mediaItem}}
                              style={{
                                width: 260,
                                height: 260,
                                borderRadius: 10,
                                marginRight: 20,
                              }}
                              controls
                              resizeMode="cover"
                            />
                          );
                        } else {
                          return null;
                        }
                      })}
                    </ScrollView>
                  )}

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
                        color={
                          comment.likes.includes(user._id) ? 'red' : 'white'
                        }
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

        {mediaFiles.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row p-4 bg-zinc-800 border-t border-gray-700 absolute w-full bottom-20">
            {mediaFiles.map((file, index) => (
              <View key={index} className="mr-2 relative">
                <Image
                  source={{uri: file.uri}}
                  style={{width: 100, height: 100, borderRadius: 8}}
                />
                <TouchableOpacity
                  onPress={() => removeMediaFile(index)}
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
                <TouchableOpacity onPress={() => uploadPostMedia('video')}>
                  <Feather name="video" color={'white'} size={21} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => uploadPostMedia('audio')}>
                  <Feather name="mic" color={'white'} size={21} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="mr-2"
                  onPress={() => uploadPostMedia('image')}>
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
              <Ionicons name="send" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Popup 
        isVisible={isDeletePopupVisible} 
        onClose={() => setIsDeletePopupVisible(false)}
        post_id={selectedComment}
        func="deleteComment"/>
    </>
  );
};

export default PostDetailsScreen;
