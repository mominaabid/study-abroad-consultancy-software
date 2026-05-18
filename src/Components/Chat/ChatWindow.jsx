import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";
import {
  addMessage,
  setMessages,
  markConversationRead,
  removeMessage,
  replaceMessage,
} from "../../redux/slices/chatSlice";
import { BASE_URL } from "../../Content/Url";
import { subscribeToChannel } from "../../services/ablyService";

function timeStr(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDay(date) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatWindow({ conversation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const messages = useSelector((s) => s.chat.messages[conversation?._id] || []);
  const onlineUsers = useSelector((s) => s.chat.onlineUsers);

  const [input, setInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const convId = conversation?._id;

  const otherId =
    user?.role === "student"
      ? conversation?.counsellor_id
      : conversation?.student_id;
  const otherName =
    user?.role === "student"
      ? conversation?.counsellor_name
      : conversation?.student_name;
  const isOtherOnline = onlineUsers.includes(otherId);

  useEffect(() => {
    if (!convId) return;

    setLoadingMessages(true);

    fetch(`${BASE_URL}/chat/messages/${convId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        dispatch(
          setMessages({
            conversationId: convId,
            messages: Array.isArray(data) ? data : [],
          }),
        );

        dispatch(
          markConversationRead({ conversationId: convId, role: user?.role }),
        );

        fetch(`${BASE_URL}/chat/messages/read/${convId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).catch(() => {});
      })
      .catch((err) => console.error("Failed to load messages:", err))
      .finally(() => setLoadingMessages(false));
  }, [convId]);

  useEffect(() => {
    if (!convId) return;

    let unsubscribe = () => {};
    let cancelled = false;

    subscribeToChannel(`conversation:${convId}`, "new_message", (payload) => {
      const message = payload?.message ?? payload;

      if (Number(message.sender_id) === Number(user.id)) return;

      dispatch(addMessage(message));

      dispatch(
        markConversationRead({ conversationId: convId, role: user?.role }),
      );
      fetch(`${BASE_URL}/chat/messages/read/${convId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).catch(() => {});
    }).then((unsub) => {
      if (cancelled) unsub();
      else unsubscribe = unsub;
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !convId || sending) return;

    const content = input.trim();
    const tempId = `temp_${Date.now()}`;
    setInput("");
    setSending(true);

    dispatch(
      addMessage({
        _id: tempId,
        conversation_id: convId,
        sender_id: user.id,
        sender_role: user.role,
        content,
        createdAt: new Date().toISOString(),
      }),
    );

    try {
      const res = await fetch(`${BASE_URL}/chat/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ conversationId: convId, content }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const realMsg = await res.json();

      dispatch(replaceMessage({ tempId, message: realMsg }));
    } catch (err) {
      console.error("Send failed:", err);
      dispatch(removeMessage({ tempId, conversationId: convId }));
    } finally {
      setSending(false);
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value);
    clearTimeout(typingTimer.current);
    fetch(`${BASE_URL}/chat/typing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ conversationId: convId, isTyping: true }),
    }).catch(() => {});
    typingTimer.current = setTimeout(() => {
      fetch(`${BASE_URL}/chat/typing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ conversationId: convId, isTyping: false }),
      }).catch(() => {});
    }, 1500);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const grouped = messages.reduce((acc, msg) => {
    const day = formatDay(msg.createdAt);
    acc[day] = acc[day] || [];
    acc[day].push(msg);
    return acc;
  }, {});

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-5 py-4 border-b bg-white">
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
          {otherName?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm">{otherName}</p>
          <p
            className={`text-xs ${isOtherOnline ? "text-green-500" : "text-gray-400"}`}
          >
            {isOtherOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
        {loadingMessages ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center py-8 text-gray-400 text-sm">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          Object.entries(grouped).map(([day, msgs]) => (
            <div key={day}>
              <div className="text-center text-xs text-gray-400 my-3">
                {day}
              </div>
              {msgs.map((msg) => {
                const isMine = Number(msg.sender_id) === Number(user.id);
                const isTemp = msg._id?.toString().startsWith("temp_");
                return (
                  <div
                    key={msg._id}
                    className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl text-sm max-w-[70%] ${
                        isMine ? "bg-teal-600 text-white" : "bg-white border"
                      } ${isTemp ? "opacity-60" : ""}`}
                    >
                      {msg.content}
                      <div className="text-[10px] mt-1 opacity-60 flex items-center gap-1">
                        {timeStr(msg.createdAt)}
                        {isMine && isTemp && <span>⏳</span>}
                        {isMine && !isTemp && <span>✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 flex gap-2 bg-white">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg transition-colors"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
