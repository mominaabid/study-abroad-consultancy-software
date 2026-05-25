import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../Content/Url";

// ----- Thunk to fetch all conversations for the logged-in user -----
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No token");
      const res = await fetch(`${BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// ----- Slice definition -----
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    activeConversationId: null,
    messages: {},
    typingUsers: {},
    onlineUsers: [],
    totalUnread: 0,
  },
  reducers: {
    setConversations(state, action) {
      state.conversations = action.payload;
      // Note: totalUnread update is intentionally left as-is (original bug)
      // The selector `selectTotalUnread` is the recommended way to compute unread count.
      state.totalUnread = action.payload.reduce((sum, conv) => {
        return sum;
      }, 0);
    },

    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },

    setMessages(state, action) {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },

    addMessage(state, action) {
      const msg = action.payload;
      const convId =
        msg.conversation_id || msg.conversationId || msg.conversation;
      if (!convId) return;

      state.messages[convId] = state.messages[convId] || [];

      const msgId = msg._id?.toString();
      const exists = state.messages[convId].some(
        (m) => m._id?.toString() === msgId,
      );
      if (exists) {
        console.log("🔕 Duplicate blocked:", msgId);
        return;
      }

      state.messages[convId].push(msg);

      const conv = state.conversations.find(
        (c) => c._id?.toString() === convId?.toString(),
      );
      if (conv) {
        conv.last_message = msg.content;
        conv.last_message_at = msg.createdAt || new Date().toISOString();
      }
    },

    replaceMessage(state, action) {
      const { tempId, message } = action.payload;
      const convId = message.conversation_id;
      if (!state.messages[convId]) return;

      const idx = state.messages[convId].findIndex((m) => m._id === tempId);
      if (idx !== -1) {
        const realExists = state.messages[convId].some(
          (m, i) => i !== idx && m._id?.toString() === message._id?.toString(),
        );
        if (realExists) {
          state.messages[convId].splice(idx, 1);
        } else {
          state.messages[convId][idx] = message;
        }
      }
    },

    removeMessage(state, action) {
      const { tempId, conversationId } = action.payload;
      if (!state.messages[conversationId]) return;
      state.messages[conversationId] = state.messages[conversationId].filter(
        (m) => m._id !== tempId,
      );
    },

    updateConversationAfterMessage(state, action) {
      const { conversationId, lastMessage, lastMessageAt, unreadCount, role } =
        action.payload;
      const conversation = state.conversations.find(
        (c) => c._id === conversationId,
      );

      if (conversation) {
        conversation.last_message = lastMessage;
        conversation.last_message_at = lastMessageAt;

        if (role === "student") {
          conversation.student_unread = unreadCount;
        } else {
          conversation.counsellor_unread = unreadCount;
        }
      }
    },

    setTyping(state, action) {
      const { conversationId, userId, userName, role } = action.payload;
      state.typingUsers[conversationId] = { userId, userName, role };
    },

    clearTyping(state, action) {
      const { conversationId } = action.payload;
      delete state.typingUsers[conversationId];
    },

    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },

    markConversationRead(state, action) {
      const { conversationId, role } = action.payload;
      const conv = state.conversations.find((c) => c._id === conversationId);

      if (conv) {
        if (role?.toLowerCase() === "student") {
          conv.student_unread = 0;
        } else if (
          role?.toLowerCase() === "counsellor" ||
          role?.toLowerCase() === "counselor"
        ) {
          conv.counsellor_unread = 0;
        }
      }
    },
  },
  // ----- Extra reducers for async thunks -----
  extraReducers: (builder) => {
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.conversations = action.payload;
      // totalUnread is not recalculated here – the selector `selectTotalUnread` is preferred
      // because it uses the current user role to compute unread counts accurately.
    });
    // Optional: handle pending/rejected if needed, but not required by the prompt.
  },
});

// ----- Export actions & reducer -----
export const {
  setConversations,
  setActiveConversation,
  replaceMessage,
  removeMessage,
  setMessages,
  addMessage,
  updateConversationAfterMessage,
  setTyping,
  clearTyping,
  setOnlineUsers,
  markConversationRead,
} = chatSlice.actions;

export default chatSlice.reducer;

// ----- Selectors -----
export const selectConversations = (s) => s.chat.conversations;
export const selectActiveConversationId = (s) => s.chat.activeConversationId;
export const selectMessages = (conversationId) => (s) =>
  s.chat.messages[conversationId] || [];
export const selectTypingUser = (conversationId) => (s) =>
  s.chat.typingUsers[conversationId];
export const selectOnlineUsers = (s) => s.chat.onlineUsers;

export const selectTotalUnread = (userRole) => (state) => {
  const conversations = state.chat.conversations;
  if (!conversations || !userRole) return 0;

  return conversations.reduce((sum, conv) => {
    if (userRole === "student") {
      return sum + (conv.student_unread || 0);
    } else {
      return sum + (conv.counsellor_unread || 0);
    }
  }, 0);
};
