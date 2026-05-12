import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations:        [],
    activeConversationId: null,
    messages:             {},     // { conversationId: [messages] }
    typingUsers:          {},     // { conversationId: { userId, userName } }
    onlineUsers:          [],     // still kept (can be set via Ably presence later)
    totalUnread:          0,
  },
  reducers: {
setConversations(state, action) {
  state.conversations = action.payload;

  state.totalUnread = action.payload.reduce((sum, c) => {
    return sum + (c.counsellor_unread || 0);
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
    msg.conversation_id ||
    msg.conversationId ||
    msg.conversation;

  if (!convId) return;

  state.messages[convId] = state.messages[convId] || [];

  const exists = state.messages[convId].find(m => m._id === msg._id);
  if (!exists) state.messages[convId].push(msg);
},

    setTyping(state, action) {
      const { conversationId, userId, userName, role } = action.payload;
      state.typingUsers[conversationId] = { userId, userName, role };
    },

    clearTyping(state, action) {
      const { conversationId } = action.payload;
      delete state.typingUsers[conversationId];
    },

    // ✅ Keep this (you can use it with Ably presence later)
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },

  markConversationRead(state, action) {
  const { conversationId, role } = action.payload;

  const conv = state.conversations.find(
    c => c._id === conversationId
  );

  if (conv) {
 if (role?.toLowerCase() === 'student') {
  conv.student_unread = 0;
}

if (
  role?.toLowerCase() === 'counsellor' ||
  role?.toLowerCase() === 'counselor'
) {
  conv.counsellor_unread = 0;
}
  }

state.totalUnread = state.conversations.reduce((sum, c) => {
  return sum + (c.counsellor_unread || 0);
}, 0);
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
  markConversationRead,
} = chatSlice.actions;

export default chatSlice.reducer;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectConversations         = s => s.chat.conversations;
export const selectActiveConversationId = s => s.chat.activeConversationId;
export const selectMessages             = conversationId => s => s.chat.messages[conversationId] || [];
export const selectTypingUser           = conversationId => s => s.chat.typingUsers[conversationId];
export const selectOnlineUsers          = s => s.chat.onlineUsers;
export const selectTotalUnread          = s => s.chat.totalUnread;