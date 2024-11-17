import { createReducer } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  user: {},
  error: null,
  isLoading: true,
  isSuccess: false
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
        state.users[index].lastMessage = message.lastMessage;
        state.users[index].lastMessageTime = message.lastMessageTime;
      }
    })
    .addCase('getFollowingAndFollowersRequest', (state) => {
      state.isLoading = true;
    })
    .addCase('getFollowingAndFollowersSuccess', (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.users = action.payload;
    })
    .addCase('getFollowingAndFollowersFailed', (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase('clearError', (state) => {
      state.error = null;
    });
});