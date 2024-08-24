import { createReducer } from '@reduxjs/toolkit';

const initialState = {
    isAuthenticated: false,
    loading: false,
    isLoading: false,
    user: {},
    users: [],
    token: "",
    error: null
}

export const userReducer = createReducer(initialState, {
    userRegisterRequest: state => {
        state.loading = true;
        state.isAuthenticated = false;
    },
    userRegisterSuccess: (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload
    },
    userRegisterFailed: (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload
    },
    userLoginRequest: state => {
        state.loading = true;
        state.isAuthenticated = false;
    },
    userLoginSuccess: (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload
    },
    userLoginFailed: (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload
        state.user = {}
    },
    userLoadRequest: state => {
        state.loading = true;
        state.isAuthenticated = false;
    },
    userLoadSuccess: (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload
        state.token = action.payload.token
    },
    userLoadFailed: (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
    },
    userLogoutRequest: state => {
        state.loading = true;
    },
    userLogoutSuccess: state => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = {}
    },
    userLogoutFailed: (state, action) => {
        state.loading = false;
    },
    getUsersRequest: state => {
        state.isloading = true;
    },
    getUsersSuccess: (state, action) => {
        state.isloading = false;
        state.users = action.payload
    },
    getUsersFailed: (state, action) => {
        state.isloading = false;
        state.error = action.payload
    },
    clearError: state => {
        state.error = null
        state.isAuthenticated = false
    }   
})