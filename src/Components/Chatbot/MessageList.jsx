import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Volume2, Check, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';

export default function MessageList({ 
  messages, 
  isLoading, 
  onRegenerate,
  onExplainSimpler 
}) {
  const messagesEndRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = React.useState(null);
  const [speakingIndex, setSpeakingIndex] = React.useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSpeak = (text, idx) => {
    if ('speechSynthesis' in window) {
      if (speakingIndex === idx) {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingIndex(null);
      setSpeakingIndex(idx);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="messages-list-container">
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        const isLastBotMessage = !isUser && idx === messages.length - 1;

        return (
          <div 
            key={idx} 
            className={`message-row ${isUser ? 'user-row' : 'bot-row'} animate-fade-in`}
          >
            <div className="avatar-wrapper">
              {isUser ? (
                <div className="avatar user-avatar">
                  <User size={16} />
                </div>
              ) : (
                <div className="avatar bot-avatar">
                  <Bot size={18} />
                </div>
              )}
            </div>

            <div className="message-content-box">
              <div className="sender-meta">
                <span className="sender-name">{isUser ? 'You (Student)' : 'Educatia Bot'}</span>
                <span className="timestamp">{msg.timestamp || 'Just now'}</span>
              </div>

              <div className="markdown-content">
                {isUser ? (
                  <p className="user-text-body">{msg.content}</p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>

              {/* Bot Message Quick Toolbar */}
              {!isUser && (
                <div className="message-toolbar">
                  <button 
                    className="tool-btn" 
                    onClick={() => handleCopy(msg.content, idx)}
                    title="Copy response"
                  >
                    {copiedIndex === idx ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button 
                    className={`tool-btn ${speakingIndex === idx ? 'active' : ''}`}
                    onClick={() => handleSpeak(msg.content, idx)}
                    title="Listen to response"
                  >
                    <Volume2 size={14} />
                    <span>{speakingIndex === idx ? 'Stop' : 'Listen'}</span>
                  </button>

                  {isLastBotMessage && !isLoading && (
                    <>
                      <button 
                        className="tool-btn"
                        onClick={() => onExplainSimpler(msg.content)}
                        title="Explain in simpler terms"
                      >
                        <HelpCircle size={14} />
                        <span>Explain Simpler</span>
                      </button>

                      <button 
                        className="tool-btn"
                        onClick={onRegenerate}
                        title="Regenerate response"
                      >
                        <RefreshCw size={14} />
                        <span>Retry</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {isLoading && (
        <div className="message-row bot-row animate-fade-in">
          <div className="avatar-wrapper">
            <div className="avatar bot-avatar pulsing">
              <Bot size={18} />
            </div>
          </div>
          <div className="message-content-box loading-box">
            <div className="sender-meta">
              <span className="sender-name">Educatia Bot</span>
              <span className="thinking-tag">Thinking & reasoning...</span>
            </div>
            <div className="typing-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
