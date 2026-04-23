import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector }                  from 'react-redux';
import { useSelector as useReduxSelector }           from 'react-redux';
import { selectUser }                                from '../../redux/slices/authSlice';
import {
  addMessage, setMessages, markConversationRead,
  setTyping, clearTyping, selectTypingUser, selectOnlineUsers,
} from '../../redux/slices/chatSlice';
import { getSocket }  from '../../services/socketService';
import { BASE_URL }   from '../../Content/Url';

function timeStr(date) {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function formatDay(date) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChatWindow({ conversation }) {
  const dispatch     = useDispatch();
  const user         = useSelector(selectUser);
  const socket       = getSocket();
  const messages     = useReduxSelector(s => s.chat.messages[conversation?._id] || []);
  const typingUser   = useReduxSelector(selectTypingUser(conversation?._id));
  const onlineUsers  = useReduxSelector(selectOnlineUsers);

  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);

  const convId = conversation?._id;

  // ── Fetch message history ──────────────────────────────────────────────────
  useEffect(() => {
    if (!convId) return;
    setLoading(true);

    fetch(`${BASE_URL}/chat/messages/${convId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data => dispatch(setMessages({ conversationId: convId, messages: Array.isArray(data) ? data : [] })))
      .finally(() => setLoading(false));

    // Join room + mark read
    socket?.emit('join_conversation', convId);
    markRead();

    return () => { socket?.emit('leave_conversation', convId); };
  }, [convId]);

  // ── Listen for new messages ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg) => {
      if (msg.conversation_id === convId) {
        dispatch(addMessage(msg));
        markRead();
      }
    };

    const onTyping = (data) => {
      if (data.userId !== user.id) {
        dispatch(setTyping({ conversationId: convId, ...data }));
      }
    };

    const onStopTyping = () => {
      dispatch(clearTyping({ conversationId: convId }));
    };

    socket.on('receive_message', onMessage);
    socket.on('user_typing',     onTyping);
    socket.on('user_stopped_typing', onStopTyping);

    return () => {
      socket.off('receive_message', onMessage);
      socket.off('user_typing',     onTyping);
      socket.off('user_stopped_typing', onStopTyping);
    };
  }, [socket, convId]);

  // ── Auto scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  function markRead() {
    fetch(`${BASE_URL}/chat/messages/read/${convId}`, {
      method:  'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).catch(() => {});
    dispatch(markConversationRead({ conversationId: convId, role: user?.role }));
  }

  // ── Send message ───────────────────────────────────────────────────────────
  function sendMessage() {
    if (!input.trim() || !socket) return;

    socket.emit('send_message', { conversationId: convId, content: input.trim() });
    setInput('');
    socket.emit('typing_stop', { conversationId: convId });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ── Typing indicator ───────────────────────────────────────────────────────
  function handleInputChange(e) {
    setInput(e.target.value);
    if (!socket) return;

    socket.emit('typing_start', { conversationId: convId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: convId });
    }, 1500);
  }

  // ── Determine other person's online status ─────────────────────────────────
  const otherId = user?.role === 'student'
    ? conversation?.counsellor_id
    : conversation?.student_id;
  const otherName = user?.role === 'student'
    ? conversation?.counsellor_name
    : conversation?.student_name;
  const isOtherOnline = onlineUsers.includes(otherId);

  // ── Group messages by day ──────────────────────────────────────────────────
  const grouped = messages.reduce((acc, msg) => {
    const day = formatDay(msg.createdAt);
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-sm font-medium">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Chat Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
            {otherName?.charAt(0)?.toUpperCase()}
          </div>
          {isOtherOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{otherName}</p>
          <p className={`text-xs ${isOtherOnline ? 'text-green-500' : 'text-gray-400'}`}>
            {isOtherOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-gray-50">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
            <span className="text-3xl">👋</span>
            <p>Say hello to start the conversation!</p>
          </div>
        )}

        {Object.entries(grouped).map(([day, dayMessages]) => (
          <div key={day}>
            {/* Day separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-2">{day}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {dayMessages.map((msg, idx) => {
              const isMine = msg.sender_id === user?.id;
              const showAvatar = !isMine && (idx === 0 || dayMessages[idx - 1]?.sender_id !== msg.sender_id);

              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Other person avatar */}
                  {!isMine && (
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                      ${showAvatar ? 'bg-teal-100 text-teal-700' : 'opacity-0'}`}>
                      {msg.sender_name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}

                  <div className={`max-w-[68%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                    {showAvatar && !isMine && (
                      <span className="text-xs text-gray-400 mb-1 ml-1">{msg.sender_name}</span>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isMine
                          ? 'bg-teal-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                        }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mx-1">
                      {timeStr(msg.createdAt)}
                      {isMine && (
                        <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUser && typingUser.userId !== user?.id && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
              {typingUser.userName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-end gap-3 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-teal-400 transition-colors">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 resize-none max-h-24 leading-relaxed py-1"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-9 h-9 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0 mb-0.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}