import { configureStore } from '@reduxjs/toolkit';

const Store = configureStore({
    reducer:{
        user: userReducer,
        post: postReducer,
        notification: notificationReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immuatbleCheck: false,
        serializableCheck: false,
    })
})

export default Store