import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { setMessages } from '../../redux/slices/chatSlice';
import { BASE_URL } from '../../Content/Url';
import {
  Search, MessageSquare, Users, Activity, ChevronRight, 
  ChevronLeft, Send, MoreVertical, Phone, Video, 
  Info, Star, Archive, Trash2, CheckCheck, Clock,
  User, UserCheck, Sparkles, Filter, PlusCircle,
  MessageCircle, Inbox, ArrowLeft, Circle, Bot
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function timeStr(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
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

function getToken() { return localStorage.getItem('token') || ''; }

function avatarInitial(name = '') {
  return name.charAt(0).toUpperCase();
}

function avatarColor(name = '') {
  const colors = [
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-violet-500 to-violet-600',
    'bg-gradient-to-br from-amber-500 to-amber-600',
    'bg-gradient-to-br from-rose-500 to-rose-600',
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-pink-500 to-pink-600'
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

// ── Conversation List Component ──────────────────────────────────────────────
function ConversationList({ conversations, activeId, onSelect, search, setSearch }) {
  const filtered = conversations.filter(conv => {
    const q = search.toLowerCase();
    return (
      conv.student_name?.toLowerCase().includes(q) ||
      conv.counsellor_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-gray-800 text-lg">Conversations</h2>
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
            {conversations.length} total
          </span>
        </div>
        <p className="text-xs text-gray-400">Monitor all student-counsellor chats</p>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <MessageCircle size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No conversations found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
          </div>
        ) : (
          filtered.map(conv => {
            const isActive = conv._id === activeId;
            const hasUnread = false; // You can implement unread logic here
            
            return (
              <div
                key={conv._id}
                onClick={() => onSelect(conv)}
                className={`px-4 py-4 cursor-pointer transition-all duration-200 border-b border-gray-50 relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-teal-50 to-white border-l-4 border-l-teal-500' 
                    : 'hover:bg-gray-50'
                  }`}
              >
                {/* Header with avatars and time */}
                <div className="flex items-center gap-2 mb-2">
                  {/* Student avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm ${avatarColor(conv.student_name)}`}>
                    {avatarInitial(conv.student_name)}
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-0.5">
                    <div className="w-4 h-px bg-gray-300" />
                    <ChevronRight size={10} className="text-gray-300" />
                    <div className="w-4 h-px bg-gray-300" />
                  </div>

                  {/* Counsellor avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm ${avatarColor(conv.counsellor_name)}`}>
                    {avatarInitial(conv.counsellor_name)}
                  </div>

                  {/* Time */}
                  <span className="ml-auto text-[10px] text-gray-400 flex-shrink-0">
                    {timeAgo(conv.last_message_at)}
                  </span>
                </div>

                {/* Names */}
                <div className="flex items-center gap-1 mb-1.5">
                  <span className={`text-sm font-semibold ${isActive ? 'text-teal-700' : 'text-gray-800'}`}>
                    {conv.student_name || 'Student'}
                  </span>
                  <span className="text-xs text-gray-400">↔</span>
                  <span className={`text-sm font-semibold ${isActive ? 'text-teal-700' : 'text-gray-800'}`}>
                    {conv.counsellor_name || 'Counsellor'}
                  </span>
                  {hasUnread && (
                    <span className="ml-2 w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Last message preview */}
                <p className="text-xs text-gray-400 truncate">
                  {conv.last_message || ' No messages yet'}
                </p>

                {/* Message count badge */}
                {conv.message_count > 0 && (
                  <div className="absolute right-4 bottom-4">
                    <span className="text-[10px] font-semibold text-gray-400">
                      {conv.message_count} msgs
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Chat Window Component ────────────────────────────────────────────────────
function ChatWindow({ conversation }) {
  const [messages, setLocalMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversation?._id) return;
    setLoading(true);
    setLocalMessages([]);

    fetch(`${BASE_URL}/chat/messages/${conversation._id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => setLocalMessages(Array.isArray(data) ? data : []))
      .catch(err => console.error('Fetch messages error:', err))
      .finally(() => setLoading(false));
  }, [conversation?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <MessageSquare size={32} className="text-teal-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">Welcome to Chat Monitor</h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Select a conversation from the left to view messages between students and counsellors
          </p>
        </div>
      </div>
    );
  }

  // Group messages by day
  const grouped = messages.reduce((acc, msg) => {
    const day = formatDay(msg.createdAt);
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Student */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md ${avatarColor(conversation.student_name)}`}>
              {avatarInitial(conversation.student_name)}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Student</p>
              <p className="text-base font-bold text-gray-800 leading-tight">
                {conversation.student_name || '—'}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center px-2">
            <div className="flex items-center gap-1 text-gray-300">
              <div className="w-6 h-px bg-gray-200" />
              <ChevronRight size={12} className="text-gray-300" />
              <div className="w-6 h-px bg-gray-200" />
            </div>
            <span className="text-[8px] text-gray-400 font-medium uppercase tracking-wider">Chat</span>
          </div>

          {/* Counsellor */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md ${avatarColor(conversation.counsellor_name)}`}>
              {avatarInitial(conversation.counsellor_name)}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Counsellor</p>
              <p className="text-base font-bold text-gray-800 leading-tight">
                {conversation.counsellor_name || '—'}
              </p>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
              <MessageSquare size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600 font-medium">{messages.length} messages</span>
            </div>
            
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-xl hover:bg-gray-100 transition"
            >
              <Info size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3 text-sm">
             
          
              <div>
                <p className="text-xs text-gray-400 mb-1">Conversation ID</p>
                <p className="text-xs font-mono text-gray-500">{conversation._id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Last Active</p>
                <p className="text-sm font-medium text-gray-700">{timeAgo(conversation.last_message_at)} ago</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-gradient-to-b from-gray-50 to-white">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <MessageCircle size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">This conversation is empty</p>
          </div>
        )}

        {Object.entries(grouped).map(([day, dayMsgs]) => (
          <div key={day}>
            {/* Day divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <span className="text-[11px] text-gray-400 font-medium px-3 py-1 bg-gray-100 rounded-full">
                {day}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>

       {dayMsgs.map((msg, idx) => {
  // ✅ Student always LEFT, counsellor always RIGHT
  const isStudent = msg.sender_role === 'student';
  const showLabel = idx === 0 || dayMsgs[idx - 1]?.sender_id !== msg.sender_id;

  return (
    <div
      key={msg._id}
      className={`flex items-end gap-2 mb-1.5 ${isStudent ? 'justify-start' : 'justify-end'}`}
    >
      {/* Student avatar — LEFT side only */}
      {isStudent && (
        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold
          ${showLabel ? avatarColor(conversation.student_name) : 'opacity-0'}`}>
          {avatarInitial(conversation.student_name)}
        </div>
      )}

      <div className={`flex flex-col max-w-[60%] ${isStudent ? 'items-start' : 'items-end'}`}>
        {/* Role label */}
        {showLabel && (
          <span className={`text-[10px] font-semibold mb-1 px-1
            ${isStudent ? 'text-teal-600' : 'text-violet-600'}`}>
            {msg.sender_name} · {isStudent ? 'Student' : 'Counsellor'}
          </span>
        )}

        {/* Bubble — white for student, purple for counsellor */}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isStudent
            ? 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
            : 'bg-violet-600 text-white rounded-br-sm'
          }`}>
          {msg.content}
        </div>

        <span className="text-[10px] text-gray-400 mt-1 mx-1">
          {timeStr(msg.createdAt)}
        </span>
      </div>

      {/* Counsellor avatar — RIGHT side only */}
      {!isStudent && (
        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold
          ${showLabel ? avatarColor(conversation.counsellor_name) : 'opacity-0'}`}>
          {avatarInitial(conversation.counsellor_name)}
        </div>
      )}
    </div>
  );
})}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Read-only Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-center gap-2 text-gray-400 py-1">
          <Eye size={14} className="text-amber-500" />
          <p className="text-xs font-medium">
            You are viewing this conversation as an administrator. This is a read-only view.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Chat Page ─────────────────────────────────────────────────────
export default function AdminChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, today: 0 });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);

  // Fetch all conversations
  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch(`${BASE_URL}/chat/admin/conversations`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        const convs = Array.isArray(data) ? data : [];
        setConversations(convs);
        
        // Calculate stats
        const today = new Date().toDateString();
        const todayConvs = convs.filter(c => {
          const lastMsgDate = c.last_message_at ? new Date(c.last_message_at).toDateString() : null;
          return lastMsgDate === today;
        });
        
        setStats({
          total: convs.length,
          active: convs.filter(c => c.last_message).length,
          today: todayConvs.length,
        });
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Top Banner */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-950 via-blue-900 to-teal-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                <MessageSquare size={16} className="text-teal-300" />
              </div>
              <h1 className="font-bold text-xl">Chat Monitor</h1>
            </div>
            <p className="text-blue-200 text-sm">View all conversations between counsellors and students</p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/20">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-[10px] text-blue-300 font-medium">Total Chats</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/20">
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-[10px] text-blue-300 font-medium">Active</p>
            </div>
         
          </div>

          {/* Mobile toggle button */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            {isMobileSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className={`
          w-80 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col
          transition-all duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative inset-y-0 left-0 z-20 lg:z-auto shadow-xl lg:shadow-none
        `}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?._id}
              onSelect={(conv) => {
                setActive(conv);
                if (window.innerWidth < 1024) setIsMobileSidebarOpen(false);
              }}
              search={search}
              setSearch={setSearch}
            />
          )}
        </div>

        {/* Overlay for mobile */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Chat View */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatWindow conversation={activeConversation} />
        </div>
      </div>
    </div>
  );
}

// Add missing Eye import if not already present
import { Eye } from 'lucide-react';

// Add animation styles (add to your global CSS or use Tailwind)
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;