import React from 'react';
import {View, Text, Image, TouchableOpacity, FlatList, ScrollView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import getTimeDuration from '../common/TimeGenerator';

const Reposts = ({data, user, toggleLike, navigation, activeTab, ListHeaderComponent}) => {
  return (
    <FlatList
      data={data}
      ListHeaderComponent={ListHeaderComponent}
      keyExtractor={item => item._id.toString()}
      renderItem={({item, index}) => (
        <View className="bg-zinc-900 p-5 mb-5 border border-b border-gray-700 rounded-lg">
          {/* User info */}
          <View className="flex-row items-center mb-3">
            <Image
              source={{
                uri:
                  item.user_id?.avatar ||
                  'https://example.com/default-avatar.jpg',
              }}
              style={{width: 40, height: 40, borderRadius: 20}}
            />
            <View className="ml-3">
              <Text className="text-white font-bold">
                {item.user_id?.name || 'Unknown User'}
              </Text>
              <Text className="text-gray-500 text-sm">
                {getTimeDuration(item.createdAt)}
              </Text>
            </View>
          </View>

          {/* Post title and status */}
          <Text className="text-white mb-3 font-semibold">{item.title}</Text>

          {/* Post image (if available) */}
          {item.media?.length > 0 && (
            <ScrollView horizontal>
              {item.media.map((media, index) => (
                <Image
                  key={index}
                  source={{uri: media}}
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
                toggleLike(item._id, item.likes.includes(user._id), index)
              }
              className="flex-row items-center mr-4">
              <Ionicons
                name={item.likes.includes(user._id) ? 'heart' : 'heart-outline'}
                size={20}
                color={item.likes.includes(user._id) ? 'red' : 'white'}
              />
              <Text className="text-[16px] text-white ml-2">
                {item.likes.length} {item.likes.length > 1 ? 'Likes' : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('PostDetailScreen', {
                  post_id: item._id,
                })
              }
              className="flex-row items-center mr-4">
              <Ionicons name="chatbubble-outline" size={20} color="white" />
              <Text className="text-[16px] text-white ml-2">
                {item?.replies?.length
                  ? `${item?.replies?.length} Replies`
                  : '0 Replies'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text className="text-white mt-5 mx-5">Nothing here</Text>
      }
      style={{backgroundColor: '#1c1c1e'}}
      contentContainerStyle={{paddingBottom: 20, backgroundColor: '#1c1c1e'}}
    />
  );
};

export default Reposts;
