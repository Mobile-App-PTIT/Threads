import { createReducer } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  user: {},
  error: null,
  isLoading: false,
  isSuccess: false
};

export const messageReducer = createReducer(initialState, (builder) => {
  builder
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