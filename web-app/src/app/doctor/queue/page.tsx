'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, PhoneCall, CheckCircle, SkipForward, RefreshCw, Clock, AlertTriangle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Patient { _id: string; name: string; email: string; phone?: string; }
interface Appointment {
  _id: string;
  patient: Patient;
  date: string;
  timeSlot: string;
  queueNumber: number;
  status: string;
  symptoms?: string;
  notes?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: 'Pending',         color: 'var(--cl-status-monitor)',   bg: 'var(--cl-status-monitor-bg)',   border: 'var(--cl-status-monitor-border)' },
  confirmed: { label: 'Confirmed',       color: 'var(--cl-blue)',             bg: 'var(--cl-blue-light)',          border: '#B8D0EB' },
  started:   { label: 'In Triage',       color: '#A16207',                    bg: '#FEF08A',                       border: '#FDE047' },
  in:        { label: 'In consultation', color: 'var(--cl-teal)',             bg: 'var(--cl-teal-light)',          border: 'var(--cl-border-strong)' },
  ready:     { label: 'Ready',           color: 'var(--cl-status-low)',       bg: 'var(--cl-status-low-bg)',       border: 'var(--cl-status-low-border)' },
  completed: { label: 'Completed',       color: 'var(--cl-muted)',            bg: 'var(--cl-surface-2)',           border: 'var(--cl-border)' },
  cancelled: { label: 'Cancelled',       color: 'var(--cl-status-emergency)', bg: 'var(--cl-status-emergency-bg)', border: 'var(--cl-status-emergency-border)' },
  skipped:   { label: 'Skipped',         color: 'var(--cl-subtle)',           bg: 'var(--cl-surface-2)',           border: 'var(--cl-border)' },
};

const NEXT_ACTION: Record<string, { label: string; next: string }> = {
  pending:   { label: 'Confirm',        next: 'confirmed' },
  confirmed: { label: 'Start consult', next: 'in' },
  in:        { label: 'Mark complete',  next: 'completed' },
  ready:     { label: 'Admit',          next: 'in' },
};

export default function DoctorQueuePage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'all' | 'done'>('active');

  const load = useCallback(() => {
    if (!token) return;
    fetch(`${API}/api/nurse/appointments/today`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setAppointments(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await fetch(`${API}/api/nurse/appointments/${id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status } : a));
    } catch {}
    finally { setUpdatingId(null); }
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'active') return !['completed', 'cancelled', 'skipped'].includes(a.status);
    if (filter === 'done')   return ['completed', 'cancelled', 'skipped'].includes(a.status);
    return true;
  });

  const now = new Date();

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--cl-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-blue)' }}>
              <Users size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--cl-ink)', margin: 0 }}>
              Live queue
            </h1>
          </div>
          <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
            Today — {now.toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} aria-label="Refresh queue">
          <RefreshCw size={14} strokeWidth={2} aria-hidden="true" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--cl-surface-2)', border: '1px solid var(--cl-border)', borderRadius: 8, padding: '3px', marginBottom: '1.25rem', width: 'fit-content' }}>
        {(['active', 'all', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            style={{
              padding: '0.3rem 0.875rem',
              borderRadius: 6, border: 'none',
              background: filter === f ? 'var(--cl-blue)' : 'transparent',
              color: filter === f ? '#fff' : 'var(--cl-muted)',
              fontWeight: filter === f ? 600 : 400,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Queue */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 96 }} aria-hidden="true" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="cl-card-flat" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--cl-muted)' }}>
          <Users size={40} strokeWidth={1.5} style={{ marginBottom: '0.75rem', color: 'var(--cl-subtle)' }} aria-hidden="true" />
          <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Queue is empty</p>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>No appointments in this view</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered
            .sort((a, b) => (a.queueNumber ?? 0) - (b.queueNumber ?? 0))
            .map((appt) => {
              const cfg = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
              const next = NEXT_ACTION[appt.status];
              const isDone = ['completed', 'cancelled', 'skipped'].includes(appt.status);

              return (
                <div
                  key={appt._id}
                  className="cl-card"
                  style={{
                    borderLeftColor: appt.status === 'in' ? 'var(--cl-blue)' : cfg.color,
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    opacity: isDone ? 0.65 : 1,
                  }}
                >
                  {/* Queue number ticket */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: appt.status === 'in' ? 'var(--cl-blue)' : 'var(--cl-surface-2)',
                      border: `2px solid ${appt.status === 'in' ? 'var(--cl-blue)' : 'var(--cl-border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    aria-label={`Queue number ${appt.queueNumber}`}
                  >
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: '1.125rem', color: appt.status === 'in' ? '#fff' : 'var(--cl-ink)' }}>
                      {appt.queueNumber ?? '—'}
                    </span>
                  </div>

                  {/* Patient info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem', color: 'var(--cl-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {appt.patient?.name ?? 'Unknown patient'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                      {appt.timeSlot && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--cl-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} aria-hidden="true" /> {appt.timeSlot}
                        </span>
                      )}
                      {appt.patient?.phone && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--cl-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <PhoneCall size={12} aria-hidden="true" /> {appt.patient.phone}
                        </span>
                      )}
                    </div>
                    {appt.symptoms && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--cl-muted)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {appt.symptoms}
                      </p>
                    )}
                  </div>

                  {/* Status + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                    <span
                      className="badge"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                      {cfg.label}
                    </span>
                    {next && (
                      <button
                        className="btn btn-blue btn-sm"
                        onClick={() => updateStatus(appt._id, next.next)}
                        disabled={updatingId === appt._id}
                        aria-label={`${next.label} for ${appt.patient?.name}`}
                      >
                        {next.next === 'completed' ? <CheckCircle size={13} strokeWidth={2} aria-hidden="true" /> : null}
                        {next.label}
                      </button>
                    )}
                    {!isDone && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => updateStatus(appt._id, 'skipped')}
                        aria-label={`Skip ${appt.patient?.name}`}
                      >
                        <SkipForward size={13} strokeWidth={2} aria-hidden="true" /> Skip
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
