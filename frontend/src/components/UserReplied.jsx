import React from 'react';
import { View, Text, Image, FlatList, ScrollView, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const UserReplied = ({ replies, ListHeaderComponent }) => {
  console.log(replies);

  // Group replies by post_id
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

  // Helper function to check if the media URL is an image
  const isImage = (url) => {
    return /\.(jpeg|jpg|gif|png)$/i.test(url);
  };

  const renderPost = ({ item }) => {
    console.log('Rendering Post:', item.post.title);
    console.log('Replies:', item.replies);

    return (
      <View style={styles.postContainer}>
        {/* Post Information */}
        <View style={styles.postHeader}>
          <Image
            source={{
              uri:
                item.post.user_id?.avatar ||
                'https://example.com/default-avatar.jpg',
            }}
            style={styles.postAvatar}
          />
          <View>
            <Text style={styles.postAuthor}>{item.post.user_id.name}</Text>
            <Text style={styles.postDate}>
              {new Date(item.post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Post Content */}
        <Text style={styles.postTitle}>{item.post.title}</Text>

        {item.post.media && item.post.media.length > 0 && (
          <ScrollView horizontal style={styles.mediaContainer}>
            {item.post.media.map((mediaUrl, index) =>
              isImage(mediaUrl) ? (
                <Image
                  key={index}
                  source={{ uri: mediaUrl }}
                  style={styles.mediaImage}
                />
              ) : (
                <Video
                  key={index}
                  source={{ uri: mediaUrl }}
                  style={styles.mediaVideo}
                  controls={true}
                  resizeMode="cover"
                />
              )
            )}
          </ScrollView>
        )}

        {/* Display Replies */}
        <View style={styles.repliesContainer}>
          {item.replies && item.replies.length > 0 ? (
            item.replies.map((reply) => (
              <View key={reply._id} style={styles.replyContainer}>
                <Image
                  source={{ uri: reply.user_id.avatar }}
                  style={styles.replyAvatar}
                />
                <View style={styles.replyContent}>
                  <Text style={styles.replyAuthor}>{reply.user_id.name}</Text>
                  <Text style={styles.replyText}>{reply.title}</Text>
                  {reply.media && reply.media.length > 0 && (
                    <ScrollView horizontal style={styles.mediaContainer}>
                      {reply.media.map((mediaUrl, index) =>
                        isImage(mediaUrl) ? (
                          <Image
                            key={index}
                            source={{ uri: mediaUrl }}
                            style={styles.mediaImage}
                          />
                        ) : (
                          <Video
                            key={index}
                            source={{ uri: mediaUrl }}
                            style={styles.mediaVideo}
                            controls={true}
                            resizeMode="cover"
                          />
                        )
                      )}
                    </ScrollView>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noRepliesText}>No replies yet.</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={postsWithReplies}
      ListHeaderComponent={ListHeaderComponent}
      keyExtractor={(item) => item.post._id.toString()}
      renderItem={renderPost}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Nothing here</Text>
      }
      contentContainerStyle={styles.listContentContainer}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#1c1c1e',
  },
  listContentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  postContainer: {
    backgroundColor: '#2c2c2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  postAuthor: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postDate: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  postTitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  mediaContainer: {
    marginTop: 8,
  },
  mediaImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  mediaVideo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  repliesContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3c',
    paddingTop: 12,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  replyContent: {
    flex: 1,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
  },
  replyAuthor: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  replyText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  noRepliesText: {
    color: '#aaa',
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default UserReplied;
