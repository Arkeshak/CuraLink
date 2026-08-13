'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Activity, User, Stethoscope, Droplets, ChevronRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const ROLES = [
  { value: 'patient', label: 'Patient', Icon: User, desc: 'Book appointments & manage health' },
  { value: 'doctor', label: 'Doctor', Icon: Stethoscope, desc: 'Manage schedule & patients' },
  { value: 'nurse', label: 'Nurse', Icon: Droplets, desc: 'Lab queue & sample management' },
];

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'si', label: 'Sinhala', flag: '🇱🇰' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await register({ name, email, phone, password, role, language });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
      }} className="register-panel">
        <div style={{ position: 'absolute', bottom: '18%', left: 0, right: 0, opacity: 0.12 }}>
          <svg viewBox="0 0 400 60" fill="none" style={{ width: '100%' }} aria-hidden="true">
            <polyline points="0,30 60,30 80,5 100,55 120,30 160,30 180,12 200,48 220,30 400,30" stroke="#fff" strokeWidth="2" fill="none" />
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
            Join the future of<br />healthcare in Sri Lanka
          </h2>
        </div>
      </div>

      {/* Right — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }} className="mobile-logo">
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--cl-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} strokeWidth={2} color="#fff" aria-hidden="true" />
            </div>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: 'var(--cl-ink)', letterSpacing: '0.01em' }}>
              CuraLink
            </span>
          </div>

          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.625rem', fontWeight: 700, color: 'var(--cl-ink)', margin: '0 0 0.375rem' }}>
            Create an account
          </h1>
          <p style={{ color: 'var(--cl-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            {step === 1 ? 'Step 1: Choose your role and language' : 'Step 2: Enter your personal details'}
          </p>

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

          {step === 1 ? (
            <div className="animate-fade-in">
              <label style={{ display: 'block', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500, fontSize: '0.8125rem', color: 'var(--cl-ink-2)', marginBottom: '0.75rem' }}>
                I am a...
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    aria-pressed={role === r.value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem', borderRadius: 8,
                      border: `1px solid ${role === r.value ? 'var(--cl-teal)' : 'var(--cl-border)'}`,
                      background: role === r.value ? 'var(--cl-teal-light)' : 'var(--cl-surface)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                      boxShadow: role === r.value ? '0 0 0 1px var(--cl-teal)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: role === r.value ? '#fff' : 'var(--cl-surface-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      color: role === r.value ? 'var(--cl-teal)' : 'var(--cl-muted)'
                    }}>
                      <r.Icon size={20} strokeWidth={2} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, color: 'var(--cl-ink)', fontSize: '0.9375rem' }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--cl-muted)' }}>{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <label style={{ display: 'block', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500, fontSize: '0.8125rem', color: 'var(--cl-ink-2)', marginBottom: '0.75rem' }}>
                Preferred language
              </label>
              <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '2rem' }}>
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    aria-pressed={language === l.code}
                    style={{
                      flex: 1, padding: '0.875rem 0.5rem', borderRadius: 8,
                      border: `1px solid ${language === l.code ? 'var(--cl-teal)' : 'var(--cl-border)'}`,
                      background: language === l.code ? 'var(--cl-teal-light)' : 'var(--cl-surface)',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem',
                      transition: 'all 0.15s', boxShadow: language === l.code ? '0 0 0 1px var(--cl-teal)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }} aria-hidden="true">{l.flag}</span>
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: language === l.code ? 600 : 500, fontSize: '0.8125rem', color: 'var(--cl-ink)' }}>{l.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: 'var(--cl-teal)', color: '#fff', border: 'none', borderRadius: 8,
                  fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cl-teal-dark)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--cl-teal)'; }}
              >
                Continue <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="animate-fade-in">
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="reg-name" style={{ display: 'block', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500, fontSize: '0.8125rem', color: 'var(--cl-ink-2)', marginBottom: '0.375rem' }}>Full name</label>
                  <input id="reg-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="input" style={{ fontSize: '0.9375rem' }} />
                </div>
                <div>
                  <label htmlFor="reg-phone" style={{ display: 'block', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500, fontSize: '0.8125rem', color: 'var(--cl-ink-2)', marginBottom: '0.375rem' }}>Phone</label>
                  <input id="reg-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" className="input" style={{ fontSize: '0.9375rem' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="reg-email" style={{ display: 'block', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500, fontSize: '0.8125rem', color: 'var(--cl-ink-2)', marginBottom: '0.375rem' }}>Email address</label>
                <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" autoComplete="email" style={{ fontSize: '0.9375rem' }} />
              </div>

              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.75rem' }}>
                <div>
                  <label htmlFor="reg-password" style={{ display: 'block', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500, fontSize: '0.8125rem', color: 'var(--cl-ink-2)', marginBottom: '0.375rem' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input id="reg-password" type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input" autoComplete="new-password" style={{ paddingRight: '2.5rem', fontSize: '0.9375rem' }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cl-subtle)', padding: 0 }}>
                      {showPw ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-confirm" style={{ display: 'block', fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500, fontSize: '0.8125rem', color: 'var(--cl-ink-2)', marginBottom: '0.375rem' }}>Confirm password</label>
                  <input id="reg-confirm" type={showPw ? 'text' : 'password'} required value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" className="input" autoComplete="new-password" style={{ fontSize: '0.9375rem' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-ghost" style={{ flexShrink: 0 }}>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1, padding: '0.875rem',
                    background: loading ? 'var(--cl-border-strong)' : 'var(--cl-teal)',
                    color: '#fff', border: 'none', borderRadius: 8,
                    fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem',
                    cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--cl-teal-dark)'; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'var(--cl-teal)'; }}
                >
                  {loading ? (
                    <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Creating account…</>
                  ) : 'Create account'}
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--cl-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--cl-teal)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 900px) {
          .register-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
