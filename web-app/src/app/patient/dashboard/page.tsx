'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Stethoscope,
  CalendarDays,
  FileText,
  Pill,
  Camera,
  MessageSquare,
  Clock,
  Activity,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';
import PulseLine from '@/components/ui/PulseLine';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Stats {
  appointments: number;
  reports: number;
  prescriptions: number;
  aiAnalyses: number;
}

const QUICK_ACTIONS = [
  {
    href: '/patient/symptom-check',
    Icon: Stethoscope,
    label: 'Check symptoms',
    desc: 'AI-powered analysis',
    accent: '#0B6E6E',
    bg: '#E6F4F4',
  },
  {
    href: '/patient/book-appointment',
    Icon: CalendarDays,
    label: 'Book appointment',
    desc: 'Find a specialist',
    accent: '#1E5B94',
    bg: '#E8F1FA',
  },
  {
    href: '/patient/my-reports',
    Icon: FileText,
    label: 'Upload report',
    desc: 'RAG-powered Q&A',
    accent: '#2F9E44',
    bg: '#EBFBEE',
  },
  {
    href: '/patient/triage',
    Icon: Camera,
    label: 'Visual triage',
    desc: 'Photo urgency check',
    accent: '#D9722C',
    bg: '#FFF3ED',
  },
  {
    href: '/patient/prescriptions',
    Icon: Pill,
    label: 'Prescriptions',
    desc: 'QR-coded records',
    accent: '#5B5F97',
    bg: '#EFEFF5',
  },
  {
    href: '/patient/my-reports',
    Icon: MessageSquare,
    label: 'Ask AI about report',
    desc: 'Get plain-language answers',
    accent: '#C97B2E',
    bg: '#FDF3E7',
  },
];

const APPT_STATUS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  pending:   { color: '#E8A317', bg: '#FFF9DB', border: '#FFD43B' },
  confirmed: { color: '#2F9E44', bg: '#EBFBEE', border: '#8CE99A' },
  started:   { color: '#1E5B94', bg: '#E8F1FA', border: '#B8D0EB' },
  ready:     { color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
  in:        { color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD' },
  completed: { color: '#4E6B6B', bg: '#F2F8F8', border: '#D4E4E4' },
  cancelled: { color: '#D64545', bg: '#FFF5F5', border: '#F5A6A6' },
  skipped:   { color: '#6B7280', bg: '#F9FAFB', border: '#D1D5DB' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function PatientDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats>({ appointments: 0, reports: 0, prescriptions: 0, aiAnalyses: 0 });
  const [recentAppts, setRecentAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/api/appointments`, { headers: h }).then((r) => r.json()),
      fetch(`${API}/api/reports`, { headers: h }).then((r) => r.json()),
      fetch(`${API}/api/prescriptions`, { headers: h }).then((r) => r.json()),
      fetch(`${API}/api/ai/history`, { headers: h }).then((r) => r.json()),
    ])
      .then(([appts, reports, rxs, aiLogs]) => {
        const apptList = appts.data ?? appts.appointments ?? [];
        setStats({
          appointments: apptList.length,
          reports: reports.data?.length ?? 0,
          prescriptions: rxs.data?.length ?? 0,
          aiAnalyses: aiLogs.data?.length ?? 0,
        });
        setRecentAppts(apptList.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const statCards = [
    { Icon: CalendarDays, label: 'Appointments', value: stats.appointments, accent: '#1E5B94', bg: '#E8F1FA' },
    { Icon: FileText,    label: 'Lab reports',   value: stats.reports,       accent: '#2F9E44', bg: '#EBFBEE' },
    { Icon: Pill,        label: 'Prescriptions',  value: stats.prescriptions, accent: '#5B5F97', bg: '#EFEFF5' },
    { Icon: Activity,    label: 'AI analyses',    value: stats.aiAnalyses,    accent: '#0B6E6E', bg: '#E6F4F4' },
  ];

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 1200 }}>

      {/* Greeting card */}
      <div
        className="cl-card cl-card--teal animate-fade-in"
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
            {getGreeting()},
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
            {user?.name ?? 'Patient'}
          </h1>
          <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Here's a summary of your health activity.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--cl-teal)',
          }}
        >
          <HeartPulse size={28} strokeWidth={1.5} aria-hidden="true" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-4 stagger animate-fade-in" style={{ marginBottom: '1.75rem' }}>
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 92 }} aria-hidden="true" />
            ))
          : statCards.map(({ Icon, label, value, accent, bg }) => (
              <div
                key={label}
                className="stat-card"
                style={{ borderLeftColor: accent }}
              >
                <div
                  className="stat-icon"
                  style={{ background: bg, color: accent }}
                >
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
      </div>

      <PulseLine divider />

      {/* Quick actions */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--cl-ink)',
            marginBottom: '1rem',
          }}
        >
          Quick actions
        </h2>
        <div className="grid-3 stagger">
          {QUICK_ACTIONS.map(({ href, Icon, label, desc, accent, bg }) => (
            <Link
              key={href + label}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                background: 'var(--cl-surface)',
                border: '1px solid var(--cl-border)',
                borderLeft: `4px solid ${accent}`,
                borderRadius: 10,
                padding: '1rem 1.125rem',
                textDecoration: 'none',
                transition: 'box-shadow 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--cl-shadow-sm)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: accent,
                }}
              >
                <Icon size={19} strokeWidth={2} aria-hidden="true" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--cl-ink)',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cl-muted)', marginTop: '0.1rem' }}>
                  {desc}
                </div>
              </div>
              <ChevronRight size={15} color="var(--cl-subtle)" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>

      <PulseLine divider />

      {/* Recent appointments */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--cl-ink)',
              margin: 0,
            }}
          >
            Recent appointments
          </h2>
          <Link
            href="/patient/book-appointment"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--cl-teal)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Book new →
          </Link>
        </div>

        {loading ? (
          <div className="cl-card-flat">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 40, marginBottom: '0.75rem' }} aria-hidden="true" />
            ))}
          </div>
        ) : recentAppts.length === 0 ? (
          <div
            className="cl-card-flat"
            style={{ textAlign: 'center', padding: '2.5rem 1.5rem', color: 'var(--cl-muted)' }}
          >
            <CalendarDays size={36} strokeWidth={1.5} style={{ marginBottom: '0.75rem', color: 'var(--cl-subtle)' }} aria-hidden="true" />
            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>No appointments yet</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Book your first appointment to get started.
            </p>
          </div>
        ) : (
          <div className="cl-card-flat" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="cl-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentAppts.map((a: any) => {
                  const s = APPT_STATUS_STYLES[a.status] ?? APPT_STATUS_STYLES.Pending;
                  return (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 500, color: 'var(--cl-ink)' }}>
                        {a.doctor?.name ?? a.doctorName ?? '—'}
                      </td>
                      <td style={{ color: 'var(--cl-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={13} aria-hidden="true" />
                          {a.date ? new Date(a.date).toLocaleDateString('en-LK') : '—'}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: s.bg,
                            color: s.color,
                            borderColor: s.border,
                            border: '1px solid',
                          }}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td>
                        <ChevronRight size={14} color="var(--cl-subtle)" aria-hidden="true" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
