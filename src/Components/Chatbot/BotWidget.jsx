import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, RotateCcw, ArrowDown, PhoneCall, Sparkles, Gift } from 'lucide-react';
import { sendWidgetMessage } from '../../services/geminiService';
import { getSupabaseClient } from '../../services/supabaseClient';
import '../App.css';

const SESSION_STORAGE_KEY = 'educatia_chat_history';
const DEALS_SHOWN_KEY = 'educatia_deals_banner_shown';

const INITIAL_MESSAGES = [
  {
    role: 'bot',
    content: "Hi there! Welcome to Educatia Support. How can I help you today?",
    timestamp: '14:35'
  }
];

function renderInlineFormatting(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} style={{ fontWeight: '700', color: '#0f172a' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function FormattedMessage({ content }) {
  if (!content) return null;

  // Normalize single asterisks lists into proper newline lists
  const normalized = content
    .replace(/([^\n])\s*\*\s+/g, '$1\n* ')
    .replace(/([^\n])\s*-\s+/g, '$1\n- ');

  const blocks = normalized.split(/\n{2,}/);

  return (
    <div className="markdown-content">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);

        const isList = lines.length > 0 && lines.every(l => l.startsWith('* ') || l.startsWith('- ') || l.startsWith('• '));

        if (isList) {
          return (
            <ul key={bIdx} style={{ margin: '0.4rem 0 0.5rem 0', paddingLeft: '1.25rem' }}>
              {lines.map((line, lIdx) => {
                const cleanItem = line.replace(/^[*•-]\s*/, '');
                return <li key={lIdx} style={{ marginBottom: '0.35rem', lineHeight: '1.5' }}>{renderInlineFormatting(cleanItem)}</li>;
              })}
            </ul>
          );
        }

        // Mixed block containing list items
        if (lines.some(l => l.startsWith('* ') || l.startsWith('- ') || l.startsWith('• '))) {
          return (
            <div key={bIdx} style={{ margin: '0.4rem 0' }}>
              {lines.map((line, lIdx) => {
                if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
                  const cleanItem = line.replace(/^[*•-]\s*/, '');
                  return (
                    <li key={lIdx} style={{ marginLeft: '1.25rem', marginBottom: '0.35rem', listStyleType: 'disc', lineHeight: '1.5' }}>
                      {renderInlineFormatting(cleanItem)}
                    </li>
                  );
                }
                return <p key={lIdx} style={{ margin: '0 0 0.4rem 0', lineHeight: '1.5' }}>{renderInlineFormatting(line)}</p>;
              })}
            </div>
          );
        }

        return (
          <p key={bIdx} style={{ margin: '0 0 0.5rem 0', lineHeight: '1.5' }}>
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function BotWidget({ onClose }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e);
    }
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [lastSendTime, setLastSendTime] = useState(0);
  const [rateLimitWarning, setRateLimitWarning] = useState('');
  const [dbStatusText, setDbStatusText] = useState('');

  // Persistent session ID for complete chat session logging
  const [sessionId, setSessionId] = useState(() => {
    try {
      let savedSid = sessionStorage.getItem('educatia_active_session_id');
      if (!savedSid) {
        savedSid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        sessionStorage.setItem('educatia_active_session_id', savedSid);
      }
      return savedSid;
    } catch (_e) {
      return `sess_${Date.now()}`;
    }
  });

  // Exclusive Deals Banner State
  const [hasDealsBannerBeenShown, setHasDealsBannerBeenShown] = useState(() => {
    try {
      return localStorage.getItem(DEALS_SHOWN_KEY) === 'true';
    } catch (_e) {
      return false;
    }
  });
  const [showDealsCard, setShowDealsCard] = useState(false);
  const [dealSubmitted, setDealSubmitted] = useState(false);
  const [dealName, setDealName] = useState('');
  const [dealPhone, setDealPhone] = useState('');
  const [isSubmittingDeal, setIsSubmittingDeal] = useState(false);

  const chatBodyRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!chatBodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollBottom(isUp);
  };

  const detectAndSaveLead = async (userText, history) => {
    const phoneMatch = userText.match(/(\+?\d{10,13}|03\d{9})/);
    const emailMatch = userText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    if (phoneMatch || emailMatch) {
      const matchedPhone = phoneMatch ? phoneMatch[0] : null;
      try {
        let countryPref = 'Unspecified';
        const lowerHist = history.map(h => h.content).join(' ').toLowerCase();
        if (lowerHist.includes('cyprus')) countryPref = 'Cyprus';
        else if (lowerHist.includes('germany')) countryPref = 'Germany';
        else if (lowerHist.includes('ireland')) countryPref = 'Ireland';

        const supabase = getSupabaseClient();

        if (matchedPhone) {
          // Check if phone already registered in database
          const { data: existingLead } = await supabase
            .from('student_leads')
            .select('lead_id, phone_number')
            .eq('phone_number', matchedPhone)
            .limit(1);

          if (existingLead && existingLead.length > 0) {
            return;
          }
        }

        await supabase.from('student_leads').insert([{
          student_name: 'Website Student',
          phone_number: matchedPhone,
          interested_country: countryPref,
          last_message_snippet: `Auto-captured via BotWidget chat: "${userText}"`,
          status: 'new'
        }]);
      } catch (err) {
        // Silently catch
      }
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const userText = input.trim();
    if (!userText || isLoading) return;

    const now = Date.now();
    if (now - lastSendTime < 2000) {
      setRateLimitWarning('Please wait a moment before sending another message.');
      return;
    }
    setLastSendTime(now);
    setRateLimitWarning('');
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      role: 'user',
      content: userText,
      timestamp: currentTimeStr
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    // Trigger Exclusive Deals Banner after 4-5 turns or when asking about admissions/applying
    const userMsgCount = newHistory.filter(m => m.role === 'user').length;
    const lowerText = userText.toLowerCase();
    const isAdmissionQuery = lowerText.includes('apply') || lowerText.includes('admission') || lowerText.includes('process') || lowerText.includes('contact') || lowerText.includes('requirement');

    if (!hasDealsBannerBeenShown && (userMsgCount >= 4 || isAdmissionQuery)) {
      setShowDealsCard(true);
      setHasDealsBannerBeenShown(true);
      try {
        localStorage.setItem(DEALS_SHOWN_KEY, 'true');
      } catch (_e) {}
    }

    detectAndSaveLead(userText, newHistory);

    try {
      setDbStatusText('Thinking...');

      const botRes = await sendWidgetMessage({
        messages: newHistory.map(m => ({ role: m.role, content: m.content })),
        sessionId
      });

      const replyContent = typeof botRes === 'object' ? (botRes.reply || botRes.text || '') : String(botRes);
      const botTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages([...newHistory, {
        role: 'bot',
        content: replyContent,
        timestamp: botTimeStr
      }]);

    } catch (err) {
      console.error(err);
      const botTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages([...newHistory, {
        role: 'bot',
        content: `Sorry, I encountered an error: ${err.message || 'Unable to connect'}. Please check your settings.`,
        timestamp: botTimeStr
      }]);
    } finally {
      setIsLoading(false);
      setDbStatusText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(DEALS_SHOWN_KEY);
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
    setMessages(INITIAL_MESSAGES);
    setHasDealsBannerBeenShown(false);
    setShowDealsCard(false);
    setDealSubmitted(false);
  };

  const handleDealSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const trimmedPhone = dealPhone.trim();
    const trimmedName = dealName.trim() || 'Website Student';

    if (!trimmedPhone && !dealName.trim()) {
      // Optional field: user can proceed without entering
      setShowDealsCard(false);
      return;
    }

    setIsSubmittingDeal(true);

    try {
      const supabase = getSupabaseClient();

      if (trimmedPhone) {
        // Backend Lead Deduplication Check
        const { data: existingLead } = await supabase
          .from('student_leads')
          .select('lead_id, phone_number')
          .eq('phone_number', trimmedPhone)
          .limit(1);

        if (existingLead && existingLead.length > 0) {
          // Phone number already registered in DB
        } else {
          // Insert new lead row into Supabase student_leads table
          await supabase.from('student_leads').insert([{
            student_name: trimmedName,
            phone_number: trimmedPhone,
            interested_country: 'Unspecified',
            last_message_snippet: 'Claimed Exclusive Study Deal via BotWidget Banner',
            status: 'new'
          }]);
        }
      }
    } catch (err) {
      console.warn('Lead submit notice:', err);
    } finally {
      setIsSubmittingDeal(false);
      setDealSubmitted(true);
      // Automatically hide deal card after 3.5s
      setTimeout(() => {
        setShowDealsCard(false);
      }, 3500);
    }
  };

  return (
    <div className="botpress-widget-card">
      {/* Header */}
      <header className="widget-header">
        <div className="widget-header-title">
          <div className="widget-avatar-logo" style={{ background: '#ffffff', padding: '4px', border: '1.5px solid #023668', overflow: 'hidden' }}>
            <img src="/educatia-logo.png" alt="Educatia Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span className="title-text">Educatia Support</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button className="widget-icon-btn" onClick={handleClearHistory} title="Restart Chat & Clear Session">
            <RotateCcw size={16} />
          </button>
          <button className="widget-icon-btn" onClick={onClose} title="Close Chat">
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Body / Messages */}
      <div className="widget-body" ref={chatBodyRef} onScroll={handleScroll}>
        {messages.map((msg, index) => (
          <div key={index} className={`widget-msg-group ${msg.role === 'user' ? 'user-group' : 'bot-group'}`}>
            {msg.role === 'bot' && (
              <div className="bot-inline-avatar" style={{ background: '#ffffff', padding: '2px', border: '1.5px solid #023668', overflow: 'hidden' }}>
                <img src="/educatia-logo.png" alt="Educatia Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <div className="msg-wrapper">
              <div className={`widget-bubble ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <FormattedMessage content={msg.content} />
                )}
              </div>
              <div className={`msg-meta-bar ${msg.role === 'user' ? 'user-meta' : 'bot-meta'}`}>
                <span className="msg-timestamp">{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="widget-msg-group bot-group">
            <div className="bot-inline-avatar" style={{ background: '#ffffff', padding: '2px', border: '1.5px solid #023668', overflow: 'hidden' }}>
              <img src="/educatia-logo.png" alt="Educatia Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="msg-wrapper">
              <div className="widget-bubble bot-bubble typing-bubble">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                {dbStatusText && <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '6px' }}>{dbStatusText}</span>}
              </div>
            </div>
          </div>
        )}

        {showScrollBottom && (
          <button 
            className="scroll-bottom-fab" 
            onClick={scrollToBottom}
            title="Jump to latest message"
          >
            <ArrowDown size={16} />
          </button>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating WhatsApp Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '16px', marginTop: '-20px', marginBottom: '6px', position: 'relative', zIndex: 20 }}>
        <a
          href="https://wa.me/923250000410?text=Hi%20Educatia!%20I%20would%20like%20information%20about%20study%20abroad%20admissions."
          target="_blank"
          rel="noopener noreferrer"
          title="Chat directly on WhatsApp (+92 325 0000410)"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: '#25D366',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.5)',
            textDecoration: 'none',
            border: '2.5px solid #ffffff',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <PhoneCall size={20} />
        </a>
      </div>

      {/* Input & Optional Exclusive Deals Banner */}
      <div className="widget-footer-container">
        {/* Exclusive Deals & Consultation Banner Card */}
        {showDealsCard && (
          <div 
            style={{
              width: '100%',
              marginBottom: '10px',
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1.5px solid #bfdbfe',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            <button
              onClick={() => setShowDealsCard(false)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Skip / Close"
            >
              <X size={14} />
            </button>

            {!dealSubmitted ? (
              <form onSubmit={handleDealSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Gift size={16} color="#2563eb" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e3a8a' }}>
                    Claim Exclusive Fee Discounts & Deals!
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: '1.3' }}>
                  Enter your details to unlock partner university deals. <span style={{ color: '#64748b', fontStyle: 'italic' }}>(Optional)</span>
                </p>

                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  <input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={dealName}
                    onChange={(e) => setDealName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    value={dealPhone}
                    onChange={(e) => setDealPhone(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowDealsCard(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      textDecoration: 'underline'
                    }}
                  >
                    Skip & continue chat
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingDeal}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '5px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                    }}
                  >
                    {isSubmittingDeal ? 'Submitting...' : 'Claim Deal'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '6px 0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#059669', marginBottom: '2px' }}>
                  🎉 Deal Activated!
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#334155' }}>
                  Thank you! Our senior study advisor will contact you with exclusive fee discounts.
                </p>
              </div>
            )}
          </div>
        )}

        {rateLimitWarning && (
          <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: '6px', textAlign: 'center', fontWeight: '500' }}>
            ⚠️ {rateLimitWarning}
          </div>
        )}
        <form onSubmit={handleSend} className="widget-input-card">
          <textarea
            ref={inputRef}
            className="widget-textarea"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
            disabled={isLoading}
          />
          <div className="widget-input-toolbar">
            <button 
              type="submit" 
              className={`send-widget-btn ${input.trim() ? 'active' : ''}`} 
              disabled={!input.trim() || isLoading}
            >
              <Send size={16} />
            </button>
          </div>
        </form>

        <div className="widget-brand-footer">
          <Sparkles size={12} /> <span>by Educatia AI</span>
        </div>
      </div>
    </div>
  );
}
