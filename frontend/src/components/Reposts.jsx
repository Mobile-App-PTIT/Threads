import axios from 'axios';
import uri from '../../redux/uri';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getTimeDuration from '../common/TimeGenerator';

const Reposts = ({ data, toggleLike, navigation, activeTab, ListHeaderComponent, user, updateStatus }) => {
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
      keyExtractor={(item) => item?.post_id?._id?.toString() || item?._id?.toString()}
      renderItem={({ item, index }) => (
        <View className="bg-zinc-900 p-5 mb-5 border border-b border-gray-700 rounded-lg">
          {/* User info */}
          <View className="flex-row items-center mb-3">
            <Image
              source={{
                uri:
                  item?.post_id?.user_id?.avatar ||
                  'https://example.com/default-avatar.jpg',
              }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <View className="ml-3">
              <Text className="text-white font-bold">
                {item?.post_id?.user_id?.name || 'Unknown User'}
              </Text>
              <Text className="text-gray-500 text-sm">
                {item?.post_id?.createdAt ? getTimeDuration(item.post_id.createdAt) : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleToggleStatus(index, item?.post_id?._id)}>
              <Ionicons
                name={statusList[index] === 'public' ? 'lock-open-outline' : 'lock-closed-outline'}
                size={20}
                color="white"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>

          {/* Post title and status */}
          <Text className="text-white mb-3 font-semibold">{item?.post_id?.title || 'No Title'}</Text>

          {/* Post image */}
          {item?.post_id?.media?.length > 0 && (
            <ScrollView horizontal>
              {item.post_id.media.map((media, index) => (
                <Image
                  key={index}
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
                toggleLike(item._id, item?.likes?.includes(user?._id), index)
              }
              className="flex-row items-center mr-4">
              <Ionicons
                name={item?.likes?.includes(user?._id) ? 'heart' : 'heart-outline'}
                size={20}
                color={item?.likes?.includes(user?._id) ? 'red' : 'white'}
              />
              <Text className="text-[16px] text-white ml-2">
                {item?.post_id?.likes?.length || 0} {item?.post_id?.likes?.length > 1 ? 'Likes' : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('PostDetailScreen', {
                  post_id: item?.post_id?._id,
                })
              }
              className="flex-row items-center mr-4">
              <Ionicons name="chatbubble-outline" size={20} color="white" />
              <Text className="text-[16px] text-white ml-2">
                {item?.post_id?.replies?.length || 0} {item?.post_id?.replies?.length > 1 ? 'Replies' : 'Reply'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text className="text-white mt-5 mx-5">Nothing here</Text>
      }
      style={{ backgroundColor: '#1c1c1e' }}
      contentContainerStyle={{ paddingBottom: 20, backgroundColor: '#1c1c1e' }}
    />
  );
};

export default Reposts;
