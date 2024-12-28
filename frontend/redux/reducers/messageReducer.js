import {createReducer} from '@reduxjs/toolkit';

const initialState = {
    users: [],
    messageUser: {},
    error: null,
    isLoading: true,
    isSuccess: false,
    newCallMess: null,
};

export const messageReducer = createReducer(initialState, (builder) => {
    builder
        .addCase('online', (state, action) => {
            const userId = action.payload;
            const index = state.users.findIndex((u) => u.id === userId);
            if (index !== -1) {
                state.users[index].isOnline = true;
            }
        })
        .addCase('offline', (state, action) => {
            const userId = action.payload;
            const index = state.users.findIndex((u) => u.id === userId);
            if (index !== -1) {
                state.users[index].isOnline = false;
            }
        })
        .addCase('newLastMessage', (state, action) => {
            const message = action.payload;
            const index = state.users.findIndex((u) => u.id === message.id);
            if (index !== -1) {
                if (message.type === 'image') {
                    state.users[index].lastMessage = 'Received an image';
                } else {
                    state.users[index].lastMessage = message.lastMessage;
                }
                state.users[index].lastMessageTime = message.lastMessageTime;
                state.users[index].status = message.status;
                state.users[index].isMe = false;
            }
        })
        .addCase('getListSuccess', (state, action) => {
            state.users = action.payload;
        })
        .addCase('updateLastSeenSuccess', (state, action) => {
            const data = action.payload;
            const index = state.users.findIndex((u) => u.id === data.userId);
            if (index !== -1) {
                state.users[index].lastSeen = data.seenAt;
                state.users[index].status = 'read';
            }
        })
        .addCase('getFollowingAndFollowersSuccess', (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.users = action.payload;
        })
        .addCase('sendMessage', (state, action) => {
            const message = action.payload;
            const index = state.users.findIndex((u) => u.id === message.user._id);
            if (index !== -1) {
                if (message.type === 'image') {
                    state.users[index].lastMessage = 'Sent an image';
                } else {
                    state.users[index].lastMessage = message.text;
                }
                state.users[index].lastMessageTime = message.createdAt.toString();
                state.users[index].isMe = true;

                if (message.type === 'call') {
                    state.newCallMess = message;
                }
            }
        })
        .addCase('clearError', (state) => {
            state.error = null;
        });
});