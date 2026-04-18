import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  loginUser,
  clearError,
  selectAuthError,
  selectAuthLoading,
  selectIsAuth,
  selectRole,
} from '../../redux/slices/authSlice';
import './Login.css';

const ROLE_PATHS = {
  admin:      '/admin/dashboard',
  counsellor: '/counsellor/dashboard',
  student:    '/student/dashboard',
};

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectAuthLoading);
  const error   = useSelector(selectAuthError);
  const isAuth  = useSelector(selectIsAuth);
  const role    = useSelector(selectRole);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [touched,  setTouched]  = useState({ email: false, password: false });

  // Redirect once authenticated
  useEffect(() => {
    if (isAuth && role && ROLE_PATHS[role]) {
      navigate(ROLE_PATHS[role], { replace: true });
    }
  }, [isAuth, role, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email || !password) return;
    dispatch(clearError());
    dispatch(loginUser({ email, password }));
  }

  const emailErr    = touched.email    && !email;
  const passwordErr = touched.password && !password;

  return (
    <div className="login-root">

      {/* ── Left panel — branding ── */}
      <div className="login-left">
        <div className="login-left__inner">
          <div className="brand-mark">
            <div className="brand-icon">E</div>
            <span className="brand-name">EDUCATIA</span>
          </div>

          <div className="brand-headline">
            <h2>Your gateway to<br />global education</h2>
            <p>Manage leads, applications, and student journeys — all in one place.</p>
          </div>

          <div className="brand-stats">
            <div className="stat">
              <span className="stat-num">2,400+</span>
              <span className="stat-label">Students placed</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">48</span>
              <span className="stat-label">Universities</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">12</span>
              <span className="stat-label">Countries</span>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="deco-circle deco-circle--1" />
          <div className="deco-circle deco-circle--2" />
          <div className="deco-circle deco-circle--3" />
          <div className="deco-grid" />
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="login-right">
        <div className="login-card">

          <div className="login-card__top">
            <div className="mobile-brand">
              <div className="brand-icon brand-icon--sm">E</div>
              <span className="brand-name brand-name--dark">EDUCATIA</span>
            </div>
            <h1 className="login-heading">Welcome back</h1>
            <p className="login-subheading">Sign in to your portal to continue</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert--error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>

            {/* Email */}
            <div className={`field ${emailErr ? 'field--error' : ''}`}>
              <label htmlFor="email" className="field__label">
                Email address
              </label>
              <div className="field__input-wrap">
                <span className="field__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  placeholder="you@educatia.com"
                  autoFocus
                  onChange={e => { setEmail(e.target.value); dispatch(clearError()); }}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                />
              </div>
              {emailErr && <span className="field__error">Email is required</span>}
            </div>

            {/* Password */}
            <div className={`field ${passwordErr ? 'field--error' : ''}`}>
              <label htmlFor="password" className="field__label">
                Password
              </label>
              <div className="field__input-wrap">
                <span className="field__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  onChange={e => { setPassword(e.target.value); dispatch(clearError()); }}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                />
                <button
                  type="button"
                  className="field__eye"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {passwordErr && <span className="field__error">Password is required</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`login-submit ${loading ? 'login-submit--loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="submit-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>

          </form>

          {/* Role hint pills */}
          <div className="role-hints">
            <span className="role-hint">
              <span className="role-dot role-dot--admin" />
              Admin
            </span>
            <span className="role-hint">
              <span className="role-dot role-dot--counsellor" />
              Counsellor
            </span>
            <span className="role-hint">
              <span className="role-dot role-dot--student" />
              Student
            </span>
          </div>

          <p className="login-footer">
            Each role is redirected to its own portal after login.
          </p>

        </div>
      </div>
    </div>
  );
}