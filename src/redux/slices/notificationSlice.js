import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [], 
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift({
        id: Date.now(),
        message: action.payload.message,
        time: new Date().toLocaleTimeString(),
        isRead: false,
      });
      state.unreadCount += 1;
    },
    markAllAsRead: (state) => {
      state.items.forEach((item) => (item.isRead = true));
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllAsRead, clearNotifications } = notificationSlice.actions;
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export default notificationSlice.reducer;