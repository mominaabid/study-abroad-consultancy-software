import React, { useState } from 'react';
import { Lock, User, Key, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';
import { authenticateAdminUser } from '../../services/adminSupabaseService';

export default function AdminAuthModal({ isOpen, onClose, onAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const authResult = await authenticateAdminUser(username, password);

      if (authResult.success) {
        sessionStorage.setItem('educatia_admin_auth', 'true');
        sessionStorage.setItem('educatia_admin_user', JSON.stringify(authResult.user));
        onAuthenticated(authResult.user);
        onClose();
        setPassword('');
      } else {
        setError(authResult.error || 'Invalid username or password.');
      }
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <img 
            src="/educatia-logo.png" 
            alt="Educatia Logo" 
            style={{ height: '48px', objectFit: 'contain' }} 
          />
        </div>
        <div className="admin-auth-header">
          <div className="admin-lock-badge">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3>Portal Access</h3>
            <p>Protected area — authorized login</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-auth-form">
          {error && <div className="admin-auth-error">{error}</div>}

          <div className="admin-input-group">
            <label>Username</label>
            <div className="passcode-input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="admin-input-group" style={{ marginTop: '0.85rem' }}>
            <label>Password</label>
            <div className="passcode-input-wrapper">
              <Key size={18} className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="toggle-pass-btn"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="admin-auth-actions" style={{ marginTop: '1.2rem' }}>
            <button type="button" className="admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary" disabled={isLoggingIn}>
              <Lock size={16} />
              <span>{isLoggingIn ? 'Authenticating...' : 'Log In'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
