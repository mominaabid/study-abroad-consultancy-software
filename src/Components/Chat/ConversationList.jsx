import { useSelector } from 'react-redux';
import { selectUser }  from '../../redux/slices/authSlice';
import { selectConversations, selectOnlineUsers } from '../../redux/slices/chatSlice';

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function ConversationList({ activeId, onSelect }) {
  const user          = useSelector(selectUser);
  const conversations = useSelector(selectConversations);
  const onlineUsers   = useSelector(selectOnlineUsers);

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
        <span className="text-4xl mb-3">💬</span>
        <p className="text-sm font-medium">No conversations yet</p>
        <p className="text-xs mt-1">
          {user?.role === 'student'
            ? 'Your counsellor will start a chat with you'
            : 'Start chatting with your assigned students'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map(conv => {
        const isActive  = conv._id === activeId;
        const otherId   = user?.role === 'student' ? conv.counsellor_id : conv.student_id;
        const otherName = user?.role === 'student' ? conv.counsellor_name : conv.student_name;
        const isOnline  = onlineUsers.includes(otherId);
        const unread    = user?.role === 'student' ? conv.student_unread : conv.counsellor_unread;

        return (
          <div
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-gray-50
              ${isActive
                ? 'bg-teal-50 border-l-2 border-l-teal-500'
                : 'hover:bg-gray-50'}`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm
                ${isActive ? 'bg-teal-200 text-teal-800' : 'bg-gray-100 text-gray-600'}`}>
                {otherName?.charAt(0)?.toUpperCase()}
              </div>
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {otherName}
                </p>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {timeAgo(conv.last_message_at)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className={`text-xs truncate ${unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {conv.last_message || 'No messages yet'}
                </p>
                {unread > 0 && (
                  <span className="flex-shrink-0 bg-teal-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}