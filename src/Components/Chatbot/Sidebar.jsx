import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  Database, 
  Sparkles, 
  Calculator, 
  Code2, 
  BrainCircuit, 
  GraduationCap, 
  BookOpen, 
  Zap 
} from 'lucide-react';
import { TUTOR_MODES } from '../../services/geminiService';

const MODE_ICONS = {
  Sparkles,
  Calculator,
  Code2,
  BrainCircuit,
  GraduationCap
};

export default function Sidebar({ 
  chats, 
  activeChatId, 
  onSelectChat, 
  onNewChat, 
  onDeleteChat, 
  activeMode, 
  onSelectMode, 
  onOpenSettings,
  isOpen,
  onClose
}) {
  return (
    <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo">
          <div className="logo-icon-glow">
            <BookOpen className="logo-icon" />
          </div>
          <div>
            <h1 className="brand-title">Educatia <span className="highlight">Bot</span></h1>
            <span className="brand-subtitle">AI Learning Companion</span>
          </div>
        </div>
        <button className="new-chat-btn" onClick={onNewChat} title="Start new conversation">
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Tutor Mode Selector */}
      <div className="section-container">
        <div className="section-title">
          <span>Tutor Modes</span>
          <span className="mode-badge">{Object.keys(TUTOR_MODES).length} Modes</span>
        </div>
        <div className="mode-list">
          {Object.values(TUTOR_MODES).map((mode) => {
            const IconComponent = MODE_ICONS[mode.icon] || Sparkles;
            const isSelected = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                className={`mode-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectMode(mode.id)}
                style={{ '--accent-color': mode.color }}
              >
                <div className="mode-icon-wrapper">
                  <IconComponent size={16} color={isSelected ? mode.color : '#9ca3af'} />
                </div>
                <div className="mode-info">
                  <span className="mode-name">{mode.name}</span>
                  <span className="mode-desc">{mode.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat History List */}
      <div className="section-container history-section">
        <div className="section-title">Recent Chats</div>
        <div className="chat-history-list">
          {chats.length === 0 ? (
            <div className="empty-history">
              <MessageSquare size={24} className="muted-icon" />
              <p>No recent chats yet</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-history-item ${activeChatId === chat.id ? 'active' : ''}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <MessageSquare size={15} className="history-icon" />
                <span className="history-title">{chat.title || 'Untitled Conversation'}</span>
                <button
                  className="delete-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Info & Supabase Status */}
      <div className="sidebar-footer">
        <div className="supabase-status-badge" title="Ready for Supabase Client Integration">
          <Database size={14} className="supabase-icon" />
          <span>Supabase Ready</span>
          <span className="status-dot"></span>
        </div>

        <button className="settings-trigger-btn" onClick={onOpenSettings}>
          <Settings size={18} />
          <span>Settings & Keys</span>
        </button>
      </div>
    </aside>
  );
}
