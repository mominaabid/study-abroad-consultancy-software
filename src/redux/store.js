import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";
import chatReducer from "./slices/chatSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    chat: chatReducer
  },
});

export default store;
