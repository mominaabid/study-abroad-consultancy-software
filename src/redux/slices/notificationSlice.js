// import { createSlice } from "@reduxjs/toolkit";

// const notificationSlice = createSlice({
//   name: "notifications",
//   initialState: {
//     items: [], 
//     unreadCount: 0,
//   },
//   reducers: {
//     addNotification: (state, action) => {
//       state.items.unshift({
//         id: Date.now(),
//         message: action.payload.message,
//         time: new Date().toLocaleTimeString(),
//         isRead: false,
//       });
//       state.unreadCount += 1;
//     },
//     markAllAsRead: (state) => {
//       state.items.forEach((item) => (item.isRead = true));
//       state.unreadCount = 0;
//     },
//     clearNotifications: (state) => {
//       state.items = [];
//       state.unreadCount = 0;
//     },
//   },
// });

// export const { addNotification, markAllAsRead, clearNotifications } = notificationSlice.actions;
// export const selectNotifications = (state) => state.notifications.items;
// export const selectUnreadCount = (state) => state.notifications.unreadCount;
// export default notificationSlice.reducer;


// notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [], 
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      const { message, type, metadata } = action.payload;
      
      // Determine icon/color based on notification type
      let icon = '📢';
      let bgColor = 'bg-blue-50';
      let textColor = 'text-blue-700';
      
      if (type === 'status_change') {
        if (metadata?.newStatus === 'approved') {
          icon = '✅';
          bgColor = 'bg-emerald-50';
          textColor = 'text-emerald-700';
        } else if (metadata?.newStatus === 'reject') {
          icon = '❌';
          bgColor = 'bg-rose-50';
          textColor = 'text-rose-700';
        } else if (metadata?.newStatus === 'offer letter received') {
          icon = '📜';
          bgColor = 'bg-green-50';
          textColor = 'text-green-700';
        } else {
          icon = '🔄';
          bgColor = 'bg-amber-50';
          textColor = 'text-amber-700';
        }
      }
      
      state.items.unshift({
        id: Date.now(),
        message: message,
        type: type || 'info',
        icon: icon,
        bgColor: bgColor,
        textColor: textColor,
        metadata: metadata || {},
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      });
      state.unreadCount += 1;
      
      // Limit to last 50 notifications
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((item) => (item.isRead = true));
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.items.find(item => item.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
});

export const { addNotification, markAllAsRead, clearNotifications, markAsRead } = notificationSlice.actions;
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export default notificationSlice.reducer;