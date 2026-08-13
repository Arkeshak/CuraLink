'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Activity, Users, CalendarDays, FlaskConical, Stethoscope, Brain } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AnalyticsData {
  summary: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalAppointments: number;
    completedAppointments: number;
    pendingAppointments: number;
    aiAnalyses: number;
    aiUniqueSpecialists: number;
  };
  appointmentTrend: Array<{ label: string; count: number }>;
  userTrend: Array<{ label: string; count: number }>;
  aiStats: {
    totalAnalyses: number;
    topSpecialist: string;
    specialistBreakdown: Array<{ label: string; count: number }>;
  };
  aiRecent: Array<{ id: string; query: string; specialist: string; createdAt: string }>;
}

type TimeFrame = 'weekly' | 'monthly' | 'yearly';

function MiniBarChart({ data, color }: { data: Array<{ label: string; count: number }>; color: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }} aria-hidden="true">
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
          <div
            title={`${d.label}: ${d.count}`}
            style={{
              width: '100%',
              borderRadius: '4px 4px 0 0',
              background: color,
              opacity: 0.75,
              height: `${(d.count / max) * 64}px`,
              minHeight: d.count > 0 ? 4 : 0,
              transition: 'height 0.4s ease',
            }}
          />
          <div style={{ fontSize: '0.55rem', color: 'var(--cl-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 32, textAlign: 'center' }}>
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminMonitoringPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<TimeFrame>('monthly');
  const [stats, setStats] = useState<any>(null);

  const load = (tf: TimeFrame) => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/admin/analytics?timeframe=${tf}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([analyticsData, statsData]) => {
        setData(analyticsData.data ?? null);
        setStats(statsData.data ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(timeframe); }, [timeframe, token]);

  const summary = data?.summary;

  const platformStats = stats ? [
    { Icon: Users,       label: 'Total users',    value: stats.totalUsers,        accent: 'var(--cl-accent-admin)',   bg: '#EFEFF5' },
    { Icon: Stethoscope, label: 'Doctors',         value: stats.totalDoctors,      accent: 'var(--cl-blue)',           bg: 'var(--cl-blue-light)' },
    { Icon: Users,       label: 'Nurses',          value: stats.totalNurses,       accent: 'var(--cl-accent-nurse)',   bg: '#EBF4FF' },
    { Icon: CalendarDays,label: 'Appointments',    value: stats.totalAppointments, accent: 'var(--cl-teal)',           bg: 'var(--cl-teal-light)' },
    { Icon: FlaskConical,label: 'Lab bookings',    value: stats.totalLabBookings,  accent: 'var(--cl-status-monitor)', bg: 'var(--cl-status-monitor-bg)' },
    { Icon: Brain,       label: 'AI analyses',     value: stats.totalAiAnalyses,   accent: 'var(--cl-accent-admin)',   bg: '#EFEFF5' },
  ] : [];

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EFEFF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-accent-admin)' }}>
              <Activity size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--cl-ink)', margin: 0 }}>
              Platform monitoring
            </h1>
          </div>
          <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
            Real-time analytics, usage trends, and AI diagnostics overview.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--cl-surface-2)', border: '1px solid var(--cl-border)', borderRadius: 8, padding: '3px' }}>
          {(['weekly', 'monthly', 'yearly'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              aria-pressed={timeframe === tf}
              style={{
                padding: '0.3rem 0.875rem', borderRadius: 6, border: 'none',
                background: timeframe === tf ? 'var(--cl-accent-admin)' : 'transparent',
                color: timeframe === tf ? '#fff' : 'var(--cl-muted)',
                fontWeight: timeframe === tf ? 600 : 400,
                fontSize: '0.8125rem', cursor: 'pointer', textTransform: 'capitalize',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Platform stats grid */}
      {stats && (
        <div className="grid-3 stagger animate-fade-in" style={{ marginBottom: '1.75rem' }}>
          {platformStats.map(({ Icon, label, value, accent, bg }) => (
            <div key={label} className="stat-card" style={{ borderLeftColor: accent }}>
              <div className="stat-icon" style={{ background: bg, color: accent }}>
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <div className="stat-value">{value ?? 0}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && !data ? (
        <div className="grid-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 200 }} aria-hidden="true" />)}
        </div>
      ) : data ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>

          {/* Period summary */}
          <div className="cl-card cl-card--admin">
            <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, color: 'var(--cl-ink)', fontSize: '0.9375rem', margin: '0 0 1rem' }}>
              Period summary
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {summary && [
                { label: 'New users',            value: summary.newUsers },
                { label: 'Total appointments',   value: summary.totalAppointments },
                { label: 'Completed',            value: summary.completedAppointments },
                { label: 'Pending',              value: summary.pendingAppointments },
                { label: 'AI analyses',          value: summary.aiAnalyses },
                { label: 'Specialists covered',  value: summary.aiUniqueSpecialists },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--cl-surface-2)',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: '0.8375rem', color: 'var(--cl-ink-2)' }}>{label}</span>
                  <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, color: 'var(--cl-accent-admin)', fontSize: '0.9375rem' }}>
                    {value ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment trend */}
          <div className="cl-card cl-card--teal">
            <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, color: 'var(--cl-ink)', fontSize: '0.9375rem', margin: '0 0 1rem' }}>
              Appointment trend
            </h2>
            {data.appointmentTrend?.length > 0 ? (
              <MiniBarChart data={data.appointmentTrend} color="var(--cl-teal)" />
            ) : (
              <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-subtle)', fontSize: '0.875rem' }}>No data</div>
            )}
          </div>

          {/* User growth */}
          <div className="cl-card cl-card--blue">
            <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, color: 'var(--cl-ink)', fontSize: '0.9375rem', margin: '0 0 1rem' }}>
              User growth
            </h2>
            {data.userTrend?.length > 0 ? (
              <MiniBarChart data={data.userTrend} color="var(--cl-blue)" />
            ) : (
              <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-subtle)', fontSize: '0.875rem' }}>No data</div>
            )}
          </div>

          {/* AI specialist breakdown */}
          <div className="cl-card cl-card--admin">
            <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, color: 'var(--cl-ink)', fontSize: '0.9375rem', margin: '0 0 1rem' }}>
              AI — Top specialties recommended
            </h2>
            {data.aiStats?.specialistBreakdown?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {data.aiStats.specialistBreakdown.map((item, i) => {
                  const maxCount = data.aiStats.specialistBreakdown[0]?.count || 1;
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--cl-ink-2)', fontWeight: 500 }}>{item.label}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cl-accent-admin)' }}>{item.count}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--cl-border)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${(item.count / maxCount) * 100}%`,
                          background: 'var(--cl-accent-admin)',
                          borderRadius: 9999,
                          transition: 'width 0.4s ease',
                          opacity: 0.7 + (0.3 * (1 - i / data.aiStats.specialistBreakdown.length)),
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--cl-subtle)', fontSize: '0.875rem', textAlign: 'center', paddingTop: '1rem' }}>No AI analyses yet</p>
            )}
          </div>

          {/* Recent AI queries — spans full width */}
          <div className="cl-card cl-card--neutral" style={{ gridColumn: 'span 2' }}>
            <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, color: 'var(--cl-ink)', fontSize: '0.9375rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={16} strokeWidth={2} color="var(--cl-accent-admin)" aria-hidden="true" />
              Recent AI symptom analyses
            </h2>
            {data.aiRecent?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.aiRecent.slice(0, 6).map((q) => (
                  <div
                    key={q.id}
                    style={{
                      background: 'var(--cl-surface-2)',
                      borderRadius: 8,
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFEFF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Brain size={16} strokeWidth={2} color="var(--cl-accent-admin)" aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8375rem', color: 'var(--cl-ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.query || 'Symptom analysis'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cl-accent-admin)', marginTop: '0.1rem', fontWeight: 600 }}>
                        → {q.specialist}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--cl-subtle)', flexShrink: 0 }}>
                      {new Date(q.createdAt).toLocaleDateString('en-LK')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--cl-muted)', padding: '2rem', fontSize: '0.875rem' }}>No recent AI queries.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
