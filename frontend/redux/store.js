import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './reducers/userReducer';
import { postReducer } from './reducers/postReducer';
import { messageReducer } from './reducers/messageReducer';

const Store = configureStore({
  reducer: {
    user: userReducer,
    post: postReducer,
    message: messageReducer
    // notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    immuatbleCheck: false,
    serializableCheck: false
  })
});

export default Store;