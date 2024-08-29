import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './reducers/userReducer';

const Store = configureStore({
    reducer:{
        user: userReducer,
        // post: postReducer,
        // notification: notificationReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immuatbleCheck: false,
        serializableCheck: false,
    })
})

export default Store