import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSelector as useReduxSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import {
  addMessage, setMessages, markConversationRead,
  setTyping, clearTyping, selectTypingUser, selectOnlineUsers,
} from '../../redux/slices/chatSlice';
import { getSocket } from '../../services/socketService';
import { BASE_URL } from '../../Content/Url';
import CallModal from './CallModal'; // 🔥 ADDED

function timeStr(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function formatDay(date) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChatWindow({ conversation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const socket = getSocket();

  const messages = useReduxSelector(
    s => s.chat.messages[conversation?._id] || []
  );

  const typingUser = useReduxSelector(
    selectTypingUser(conversation?._id)
  );

  const onlineUsers = useReduxSelector(selectOnlineUsers);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const convId = conversation?._id;

  // ── CALL STATE ─────────────────────────────────────────
  const [showCall, setShowCall] = useState(false);

  // ── Get other user ─────────────────────────────────────
  const otherId =
    user?.role === 'student'
      ? conversation?.counsellor_id
      : conversation?.student_id;

  const otherName =
    user?.role === 'student'
      ? conversation?.counsellor_name
      : conversation?.student_name;

  const isOtherOnline = onlineUsers.includes(otherId);

  // ── Fetch messages ──────────────────────────────────────
  useEffect(() => {
    if (!convId) return;
    setLoading(true);

    fetch(`${BASE_URL}/chat/messages/${convId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data =>
        dispatch(
          setMessages({
            conversationId: convId,
            messages: Array.isArray(data) ? data : [],
          })
        )
      )
      .finally(() => setLoading(false));

    socket?.emit('join_conversation', convId);
    markRead();

    return () => {
      socket?.emit('leave_conversation', convId);
    };
  }, [convId]);

  function markRead() {
    fetch(`${BASE_URL}/chat/messages/read/${convId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).catch(() => {});
  }

  // ── SEND MESSAGE ───────────────────────────────────────
  function sendMessage() {
    if (!input.trim() || !socket) return;

    socket.emit('send_message', {
      conversationId: convId,
      content: input.trim(),
    });

    setInput('');
    socket.emit('typing_stop', { conversationId: convId });
  }

  function handleInputChange(e) {
    setInput(e.target.value);

    socket.emit('typing_start', { conversationId: convId });

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: convId });
    }, 1500);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ── GROUP MESSAGES ─────────────────────────────────────
  const grouped = messages.reduce((acc, msg) => {
    const day = formatDay(msg.createdAt);
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        Select a conversation
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-white">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold">
            {otherName?.charAt(0)}
          </div>

          <div>
            <p className="font-semibold text-sm">{otherName}</p>
            <p className={`text-xs ${isOtherOnline ? 'text-green-500' : 'text-gray-400'}`}>
              {isOtherOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* 🔥 CALL BUTTON INSIDE HEADER */}
        <CallModal
          conversation={conversation}
          targetUserId={otherId}
          targetName={otherName}
          isOnline={isOtherOnline}
        />
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
        {Object.entries(grouped).map(([day, msgs]) => (
          <div key={day}>
            <div className="text-center text-xs text-gray-400 my-3">
              {day}
            </div>

            {msgs.map(msg => {
              const isMine = msg.sender_id === user.id;

              return (
                <div
                  key={msg._id}
                  className={`flex mb-2 ${
                    isMine ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl text-sm max-w-[70%] ${
                      isMine
                        ? 'bg-teal-600 text-white'
                        : 'bg-white border'
                    }`}
                  >
                    {msg.content}
                    <div className="text-[10px] mt-1 opacity-60">
                      {timeStr(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="border-t p-3 flex gap-2">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 border rounded-lg p-2 text-sm"
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-teal-600 text-white px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}