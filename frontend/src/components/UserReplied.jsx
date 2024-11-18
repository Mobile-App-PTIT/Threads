import React from 'react';
import { View, Text, Image, FlatList, ScrollView } from 'react-native';
import Video from 'react-native-video';

const UserReplied = ({ replies, ListHeaderComponent }) => {
  console.log(replies);

  const renderComment = (comment) => (
    <View key={comment._id} className="flex-row items-center my-2">
      <Image
        source={{ uri: comment.user_id.avatar }}
        className="w-9 h-9 rounded-full mr-3"
      />
      <View className="flex-1 bg-[#333] p-3 rounded-lg">
        <Text className="text-white font-bold text-sm">
          {comment.user_id.name}
        </Text>
        <Text className="text-gray-500 text-xs mt-1">{comment.title}</Text>
        {comment?.media?.length > 0 && (
          <ScrollView horizontal className="mt-3 px-2">
            {comment.media.map((mediaUrl, index) =>
              isImage(mediaUrl) ? (
                <Image
                  key={index}
                  source={{ uri: mediaUrl }}
                  className="w-30 h-30 rounded-lg mr-3"
                />
              ) : (
                <Video
                  key={index}
                  source={{ uri: mediaUrl }}
                  className="w-30 h-30 rounded-lg mr-3"
                  controls={true}
                  resizeMode="cover"
                />
              )
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const renderPost = ({ item }) => (
    <View className="bg-[#2c2c2e] p-4 rounded-xl mb-4 shadow-lg">
      <View className="flex-row items-center mb-3">
        <Image
          source={{
            uri:
              item.post_id.user_id?.avatar ||
              'https://example.com/default-avatar.jpg',
          }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View>
          <Text className="text-white font-bold text-base">
            {item.post_id.title}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            {new Date(item.post_id.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {item.post_id.media.length > 0 && (
        <ScrollView horizontal className="mt-3 px-2">
          {item.post_id.media.map((mediaUrl, index) =>
            isImage(mediaUrl) ? (
              <Image
                key={index}
                source={{ uri: mediaUrl }}
                className="w-30 h-30 rounded-lg mr-3"
              />
            ) : (
              <Video
                key={index}
                source={{ uri: mediaUrl }}
                className="w-30 h-30 rounded-lg mr-3"
                controls={true}
                resizeMode="cover"
              />
            )
          )}
        </ScrollView>
      )}

      <View className="mt-4 border-t border-[#3a3a3c] pt-3">
        {renderComment(item)}
      </View>
    </View>
  );

  // Helper function to check if the media URL is an image
  const isImage = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

  return (
    <FlatList
      data={replies}
      ListHeaderComponent={ListHeaderComponent}
      keyExtractor={(item) => item._id.toString()}
      renderItem={renderPost}
      ListEmptyComponent={
        <Text className="text-white text-center mt-5">Nothing here</Text>
      }
      contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
      style={{ backgroundColor: '#1c1c1e' }}
    />
  );
};

export default UserReplied;
