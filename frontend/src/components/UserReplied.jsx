import React from 'react';
import { View, Text, Image, FlatList, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Video from 'react-native-video';

const UserReplied = ({ replies, ListHeaderComponent }) => {
  const groupedData = {};
  replies.forEach((reply) => {
    const postId = reply.post_id._id;
    if (!groupedData[postId]) {
      groupedData[postId] = {
        post: reply.post_id,
        replies: [],
      };
    }
    groupedData[postId].replies.push(reply);
  });
  const postsWithReplies = Object.values(groupedData);

  const isImage = (url) => /\.(jpeg|jpg|gif|png)$/i.test(url);

  const renderPost = ({ item }) => (
    <View className="bg-zinc-900 p-5 mb-5 border border-b border-gray-700 rounded-lg">
      {/* Post Information */}
      <View className="flex-row items-center mb-3">
        <Image
          source={{
            uri: item.post.user_id?.avatar || 'https://example.com/default-avatar.jpg',
          }}
          className="w-10 h-10 rounded-full"
        />
        <View className="ml-3">
          <Text className="text-white font-bold">{item.post.user_id.name}</Text>
          <Text className="text-gray-500 text-sm">
            {new Date(item.post.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Post Title */}
      <Text className="text-white mb-3 font-semibold">{item.post.title}</Text>

      {/* Post Media */}
      {item.post.media?.length > 0 && (
        <ScrollView horizontal className="mt-2">
          {item.post.media.map((mediaUrl, index) =>
            isImage(mediaUrl) ? (
              <Image
                key={index}
                source={{ uri: mediaUrl }}
                className="w-60 h-60 rounded-lg mr-5"
                resizeMode="cover"
                controls
              />
            ) : (
              <Video
                key={index}
                source={{ uri: mediaUrl }}
                className="w-60 h-60 rounded-lg mr-5"
                controls
                resizeMode="cover"
              />
            )
          )}
        </ScrollView>
      )}

      {/* Replies Section */}
      <View className="mt-5">
        {item.replies?.length > 0 ? (
          item.replies.map((reply) => (
            <View key={reply._id} className="flex-row items-start mb-5">
              <Image
                source={{ uri: reply.user_id.avatar }}
                className="w-9 h-9 rounded-full mr-3"
              />
              <View className="bg-gray-800 p-4 rounded-lg flex-1">
                <Text className="text-white font-bold">{reply.user_id.name}</Text>
                <Text className="text-gray-400 text-sm mt-1">{reply.title}</Text>
                {reply.media?.length > 0 && (
                  <ScrollView horizontal className="mt-2">
                    {reply.media.map((mediaUrl, index) =>
                      isImage(mediaUrl) ? (
                        <Image
                          key={index}
                          source={{ uri: mediaUrl }}
                          className="w-40 h-40 rounded-lg mr-3"
                        />
                      ) : (
                        <Video
                          key={index}
                          source={{ uri: mediaUrl }}
                          className="w-40 h-40 rounded-lg mr-3"
                          controls
                          resizeMode="cover"
                        />
                      )
                    )}
                  </ScrollView>
                )}
                <View className="flex-row gap-4 mt-2">
                  <Ionicons name="heart-outline" size={20} color="white" />
                  <Ionicons name="chatbubble-outline" size={18} color="white" />
                  <Feather name="share-2" size={18} color="white" />
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-gray-400 italic">No replies yet.</Text>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      data={postsWithReplies}
      ListHeaderComponent={ListHeaderComponent}
      keyExtractor={(item) => item.post._id.toString()}
      renderItem={renderPost}
      ListEmptyComponent={
        <Text className="text-white mt-5 mx-5">Nothing here</Text>
      }
      className="bg-zinc-900"
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

export default UserReplied;
