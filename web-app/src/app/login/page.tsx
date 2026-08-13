'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, AlertTriangle, Activity } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cl-canvas)',
      display: 'flex',
    }}>
      {/* Left — branding panel */}
      <div style={{
        display: 'none',
        width: '44%',
        background: 'var(--cl-teal-dark)',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }} className="login-panel">
        {/* Subtle ECG-inspired line */}
        <div style={{ position: 'absolute', bottom: '18%', left: 0, right: 0, opacity: 0.12 }}>
          <svg viewBox="0 0 400 60" fill="none" style={{ width: '100%' }} aria-hidden="true">
            <polyline points="0,30 60,30 80,5 100,55 120,30 160,30 180,12 200,48 220,30 400,30"
              stroke="#fff" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '3rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} strokeWidth={2} color="#fff" aria-hidden="true" />
            </div>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#fff', letterSpacing: '0.01em' }}>
              CuraLink
            </span>
          </div>
          <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '1.75rem', color: '#fff', lineHeight: 1.3, margin: 0 }}>
            AI-powered healthcare<br />for Sri Lanka
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9375rem', marginTop: '1rem', lineHeight: 1.65 }}>
            From symptom checks to QR prescriptions, manage your entire healthcare journey in one place.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            'Symptom checker powered by Gemini AI',
            'QR-coded digital prescriptions',
            'Lab results in plain language',
          ].map((feat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE5E5', flexShrink: 0 }} aria-hidden="true" />
              {feat}
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }} className="mobile-logo">
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--cl-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} strokeWidth={2} color="#fff" aria-hidden="true" />
            </div>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: 'var(--cl-ink)', letterSpacing: '0.01em' }}>
              CuraLink
            </span>
          </div>

          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.625rem', fontWeight: 700, color: 'var(--cl-ink)', margin: '0 0 0.375rem' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--cl-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Sign in to continue to your portal
          </p>

          {/* Error */}
          {error && (
            <div role="alert" style={{
              background: 'var(--cl-status-emergency-bg)',
              border: '1px solid var(--cl-status-emergency-border)',
              color: 'var(--cl-status-emergency)',
              borderRadius: 8, padding: '0.75rem 1rem',
              fontSize: '0.875rem', marginBottom: '1.25rem',
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '1.125rem' }}>
              <label htmlFor="login-email" style={{ display: 'block', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500, fontSize: '0.8125rem', color: 'var(--cl-ink-2)', marginBottom: '0.375rem' }}>
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
                style={{ fontSize: '0.9375rem' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.625rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <label htmlFor="login-password" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500, fontSize: '0.8125rem', color: 'var(--cl-ink-2)' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--cl-teal)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem', fontSize: '0.9375rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--cl-subtle)',
                    display: 'flex', padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={17} strokeWidth={2} aria-hidden="true" /> : <Eye size={17} strokeWidth={2} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.875rem',
                background: loading ? 'var(--cl-border-strong)' : 'var(--cl-teal)',
                color: '#fff', border: 'none', borderRadius: 8,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 600, fontSize: '0.9375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--cl-teal-dark)'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--cl-teal)'; }}
            >
              {loading ? (
                <>
                  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} aria-hidden="true" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--cl-muted)' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: 'var(--cl-teal)', fontWeight: 600, textDecoration: 'none' }}>
              Register
            </Link>
          </p>

          {/* Hint */}
          <div style={{
            marginTop: '1.25rem', padding: '0.75rem 1rem',
            background: 'var(--cl-teal-light)',
            borderRadius: 8, border: '1px solid var(--cl-border-strong)',
            fontSize: '0.8rem', color: 'var(--cl-muted)',
          }}>
            Use your registered account credentials to sign in. New accounts require admin approval for Doctor and Nurse roles.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 900px) {
          .login-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
