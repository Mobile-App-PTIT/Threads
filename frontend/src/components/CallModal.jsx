import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import VideoChat from '@stream-io/react-native-video-chat';

const CallModal = ({ visible, token, userId, callType, onLeave }) => {
    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <VideoChat
                    userId={userId}
                    token={token}
                    callType={callType} // 'video' hoặc 'audio'
                    style={{ flex: 1 }}
                    onLeaveCall={onLeave}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
});

export default CallModal;
