"use strict";

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
import Ionicons from 'react-native-vector-icons/Ionicons';

const PostDetailsScreen = ({navigation, route}) => {
  const post_id = route.params.post_id;
  const token = useSelector(state => state.user.token);
  const [postData, setPostData] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
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
      const response = await axios.post(
        `${uri}/post/${post_id}/reply`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setComments([response.data.metadata, ...comments]);
      setNewComment(''); 
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <SafeAreaView className="bg-zinc-900 flex-1">
      <ScrollView>
        {/* Header with Back Button */}
        <View className="flex-row items-center p-4 bg-zinc-900 border-b border-gray-700">
          <TouchableOpacity onPress={() => navigation.goBack()} className="pr-4">
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/2223/2223615.png',
              }}
              style={{ width: 24, height: 24, tintColor: 'white' }}
            />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Post Details</Text>
        </View>

        {/* Display the main post at the top */}
        <View className="p-4 border-b border-gray-700">
          <View className="flex-row items-center">
            <Image
              source={
                postData?.user_id?.avatar
                  ? { uri: postData.user_id.avatar }
                  : require('../../assets/images/avatar.jpg')
              }
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <View className="pl-3">
              <Text className="text-white font-bold">{postData?.user_id?.name || 'Unknown User'}</Text>
              <Text className="text-gray-500">{getTimeDuration(postData?.createdAt)}</Text>
            </View>
          </View>
          <Text className="mt-2 text-white font-semibold">{postData?.title || 'No Title'}</Text>
          {postData?.image && (
            <Image
              source={{ uri: postData.image[0] }}
              style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }}
              resizeMode="cover"
            />
          )}
          <View className="flex-row items-center mt-3">
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={24} color="white" />
            </TouchableOpacity>
            <Text className="ml-2 text-gray-400">{postData?.likes?.length || 0} Likes</Text>
          </View>
        </View>

        {/* Comments Section */}
        <View className="p-4">
          <Text className="text-lg text-white font-bold">Comments</Text>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <View key={index} className="mt-4 p-3 border-b border-gray-700">
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
                    <Text className="text-white font-medium">{comment?.user_id?.name || 'Unknown User'}</Text>
                    <Text className="text-gray-500 text-xs">{getTimeDuration(comment?.createdAt)}</Text>
                  </View>
                </View>
                <Text className="mt-2 text-gray-400">{comment?.content || 'No Content'}</Text>
                <View className="flex-row items-center mt-2">
                  <TouchableOpacity>
                    <Ionicons name="heart" size={20} color="red" />
                  </TouchableOpacity>
                  <Text className="ml-2 text-gray-400">{comment?.likes?.length || 0} Likes</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="mt-4 text-gray-500">No comments yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* Comment Input Section */}
      <KeyboardAvoidingView behavior="padding">
        <View className="p-4 bg-zinc-800 border-t border-gray-700 flex-row items-center">
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            placeholderTextColor="#999"
            className="flex-1 bg-zinc-700 text-white p-3 rounded-lg"
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
