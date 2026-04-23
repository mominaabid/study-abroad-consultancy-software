import { useState, useEffect }    from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser }               from '../../redux/slices/authSlice';
import {
  setConversations, setActiveConversation,
  addMessage, setTyping, clearTyping,
  addOnlineUser, removeOnlineUser,
  selectConversations, selectTotalUnread,
} from '../../redux/slices/chatSlice';
import { connectSocket, getSocket } from '../../services/socketService';
import ConversationList             from '../../Components/Chat/ConversationList';
import ChatWindow                   from '../../Components/Chat/ChatWindow';
import { BASE_URL }                 from '../../Content/Url';

export default function ChatPage() {
  const dispatch      = useDispatch();
  const user          = useSelector(selectUser);
  const conversations = useSelector(selectConversations);
  const totalUnread   = useSelector(selectTotalUnread);

  const [activeConversation, setActive] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);

  // ── Connect Socket.IO ──────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = connectSocket(token);

    // Global socket listeners
    socket.on('receive_message', (msg) => {
      dispatch(addMessage(msg));
    });

    socket.on('user_online', ({ userId }) => {
      dispatch(addOnlineUser(userId));
    });

    socket.on('user_offline', ({ userId }) => {
      dispatch(removeOnlineUser(userId));
    });

    socket.on('new_message_notification', ({ conversationId, senderName, preview }) => {
      // Refresh conversations to update unread count
      fetchConversations();
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('new_message_notification');
    };
  }, []);

  // ── Fetch conversations ────────────────────────────────────────────────────
  async function fetchConversations() {
    try {
      const res  = await fetch(`${BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      dispatch(setConversations(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  }

  useEffect(() => { fetchConversations(); }, []);

  // ── Select conversation ────────────────────────────────────────────────────
  function handleSelectConversation(conv) {
    setActive(conv);
    dispatch(setActiveConversation(conv._id));
  }

  // ── Start new conversation (counsellor starts with student) ───────────────
  async function startConversation(studentId, studentName) {
    try {
      const res  = await fetch(`${BASE_URL}/chat/conversations/start`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ student_id: studentId, student_name: studentName }),
      });
      const conv = await res.json();
      await fetchConversations();
      handleSelectConversation(conv);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  }

  return (
    <div className="flex h-full bg-white overflow-hidden">

      {/* ── Sidebar — Conversation List ── */}
      <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">

        {/* Sidebar header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800 text-base">Messages</h2>
            {totalUnread > 0 && (
              <p className="text-xs text-teal-600 font-medium">{totalUnread} unread</p>
            )}
          </div>
          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 h-9 border border-gray-100">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              placeholder="Search conversations..."
              className="bg-transparent outline-none text-xs text-gray-600 placeholder-gray-400 w-full"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-hidden">
          {loadingConvs ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
          ) : (
            <ConversationList
              activeId={activeConversation?._id}
              onSelect={handleSelectConversation}
            />
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow conversation={activeConversation} />
      </div>
    </div>
  );
}