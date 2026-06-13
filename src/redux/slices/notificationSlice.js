import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Content/Url";

// Helper to safely format a date from DB or fallback to "Just now"
const safeFormatDate = (dateValue) => {
  if (!dateValue) return "Just now";
  const dateObj = new Date(dateValue);
  if (isNaN(dateObj.getTime())) return "Invalid date";
  return dateObj.toLocaleString(); // e.g., "5/26/2025, 10:30:00 AM"
};

// Helper to get time string (hour:minute) or fallback
const safeFormatTime = (dateValue) => {
  if (!dateValue) return "Just now";
  const dateObj = new Date(dateValue);
  if (isNaN(dateObj.getTime())) return "Invalid time";
  return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// NEW: Format timestamp as per requirement
const formatDisplayTimestamp = (dateValue) => {
  if (!dateValue) return "Just Now";

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Recent notifications
  if (diffMinutes < 5) {
    return `Just Now • ${timeStr}`;
  }

  // Older notifications
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("default", {
    month: "short",
  });
  const year = date.getFullYear();

  return `${day} ${month} ${year}, ${timeStr}`;
};

// Helper to format a DB notification into the UI shape
const formatNotification = (notif) => {
  const createdDate =
    notif.createdAt || notif.created_at || notif.updatedAt || notif.updated_at;

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
  } else if (type === "payment_awaiting_verification") {
    icon = "💰";
    bgColor = "bg-yellow-50";
    textColor = "text-yellow-700";
  } else if (type === "payment_verified") {
    icon = "✅";
    bgColor = "bg-green-50";
    textColor = "text-green-700";
  } else if (type === "payment_rejected") {
    icon = "❌";
    bgColor = "bg-red-50";
    textColor = "text-red-700";
  } else if (type === "payment_added_by_admin") {
    icon = "✅";
    bgColor = "bg-green-50";
    textColor = "text-green-700";
  } else if (type === "consultancy_fee_added") {
    icon = "💰";
    bgColor = "bg-amber-50";
    textColor = "text-amber-700";
  } else if (type === "payment_credited") {
    icon = "✅";
    bgColor = "bg-green-50";
    textColor = "text-green-700";
  } else if (type === "payment_received") {
    icon = "💸";
    bgColor = "bg-blue-50";
    textColor = "text-blue-700";
  }

  return {
    id: notif.id,
    message: notif.message,
    type: notif.type,
    icon,
    bgColor,
    textColor,
    metadata: notif.metadata,
    formattedDate: safeFormatDate(createdDate),
    time: safeFormatTime(createdDate),
    displayTimestamp: formatDisplayTimestamp(createdDate),
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
      const res = await fetch(`${BASE_URL}/notifications?is_read=true`, {
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

// NEW: Thunk to fetch ALL notifications (read + unread)
export const fetchAllNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token");
    try {
      // Force include read + unread
      const res = await fetch(`${BASE_URL}/notifications?all=true`, {
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

// NEW: Thunk to delete ALL notifications for the user
export const deleteAllNotifications = createAsyncThunk(
  "notifications/deleteAll",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/notifications`, {
        method: "DELETE",
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

      if (type === "chat_message") {
        icon = "💬";
        bgColor = "bg-indigo-50";
        textColor = "text-indigo-700";
      }

      const now = new Date();

      state.items.unshift({
        id: Date.now(),
        message,
        type,
        icon,
        bgColor,
        textColor,
        metadata: metadata || {},
        createdAt: now.toISOString(),
        formattedDate: safeFormatDate(now),
        time: safeFormatTime(now),
        displayTimestamp: formatDisplayTimestamp(now),
        isRead: false,
      });
      state.unreadCount += 1;

      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
      }
    },

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
        state.items = action.payload.map(formatNotification);
        state.unreadCount = state.items.filter((item) => !item.isRead).length;
      })
      // NEW: Case for fetchAllNotifications
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.items = action.payload.map(formatNotification);
        state.unreadCount = state.items.filter((item) => !item.isRead).length;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((item) => (item.isRead = true));
        state.unreadCount = 0;
      })
      // NEW: Case for deleteAllNotifications
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.items = [];
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
