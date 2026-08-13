'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Menu, Globe } from 'lucide-react';

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
  const { user } = useAuth();
  const [lang, setLang] = useState('en');

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
                onClick={() => setLang(l.code)}
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
        <button
          aria-label="Notifications"
          style={{
            position: 'relative',
            background: 'none',
            border: '1px solid var(--cl-border)',
            cursor: 'pointer',
            padding: '0.375rem',
            borderRadius: 8,
            color: 'var(--cl-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--cl-teal-light)';
            e.currentTarget.style.color = 'var(--cl-teal)';
            e.currentTarget.style.borderColor = 'var(--cl-border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--cl-muted)';
            e.currentTarget.style.borderColor = 'var(--cl-border)';
          }}
        >
          <Bell size={18} strokeWidth={2} aria-hidden="true" />
          <span
            aria-label="Unread notifications"
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--cl-status-emergency)',
              border: '1.5px solid white',
            }}
          />
        </button>

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
