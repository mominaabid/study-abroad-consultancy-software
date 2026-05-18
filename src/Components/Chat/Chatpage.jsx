import { useState, useEffect ,useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import {
  setConversations,
  setActiveConversation,
  selectConversations,
  selectTotalUnread,
} from '../../redux/slices/chatSlice';
import { connectAbly, subscribeToChannel, unsubscribeFromChannel } from '../../services/ablyService';
import ConversationList from '../../Components/Chat/ConversationList';
import ChatWindow from '../../Components/Chat/ChatWindow';
import { BASE_URL } from '../../Content/Url';

export default function ChatPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const conversations = useSelector(selectConversations);
  const totalUnread = useSelector(selectTotalUnread(user?.role));

  const [activeConversation, setActive] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const ablyReadyRef = useRef(false); 
const activeConversationRef = useRef(null);
async function fetchConversations() {
  console.log('📋 Fetching conversations...');
  try {
    const res = await fetch(`${BASE_URL}/chat/conversations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    console.log('📋 Response status:', res.status);
    const data = await res.json();
    console.log('📋 Data received:', data);
    dispatch(setConversations(Array.isArray(data) ? data : []));
  } catch (err) {
    console.error('📋 fetchConversations error:', err);
  } finally {
    console.log('📋 Setting loading false');
    setLoadingConvs(false);
  }
}

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    let unsubscribe = null;

    connectAbly(token)
      .then(() => {
        ablyReadyRef.current = true;

        unsubscribe = subscribeToChannel(
          `user:${user.id}`,
          'new_message_notification',
          (data) => {
            console.log('🔔 Notification:', data);
            fetchConversations();
          }
        );
      })
      .catch(err => {
        console.error('Ably connection error:', err);
      });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      unsubscribeFromChannel(`user:${user.id}`);
    };
  }, [user?.id]);

function handleSelectConversation(conv) {
  setActive(conv);
  activeConversationRef.current = conv;
  dispatch(setActiveConversation(conv._id));
}

  return (
    <div className="flex h-full bg-white overflow-hidden">
      <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800 text-base">Messages</h2>
            {totalUnread > 0 && (
              <p className="text-xs text-teal-600 font-medium">{totalUnread} unread</p>
            )}
          </div>
        </div>

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

      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow conversation={activeConversation} />
      </div>
    </div>
  );
}