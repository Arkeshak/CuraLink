'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Menu, Globe, Check, X } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'EN', title: 'English' },
  { code: 'si', label: 'සිං', title: 'Sinhala' },
  { code: 'ta', label: 'தமி', title: 'Tamil' },
];

export default function TopBar({
  pageTitle,
  onMenuClick,
}: {
  pageTitle?: string;
  onMenuClick: () => void;
}) {
  const { user, token } = useAuth();
  const [lang, setLang] = useState('en');

  // Detect current language from cookie on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
      if (match && match[1]) {
        setLang(match[1]);
      }
    }
  }, []);

  const changeLanguage = (code: string) => {
    if (typeof document !== 'undefined') {
      const hostname = window.location.hostname;
      const val = code === 'en' ? '/en/en' : `/en/${code}`;
      document.cookie = `googtrans=${val}; path=/; domain=${hostname}`;
      document.cookie = `googtrans=${val}; path=/;`;
      window.location.reload();
    }
  };

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setNotifications(d.data || []);
          setUnreadCount(d.meta?.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  return (
    <header
      style={{
        background: 'var(--cl-surface)',
        borderBottom: '1px solid var(--cl-border)',
        padding: '0 1.5rem',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: 'var(--cl-shadow-xs)',
        gap: '1rem',
      }}
    >
      {/* Left — mobile menu + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
        <button
          onClick={onMenuClick}
          id="topbar-menu-btn"
          aria-label="Open sidebar"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.375rem',
            borderRadius: 6,
            color: 'var(--cl-muted)',
            lineHeight: 1,
          }}
        >
          <Menu size={20} strokeWidth={2} aria-hidden="true" />
        </button>

        {pageTitle && (
          <h1
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--cl-ink)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
        {/* Language switcher */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            background: 'var(--cl-surface-2)',
            border: '1px solid var(--cl-border)',
            borderRadius: 8,
            padding: '2px',
          }}
          role="group"
          aria-label="Language"
        >
          {LANGS.map((l) => {
            const isActive = lang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                title={l.title}
                aria-pressed={isActive}
                aria-label={l.title}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: 6,
                  border: 'none',
                  background: isActive ? 'var(--cl-teal)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--cl-muted)',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  lineHeight: 1.4,
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
            style={{
              position: 'relative',
              background: showNotifs ? 'var(--cl-teal-light)' : 'none',
              border: '1px solid',
              borderColor: showNotifs ? 'var(--cl-border-strong)' : 'var(--cl-border)',
              cursor: 'pointer',
              padding: '0.375rem',
              borderRadius: 8,
              color: showNotifs ? 'var(--cl-teal)' : 'var(--cl-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <Bell size={18} strokeWidth={2} aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                aria-label={`${unreadCount} unread`}
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: 'var(--cl-status-emergency)',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid white',
                  padding: '0 4px',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', top: '120%', right: 0, width: 320, background: 'white',
              borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid var(--cl-border)',
              zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 400
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--cl-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--cl-ink)' }}>Notifications</h3>
                {unreadCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--cl-teal)', fontWeight: 600 }}>{unreadCount} unread</span>}
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--cl-muted)', fontSize: '0.85rem' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} style={{ padding: '1rem', borderBottom: '1px solid var(--cl-border)', background: n.isRead ? 'white' : '#F4FBF9', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--cl-ink)', marginBottom: '0.2rem' }}>{n.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--cl-muted)', lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--cl-muted)', marginTop: '0.4rem' }}>{new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n._id)} title="Mark as read" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cl-teal)', padding: '0.25rem' }}>
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          aria-label={`Logged in as ${user?.name ?? 'user'}`}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--cl-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8125rem',
            color: '#fff',
            fontWeight: 700,
            flexShrink: 0,
            fontFamily: "'IBM Plex Sans', sans-serif",
            cursor: 'pointer',
            border: '2px solid var(--cl-teal-light)',
          }}
          tabIndex={0}
        >
          {(user?.name?.[0] ?? '?').toUpperCase()}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #topbar-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
