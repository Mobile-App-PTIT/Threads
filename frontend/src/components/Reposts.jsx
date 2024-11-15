import axios from 'axios';
import uri from '../../redux/uri';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getTimeDuration from '../common/TimeGenerator';

const Reposts = ({ data, toggleLike, navigation, activeTab, ListHeaderComponent, user }) => {
  const [statusList, setStatusList] = useState(data.map(item => item?.status || 'public'));

  const handleToggleStatus = async (index, post_id) => {
    const newStatus = statusList[index] === 'public' ? 'private' : 'public';

    try {
      await axios.patch(`${uri}/post/${post_id}/share/status`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
        },
      });

      const updatedStatusList = [...statusList];
      updatedStatusList[index] = newStatus;
      setStatusList(updatedStatusList);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <FlatList
      data={data}
      ListHeaderComponent={ListHeaderComponent}
      keyExtractor={(item) => item?._id?.toString()}
      renderItem={({ item, index }) => {
        const post = activeTab === 'Reposts' ? item.post_id : item;
        return (
          <View className="bg-zinc-900 p-5 mb-5 border border-b border-gray-700 rounded-lg">
            {/* User info */}
            <View className="flex-row items-center mb-3">
              <Image
                source={{
                  uri:
                    post?.user_id?.avatar ||
                    'https://example.com/default-avatar.jpg',
                }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
              <View className="ml-3">
                <Text className="text-white font-bold">
                  {post?.user_id?.name || 'Unknown User'}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {post?.createdAt ? getTimeDuration(post.createdAt) : ''}
                </Text>
              </View>
              {(
                <TouchableOpacity onPress={() => handleToggleStatus(index, post?._id)}>
                  <Ionicons
                    name={statusList[index] === 'public' ? 'lock-open-outline' : 'lock-closed-outline'}
                    size={20}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Post title and status */}
            <Text className="text-white mb-3 font-semibold">{post?.title || 'No Title'}</Text>

            {/* Post image */}
            {post?.media?.length > 0 && (
              <ScrollView horizontal>
                {post.media.map((media, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: media }}
                    style={{
                      width: 375,
                      height: 400,
                      borderRadius: 10,
                      marginRight: 20,
                    }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}

            <View className="flex-row gap-2 items-center mt-5">
              <TouchableOpacity
                onPress={() =>
                  toggleLike(post._id, post?.likes?.includes(user?._id), index)
                }
                className="flex-row items-center mr-4">
                <Ionicons
                  name={post?.likes?.includes(user?._id) ? 'heart' : 'heart-outline'}
                  size={20}
                  color={post?.likes?.includes(user?._id) ? 'red' : 'white'}
                />
                <Text className="text-[16px] text-white ml-2">
                  {post?.likes?.length || 0} {post?.likes?.length > 1 ? 'Likes' : 'Like'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('PostDetailScreen', {
                    post_id: post?._id,
                  })
                }
                className="flex-row items-center mr-4">
                <Ionicons name="chatbubble-outline" size={20} color="white" />
                <Text className="text-[16px] text-white ml-2">
                  {post?.replies?.length || 0} {post?.replies?.length > 1 ? 'Replies' : 'Reply'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <Text className="text-white mt-5 mx-5">Nothing here</Text>
      }
      style={{ backgroundColor: '#1c1c1e' }}
      contentContainerStyle={{ paddingBottom: 20, backgroundColor: '#1c1c1e' }}
    />
  );
};

export default Reposts;
