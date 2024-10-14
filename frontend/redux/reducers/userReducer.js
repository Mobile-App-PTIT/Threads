import {createReducer} from '@reduxjs/toolkit';

const intialState = {
  isAuthenticated: false,
  loading: false,
  isLoading: false,
  user: {},
  users: [],
  token:"",
  error: null,
  followers: 0,
};

export const userReducer = createReducer(intialState, (builder) => {
  builder
  .addCase('userRegisterRequest', (state) => {
    state.loading = true;
    state.isAuthenticated = false;
  })
  .addCase('userRegisterSuccess', (state, action) => {
    state.loading = false;
    state.isAuthenticated = true;
    state.user = action.payload;
  })    
  .addCase('userRegisterFailed', (state, action) => {
    state.loading = false;
    state.isAuthenticated = false;
    state.error = action.payload;
  })
  .addCase('userLoadRequest', (state) => {
    state.loading = true;
  })
  .addCase('userLoadSuccess', (state, action) => {
    state.loading = false;
    state.isAuthenticated = true;
    state.user = action.payload.user;
    state.token = action.payload.token;
  })
  .addCase('userLoadFailed', (state, action) => {
    state.loading = false;
    state.isAuthenticated = false;
  })
  .addCase('userLoginRequest', (state) => {
    state.loading = true;
    state.isAuthenticated = false;
  })
  .addCase('userLoginSuccess', (state, action) => {
    state.loading = false;
    state.isAuthenticated = true;
    state.user = action.payload;
  })
  .addCase('userLoginFailed', (state, action) => {
    state.loading = false;
    state.isAuthenticated = false;
    state.error = action.payload;
    state.user = {};
  })
  .addCase('userLogoutRequest', (state) => {
    state.loading = true;
  })
  .addCase('userLogoutSuccess', (state) => {
    state.loading = false;
    state.isAuthenticated = false;
    state.user = {};
  })
  .addCase('userLogoutFailed', (state) => {
    state.loading = false;
  })
  .addCase('getUsersRequest', (state) => {
    state.isLoading = true;
  })
  .addCase('getUsersSuccess', (state, action) => {
    state.isLoading = false;
    state.users = action.payload;
  })
  .addCase('getUsersFailed', (state, action) => {
    state.isLoading = false;
    state.users = action.payload;
  })
  .addCase('clearError', (state) => {
    state.error = null;
    state.isAuthenticated = false;
  })
});