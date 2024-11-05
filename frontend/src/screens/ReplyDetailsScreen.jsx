import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uri from '../../redux/uri';
import getTimeDuration from '../common/TimeGenerator';
import Video from 'react-native-video';
import {Audio} from 'expo-av';

const ReplyDetailsScreen = ({navigation, route}) => {
  const {reply_id} = route.params;
  const {user} = useSelector(state => state.user);
  const [replies, setReplies] = useState([]);
  const [comment, setComment] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    const fetchCommentAndReplies = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const commentResponse = await axios.get(`${uri}/reply/${reply_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setComment(commentResponse.data.metadata);
        setReplies(commentResponse.data.metadata.replies);
      } catch (error) {
        console.error('Error fetching comment and replies:', error);
      }
    };
    fetchCommentAndReplies();
  }, [reply_id]);

  const handleAddReply = async () => {
    if (!newReply.trim()) return;

    try {
      const formData = new FormData();
      formData.append('title', newReply);
      formData.append('post_id', comment.post_id);

      mediaFiles.forEach((file, index) => {
        formData.append('mediaFiles', {
          uri: file.uri,
          type: file.type,
          name: `mediaFile_${index}.${file.type.split('/')[1]}`,
        });
      });

      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${uri}/reply/${reply_id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setReplies([response.data.metadata, ...replies]);
      setNewReply('');
      setMediaFiles([]);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const toggleLike = async (replyId, liked, index) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.patch(
        `${uri}/reply/${replyId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setReplies(prevReplies =>
        prevReplies.map((reply, i) =>
          i === index
            ? {
                ...reply,
                likes: liked
                  ? reply.likes.filter(id => id !== user._id)
                  : [...reply.likes, user._id],
              }
            : reply,
        ),
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const uploadPostMedia = type => {
    const options = {
      multiple: true,
      compressImageQuality: 0.8,
      includeBase64: false,
      mediaType: type,
    };

    if (type === 'photo' || type === 'video') {
      ImagePicker.openPicker(options)
        .then(files => {
          const selectedFiles = Array.isArray(files) ? files : [files];
          const newFiles = selectedFiles.map(file => ({
            uri: file.path,
            type: file.mime,
          }));
          setMediaFiles(prevFiles => [...prevFiles, ...newFiles]);
        })
        .catch(error => {
          console.error('Error picking media:', error);
        });
    } else if (type === 'audio') {
      // Implement audio picker if available
      Alert.alert('Audio upload is not supported in this demo.');
    }
  };

  const removeMediaFile = index => {
    setMediaFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView className="bg-zinc-900 flex-1">
      {/* Header with Back Button */}
      <View className="flex-row items-center p-4 bg-zinc-900 border-b border-gray-700">
        <TouchableOpacity onPress={() => navigation.goBack()} className="pr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Comment Details</Text>
      </View>

      {/* Display the main comment */}
      {comment && (
        <View className="p-4 border-b border-gray-700">
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
          {/* Render Media for the Comment */}
          {comment?.media && comment.media.length > 0 && (
            <ScrollView horizontal className="my-3 flex flex-row">
              {comment.media.map((mediaItem, idx) => {
                // Since mediaItem is a string (URL), we need to determine the media type
                const mediaUrl = mediaItem;
                let mediaType = '';

                if (mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i)) {
                  mediaType = 'image';
                } else if (mediaUrl.match(/\.(mp4|mov|avi|mkv)$/i)) {
                  mediaType = 'video';
                } else if (mediaUrl.match(/\.(mp3|wav|ogg)$/i)) {
                  mediaType = 'audio';
                } else {
                  // Default to image if unable to determine
                  mediaType = 'image';
                }

                if (mediaType === 'image') {
                  return (
                    <Image
                      key={idx}
                      source={{uri: mediaUrl}}
                      style={{
                        width: 260,
                        height: 260,
                        borderRadius: 10,
                        marginRight: 20,
                      }}
                      resizeMode="cover"
                    />
                  );
                } else if (mediaType === 'video') {
                  return (
                    <Video
                      key={idx}
                      source={{uri: mediaUrl}}
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
                } else if (mediaType === 'audio') {
                  return (
                    <View key={idx} style={{marginRight: 20}}>
                      <Text style={{color: 'white'}}>Audio Clip {idx + 1}</Text>
                      {/* Implement an audio player */}
                    </View>
                  );
                } else {
                  return null;
                }
              })}
            </ScrollView>
          )}
          <View className="flex-row items-center mt-2">
            <Ionicons
              name={
                comment?.likes?.includes(user._id) ? 'heart' : 'heart-outline'
              }
              size={20}
              color={comment?.likes?.includes(user._id) ? 'red' : 'white'}
            />
            <Text className="ml-2 text-gray-400">
              {comment?.likes?.length || 0} Likes
            </Text>
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color="white"
              style={{marginLeft: 16}}
            />
            <Text className="ml-2 text-gray-400">
              {comment?.replies?.length || 0} Replies
            </Text>
          </View>
        </View>
      )}

      <ScrollView>
        <View className="p-4">
          <Text className="text-lg text-white font-bold">
            Replies ({replies.length})
          </Text>
          {replies?.length > 0 ? (
            replies.map((reply, index) => (
              <View key={index} className="mt-4 p-3 border-b border-gray-700">
                <View className="flex-row items-center">
                  <Image
                    source={
                      reply?.user_id?.avatar
                        ? {uri: reply.user_id.avatar}
                        : require('../../assets/images/avatar.jpg')
                    }
                    style={{width: 35, height: 35, borderRadius: 17.5}}
                  />
                  <View className="pl-3">
                    <Text className="text-white font-medium">
                      {reply?.user_id?.name || 'Unknown User'}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {getTimeDuration(reply?.createdAt)}
                    </Text>
                  </View>
                </View>
                <Text className="mt-2 text-gray-400">
                  {reply?.title || 'No Content'}
                </Text>
                {/* Render Media for the Reply */}
                {reply?.media && reply.media.length > 0 && (
                  <ScrollView horizontal className="my-3 flex flex-row">
                    {reply.media.map((mediaItem, idx) => {
                      const mediaUrl = mediaItem;
                      let mediaType = '';

                      if (mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i)) {
                        mediaType = 'image';
                      } else if (mediaUrl.match(/\.(mp4|mov|avi|mkv)$/i)) {
                        mediaType = 'video';
                      } else if (mediaUrl.match(/\.(mp3|wav|ogg)$/i)) {
                        mediaType = 'audio';
                      } else {
                        mediaType = 'image';
                      }

                      if (mediaType === 'image') {
                        return (
                          <Image
                            key={idx}
                            source={{uri: mediaUrl}}
                            style={{
                              width: 260,
                              height: 260,
                              borderRadius: 10,
                              marginRight: 20,
                            }}
                            resizeMode="cover"
                          />
                        );
                      } else if (mediaType === 'video') {
                        return (
                          <Video
                            key={idx}
                            source={{uri: mediaUrl}}
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
                      } else if (mediaType === 'audio') {
                        return (
                          <View key={idx} style={{marginRight: 20}}>
                            <Text style={{color: 'white'}}>
                              Audio Clip {idx + 1}
                            </Text>
                            {/* Implement an audio player */}
                          </View>
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
                      toggleLike(
                        reply._id,
                        reply.likes.includes(user._id),
                        index,
                      )
                    }
                    className="flex-row items-center mr-4">
                    <Ionicons
                      name={
                        reply.likes.includes(user._id)
                          ? 'heart'
                          : 'heart-outline'
                      }
                      size={20}
                      color={reply.likes.includes(user._id) ? 'red' : 'white'}
                    />
                    <Text className="ml-2 text-gray-400">
                      {reply.likes.length || 0} Likes
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text className="mt-4 text-gray-500">No replies yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row p-2 bg-zinc-800 border-t border-gray-700">
          {mediaFiles.map((file, index) => {
            const mediaType = file.type.split('/')[0];
            if (mediaType === 'image') {
              return (
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
              );
            } else if (mediaType === 'video') {
              return (
                <View key={index} className="mr-2 relative">
                  <Video
                    source={{uri: file.uri}}
                    style={{width: 100, height: 100, borderRadius: 8}}
                    resizeMode="cover"
                    muted
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
              );
            } else if (mediaType === 'audio') {
              return (
                <View key={index} className="mr-2 relative">
                  <Feather name="music" size={50} color="white" />
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
              );
            } else {
              return null;
            }
          })}
        </ScrollView>
      )}

      {/* Reply Input Section */}
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
                onPress={() => uploadPostMedia('photo')}>
                <Ionicons name="images-outline" size={22} color="white" />
              </TouchableOpacity>
            </>
          )}
          <TextInput
            value={newReply}
            onChangeText={setNewReply}
            placeholder="Write a reply..."
            placeholderTextColor="#999"
            className="flex-1 bg-zinc-700 text-white p-2 rounded-lg"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          <TouchableOpacity onPress={handleAddReply} className="ml-3">
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ReplyDetailsScreen;
