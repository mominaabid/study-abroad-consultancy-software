import React from "react";
import AdminPanel from "../../Components/Chatbot/AdminPanel";
import "../../Components/Chatbot/Chatbot.css";

export function ChatbotPanel() {
  return (
    <div className="w-full min-h-full bg-slate-50 flex flex-col">
      <AdminPanel onLockAdmin={() => console.log("Lock Chatbot Admin")} />
    </div>
  );
}

export default ChatbotPanel;
