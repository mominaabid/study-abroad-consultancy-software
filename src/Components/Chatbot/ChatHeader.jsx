import React from 'react';
import { Menu, Sparkles, Cpu, Settings, Trash2 } from 'lucide-react';
import { TUTOR_MODES } from '../../services/geminiService';

export default function ChatHeader({
  activeMode,
  selectedModel,
  onSelectModel,
  onClearMessages,
  onToggleSidebar,
  onOpenSettings
}) {
  const currentModeInfo = TUTOR_MODES[activeMode] || TUTOR_MODES.general;

  return (
    <header className="chat-header glass-panel">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar} title="Toggle Sidebar">
          <Menu size={20} />
        </button>

        <div className="active-mode-tag" style={{ borderLeftColor: currentModeInfo.color }}>
          <Sparkles size={16} color={currentModeInfo.color} />
          <div>
            <h2 className="header-mode-name">{currentModeInfo.name}</h2>
            <p className="header-mode-sub">Educatia AI Mode</p>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Model Selector Pill */}
        <div className="model-selector-wrapper">
          <Cpu size={15} className="model-icon" />
          <select 
            className="model-select" 
            value={selectedModel} 
            onChange={(e) => onSelectModel(e.target.value)}
          >
            <option value="gemini-flash-latest">Gemini Flash (1,500 Requests/Day)</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
          </select>
        </div>

        {/* Clear Chat Button */}
        <button className="header-action-btn" onClick={onClearMessages} title="Clear Current Conversation">
          <Trash2 size={16} />
          <span className="btn-label">Clear</span>
        </button>

        {/* Settings Button */}
        <button className="header-action-btn primary" onClick={onOpenSettings} title="Settings">
          <Settings size={16} />
          <span className="btn-label">API Key</span>
        </button>
      </div>
    </header>
  );
}
