import React, { useState } from 'react';
import { X, Key, Cpu, Database, Eye, EyeOff, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, getStoredModel, setStoredModel } from '../../services/geminiService';
import { getSupabaseConfig } from '../../services/supabaseClient';

export default function SettingsModal({ isOpen, onClose }) {
  const currentSupabase = getSupabaseConfig();
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [selectedModel, setSelectedModel] = useState(getStoredModel());
  const [supabaseUrl, setSupabaseUrl] = useState(currentSupabase.url);
  const [supabaseKey, setSupabaseKey] = useState(currentSupabase.key);
  const [tableName, setTableName] = useState(currentSupabase.tableName);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isSupabaseReady = Boolean(supabaseUrl && supabaseKey);

  const handleSave = (e) => {
    e.preventDefault();
    setStoredApiKey(apiKey);
    setStoredModel(selectedModel);
    localStorage.setItem('educatia_supabase_url', supabaseUrl.trim());
    localStorage.setItem('educatia_supabase_key', supabaseKey.trim());
    localStorage.setItem('educatia_supabase_table', tableName.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-backdrop glass-panel animate-fade-in" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Key className="modal-icon" size={20} />
            <h2>Educatia Bot & Supabase Setup</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          {/* Gemini Key */}
          <div className="form-group">
            <label className="form-label">
              <span>Gemini API Key</span>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="external-link"
              >
                Get Key <ExternalLink size={12} />
              </a>
            </label>
            <div className="key-input-wrapper">
              <input
                type={showKey ? 'text' : 'password'}
                className="form-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your Gemini API key (AIzaSy...)"
              />
              <button 
                type="button" 
                className="toggle-eye-btn"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Model Selector */}
          <div className="form-group">
            <label className="form-label">
              <span>Default AI Model</span>
              <Cpu size={14} className="muted-icon" />
            </label>
            <select
              className="form-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="gemini-flash-latest">gemini-flash-latest (Recommended Free Tier)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite (Paid Tier)</option>
            </select>
          </div>

          {/* Supabase DB Connection Section */}
          <div className="supabase-settings-card">
            <div className="supabase-card-header">
              <Database size={18} color={isSupabaseReady ? '#10b981' : '#f59e0b'} />
              <div>
                <h4 style={{ color: isSupabaseReady ? '#34d399' : '#fbbf24' }}>
                  {isSupabaseReady ? 'Supabase Connected' : 'Supabase Anon Key Required'}
                </h4>
                <p>Paste your Supabase anon key below to search your DB</p>
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '0.6rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Supabase Project URL</label>
              <input
                type="text"
                className="form-input"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://lnjvecykjhfjbsssibih.supabase.co"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.6rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>
                <span>Supabase Anon Public Key</span>
                <a 
                  href="https://supabase.com/dashboard/project/lnjvecykjhfjbsssibih/settings/api" 
                  target="_blank" 
                  rel="noreferrer"
                  className="external-link"
                >
                  Get Anon Key <ExternalLink size={11} />
                </a>
              </label>
              <input
                type="password"
                className="form-input"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJh..."
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Table Name to Search</label>
              <input
                type="text"
                className="form-input"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="knowledge_base, faqs, documents, etc."
              />
            </div>
          </div>

          {/* Save Footer */}
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {savedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
