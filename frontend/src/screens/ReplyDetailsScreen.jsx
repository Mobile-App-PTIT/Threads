import React, { useState, useEffect } from 'react';
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
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uri from '../../redux/uri';
import getTimeDuration from '../common/TimeGenerator';

const ReplyDetailsScreen = ({ navigation, route }) => {
  const { reply_id } = route.params;
  const { user } = useSelector(state => state.user);
  const [replies, setReplies] = useState([]);
  const [comment, setComment] = useState(null);
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
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${uri}/reply/${reply_id}`,
        {
          title: newReply,
          post_id: comment.post_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setReplies([response.data.metadata, ...replies]);
      setNewReply('');
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
        }
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
            : reply
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
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
                  ? { uri: comment.user_id.avatar }
                  : require('../../assets/images/avatar.jpg')
              }
              style={{ width: 35, height: 35, borderRadius: 17.5 }}
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
            <Ionicons
              name={comment?.likes?.includes(user._id) ? 'heart' : 'heart-outline'}
              size={20}
              color={comment?.likes?.includes(user._id) ? 'red' : 'white'}
            />
            <Text className="ml-2 text-gray-400">{comment?.likes?.length || 0} Likes</Text>
            <Ionicons name="chatbubble-outline" size={20} color="white" style={{ marginLeft: 16 }} />
            <Text className="ml-2 text-gray-400">{comment?.replies?.length || 0} Replies</Text>
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
                        ? { uri: reply.user_id.avatar }
                        : require('../../assets/images/avatar.jpg')
                    }
                    style={{ width: 35, height: 35, borderRadius: 17.5 }}
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
                <View className="flex-row items-center mt-2">
                  <TouchableOpacity
                    onPress={() => toggleLike(reply._id, reply.likes.includes(user._id), index)}
                    className="flex-row items-center mr-4"
                  >
                    <Ionicons
                      name={reply.likes.includes(user._id) ? 'heart' : 'heart-outline'}
                      size={20}
                      color={reply.likes.includes(user._id) ? 'red' : 'white'}
                    />
                    <Text className="ml-2 text-gray-400">{reply.likes.length || 0} Likes</Text>
                  </TouchableOpacity>
                  <Ionicons name="chatbubble-outline" size={20} color="white" />
                  <Text className="ml-2 text-gray-400">{reply?.replies?.length || 0} Replies</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="mt-4 text-gray-500">No replies yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* Reply Input Section */}
      <KeyboardAvoidingView behavior="padding">
        <View className="p-4 bg-zinc-800 border-t border-gray-700 flex-row items-center">
          <TextInput
            value={newReply}
            onChangeText={setNewReply}
            placeholder="Write a reply..."
            placeholderTextColor="#999"
            className="flex-1 bg-zinc-700 text-white p-3 rounded-lg"
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
