'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CalendarDays, Users, ClipboardPlus, ChevronRight, Stethoscope } from 'lucide-react';
import PulseLine from '@/components/ui/PulseLine';

const ACTIONS = [
  {
    href: '/doctor/slots',
    Icon: CalendarDays,
    label: 'Manage schedule',
    desc: 'Set your availability and time slots',
    accent: '#1E5B94',
    bg: '#E8F1FA',
  },
  {
    href: '/doctor/queue',
    Icon: Users,
    label: 'Live queue',
    desc: "See and manage today's patient queue",
    accent: '#0B6E6E',
    bg: '#E6F4F4',
  },
  {
    href: '/doctor/prescriptions/new',
    Icon: ClipboardPlus,
    label: 'Issue prescription',
    desc: 'Create a QR-coded digital prescription',
    accent: '#2F9E44',
    bg: '#EBFBEE',
  },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Doctor';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 900 }}>
      {/* Greeting card */}
      <div
        className="cl-card cl-card--blue animate-fade-in"
        style={{
          marginBottom: '1.75rem',
          padding: '1.5rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ color: 'var(--cl-muted)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
            {greeting},
          </div>
          <h1
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--cl-ink)',
              margin: 0,
            }}
          >
            Dr. {firstName}
          </h1>
          <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Your patient queue and schedule overview
          </p>
        </div>
        <div style={{ color: 'var(--cl-blue)', opacity: 0.8 }}>
          <Stethoscope size={32} strokeWidth={1.5} aria-hidden="true" />
        </div>
      </div>

      <PulseLine divider label="Quick access" />

      {/* Action cards */}
      <div className="grid-3 stagger animate-fade-in">
        {ACTIONS.map(({ href, Icon, label, desc, accent, bg }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              background: 'var(--cl-surface)',
              border: '1px solid var(--cl-border)',
              borderLeft: `4px solid ${accent}`,
              borderRadius: 10,
              padding: '1.25rem',
              textDecoration: 'none',
              transition: 'box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--cl-shadow-sm)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: 8,
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: accent,
              }}
            >
              <Icon size={21} strokeWidth={2} aria-hidden="true" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem', color: 'var(--cl-ink)', marginBottom: '0.25rem' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--cl-muted)' }}>{desc}</div>
            </div>
            <ChevronRight size={15} color="var(--cl-subtle)" aria-hidden="true" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
