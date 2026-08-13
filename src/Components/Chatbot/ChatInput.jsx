import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, CornerDownLeft, Paperclip, StopCircle } from 'lucide-react';

const QUICK_TAGS = [
  { label: 'Solve Math', prompt: 'Solve this step by step: ' },
  { label: 'Explain Concept', prompt: 'Explain this concept simply with an example: ' },
  { label: 'Debug Code', prompt: 'Find bugs and fix this code: ' },
  { label: 'Create Quiz', prompt: 'Generate a 3-question multiple choice quiz on: ' }
];

export default function ChatInput({ 
  onSendMessage, 
  isLoading, 
  onStop 
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTagClick = (tagPrompt) => {
    setText((prev) => {
      if (prev.startsWith(tagPrompt)) return prev;
      return tagPrompt + prev;
    });
    textareaRef.current?.focus();
  };

  return (
    <div className="chat-input-wrapper">
      {/* Quick Subject Shortcut Pills */}
      <div className="quick-tags-bar">
        {QUICK_TAGS.map((tag, i) => (
          <button 
            key={i} 
            className="quick-tag-chip"
            onClick={() => handleTagClick(tag.prompt)}
          >
            <Sparkles size={12} />
            <span>{tag.label}</span>
          </button>
        ))}
      </div>

      {/* Main Input Form */}
      <form className="input-box-form glass-panel" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Educatia Bot anything (e.g. explain calculus, review my essay, generate quiz)..."
          rows={1}
          disabled={isLoading}
        />

        <div className="input-actions-right">
          <span className="input-shortcut-hint">
            <CornerDownLeft size={12} /> Enter
          </span>

          {isLoading ? (
            <button 
              type="button" 
              className="send-btn stop-btn" 
              onClick={onStop}
              title="Stop generating"
            >
              <StopCircle size={18} />
            </button>
          ) : (
            <button 
              type="submit" 
              className={`send-btn ${text.trim() ? 'active' : ''}`}
              disabled={!text.trim()}
              title="Send Message"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </form>
      <div className="input-disclaimer">
        Educatia Bot can help with homework, coding & test prep. Verify important information.
      </div>
    </div>
  );
}
