import React from 'react';
import { View, Text, Image, FlatList, ScrollView, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const UserReplied = ({ replies, ListHeaderComponent }) => {
  const renderComment = (comment) => (
    <View key={comment._id} style={styles.commentContainer}>
      <Image
        source={{ uri: comment.user_id.avatar }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentAuthor}>{comment.user_id.name}</Text>
        <Text style={styles.commentText}>{comment.title}</Text>
        {comment?.media?.length > 0 && (
          <ScrollView horizontal style={styles.mediaContainer}>
            {comment.media.map((mediaUrl, index) => (
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
                  controls={true} // Enables video controls (e.g., play/pause)
                  resizeMode="cover" // Covers the video to fit within container
                />
              )
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: item.post_id.user_id?.avatar || 'https://example.com/default-avatar.jpg' }}
          style={styles.postAvatar}
        />
        <View>
          <Text style={styles.postTitle}>{item.post_id.title}</Text>
          <Text style={styles.postDate}>{new Date(item.post_id.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {item.post_id.media.length > 0 && (
        <ScrollView horizontal style={styles.mediaContainer}>
          {item.post_id.media.map((mediaUrl, index) => (
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
          ))}
        </ScrollView>
      )}

      <View style={styles.commentSection}>
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
        <Text style={styles.emptyText}>Nothing here</Text>
      }
      contentContainerStyle={styles.flatListContent}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1c1c1e',
  },
  flatListContent: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  postContainer: {
    backgroundColor: '#2c2c2e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  postTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postDate: {
    color: 'gray',
    fontSize: 12,
    marginTop: 2,
  },
  mediaContainer: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
  mediaImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  mediaVideo: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  commentSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3c',
    paddingTop: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  commentAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
  },
  commentAuthor: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentText: {
    color: 'gray',
    fontSize: 12,
    marginTop: 3,
  },
  emptyText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default UserReplied;
