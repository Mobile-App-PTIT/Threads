import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import uri from '../../redux/uri';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SharePopup = ({isVisible, onClose, post_id, func, onUpdated}) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleShare = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.patch(
        `${uri}/post/${post_id}/share`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      onClose();
      
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(
        `${uri}/post/${post_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      onClose();
      if (typeof onUpdated === 'function') {
        onUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReply = async () => {
    try {
      const token = await AsyncStorage.getItem('token');  
      const reply_id = post_id;
      await axios.delete(`${uri}/reply/${reply_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      onClose();
      if (typeof onUpdated === 'function') {
        onUpdated();
      }
      
    } catch (err) {
      console.error(err);
    }
  }

  const handleDeleteComment = async () => {
  
  }

  return (
    <Modal transparent visible={isVisible} animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlay} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContainer,
            {transform: [{translateY: slideAnim}]},
          ]}>
          {func === 'share' && (
            <>
              <Text style={styles.modalText}>
                Do you want to share this post?
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleShare}>
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </>
          )}
          {func === 'deletePost' && (
            <>
              <Text style={styles.modalText}>
                Do you want to delete this post?
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleDeletePost}>
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </>
          )}
          {func === 'deleteComment' && (
            <>
              <Text style={styles.modalText}>
                Do you want to delete comment?
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleDeleteComment}>
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </>
          )}
           {func === 'deleteReply' && (
            <>
              <Text style={styles.modalText}>
                Do you want to delete reply?
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleDeleteReply}>
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default SharePopup;
