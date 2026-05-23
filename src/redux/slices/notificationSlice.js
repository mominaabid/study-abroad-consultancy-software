import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Content/Url";

// Helper to format a DB notification into the UI shape (consistent with addNotification)
const formatNotification = (notif) => {
  let icon = "📢";
  let bgColor = "bg-blue-50";
  let textColor = "text-blue-700";
  const type = notif.type;
  const metadata = notif.metadata || {};

  if (type === "status_change") {
    if (metadata.newStatus === "approved") {
      icon = "✅";
      bgColor = "bg-emerald-50";
      textColor = "text-emerald-700";
    } else if (metadata.newStatus === "reject") {
      icon = "❌";
      bgColor = "bg-rose-50";
      textColor = "text-rose-700";
    } else if (metadata.newStatus === "offer letter received") {
      icon = "📜";
      bgColor = "bg-green-50";
      textColor = "text-green-700";
    } else {
      icon = "🔄";
      bgColor = "bg-amber-50";
      textColor = "text-amber-700";
    }
  } else if (type === "chat_message") {
    icon = "💬";
    bgColor = "bg-indigo-50";
    textColor = "text-indigo-700";
  } else if (type === "lead_assigned") {
    icon = "🔔";
    bgColor = "bg-purple-50";
    textColor = "text-purple-700";
  } else if (type === "lead_created") {
    icon = "📝";
    bgColor = "bg-amber-50";
    textColor = "text-amber-700";
  }

  return {
    id: notif.id,
    message: notif.message,
    type: notif.type,
    icon,
    bgColor,
    textColor,
    metadata: notif.metadata,
    time: new Date(notif.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isRead: Boolean(notif.is_read),
  };
};

// Thunk: fetch unread notifications from DB
export const fetchUnreadNotifications = createAsyncThunk(
  "notifications/fetchUnread",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token");
    try {
      const res = await fetch(`${BASE_URL}/notifications?unread=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.notifications;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Thunk: mark all notifications as read (sync with DB)
export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/notifications/mark-all-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      const { message, type, metadata } = action.payload;

      let icon = "📢";
      let bgColor = "bg-blue-50";
      let textColor = "text-blue-700";

      // Status change notifications
      if (type === "status_change") {
        if (metadata?.newStatus === "approved") {
          icon = "✅";
          bgColor = "bg-emerald-50";
          textColor = "text-emerald-700";
        } else if (metadata?.newStatus === "reject") {
          icon = "❌";
          bgColor = "bg-rose-50";
          textColor = "text-rose-700";
        } else if (metadata?.newStatus === "offer letter received") {
          icon = "📜";
          bgColor = "bg-green-50";
          textColor = "text-green-700";
        } else {
          icon = "🔄";
          bgColor = "bg-amber-50";
          textColor = "text-amber-700";
        }
      }

      // Chat message notifications
      if (type === "chat_message") {
        icon = "💬";
        bgColor = "bg-indigo-50";
        textColor = "text-indigo-700";
      }

      state.items.unshift({
        id: Date.now(),
        message: message,
        type: type || "info",
        icon: icon,
        bgColor: bgColor,
        textColor: textColor,
        metadata: metadata || {},
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: false,
      });
      state.unreadCount += 1;

      // Limit to last 50 notifications
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
      }
    },

    // New: replace entire notifications list (e.g., after login or polling)
    setNotifications: (state, action) => {
      state.items = action.payload.map(formatNotification);
      state.unreadCount = state.items.filter((item) => !item.isRead).length;
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
      const notification = state.items.find(
        (item) => item.id === notificationId,
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        // Replace local state with fetched unread notifications
        state.items = action.payload.map(formatNotification);
        state.unreadCount = state.items.filter((item) => !item.isRead).length;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        // After successful server sync, also mark locally as read
        state.items.forEach((item) => (item.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export const {
  addNotification,
  setNotifications,
  markAllAsRead,
  clearNotifications,
  markAsRead,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;

export default notificationSlice.reducer;
