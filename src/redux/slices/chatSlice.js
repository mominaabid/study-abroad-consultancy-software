import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations:        [],
    activeConversationId: null,
    messages:             {},     // { conversationId: [messages] }
    typingUsers:          {},     // { conversationId: { userId, userName } }
    onlineUsers:          [],     // [userId, ...]
    totalUnread:          0,
  },
  reducers: {
    setConversations(state, action) {
      state.conversations = action.payload;
      state.totalUnread   = action.payload.reduce((sum, c) => {
        return sum + (c.student_unread || 0) + (c.counsellor_unread || 0);
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
      const msg            = action.payload;
      const convId         = msg.conversation_id;
      if (!state.messages[convId]) state.messages[convId] = [];
      // Avoid duplicates
      const exists = state.messages[convId].find(m => m._id === msg._id);
      if (!exists) state.messages[convId].push(msg);

      // Update conversation last message
      const conv = state.conversations.find(c => c._id === convId);
      if (conv) {
        conv.last_message    = msg.content;
        conv.last_message_at = msg.createdAt;
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
    addOnlineUser(state, action) {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser(state, action) {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
    markConversationRead(state, action) {
      const { conversationId, role } = action.payload;
      const conv = state.conversations.find(c => c._id === conversationId);
      if (conv) {
        if (role === 'student')    conv.student_unread    = 0;
        if (role === 'counsellor') conv.counsellor_unread = 0;
      }
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
  setTyping,
  clearTyping,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  markConversationRead,
} = chatSlice.actions;

export default chatSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectConversations        = s => s.chat.conversations;
export const selectActiveConversationId = s => s.chat.activeConversationId;
export const selectMessages             = conversationId => s => s.chat.messages[conversationId] || [];
export const selectTypingUser           = conversationId => s => s.chat.typingUsers[conversationId];
export const selectOnlineUsers          = s => s.chat.onlineUsers;
export const selectTotalUnread          = s => s.chat.totalUnread;