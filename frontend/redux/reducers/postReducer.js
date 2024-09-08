import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    posts: [],
    post: {},
    error: null,
    isSuccess: false,
    isLoading: true
}

export const postReducer = createReducer(initialState, (builder) => {
    builder
    .addCase('postCreateRequest', (state) => {
        state.isLoading = true;
    })
    .addCase('postCreateSuccess', (state, action) => {
        state.isLoading = false;
        state.post = action.payload;
        state.isSuccess = true;
    })
    .addCase('postCreateFailed', (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
    })
    .addCase('getAllPostsRequest', (state) => {
        state.isLoading = true;
    })
    .addCase('getAllPostsSuccess', (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
    })
    .addCase('getAllPostsFailed', (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
    })
    .addCase('clearError', (state) => {
        state.error = null;
    })
})