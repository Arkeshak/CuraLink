'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FlaskConical, RefreshCw, Clock, Droplets, ArrowRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LabBooking {
  _id: string;
  patient: { _id: string; name: string; phone?: string };
  labTest: { name: string; category?: string };
  lab: { name: string; floor?: string };
  date: string;
  timeSlot?: string;
  status: 'pending' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
  priority?: 'normal' | 'urgent';
}

const STATUS_COLS: { key: string; label: string; accent: string }[] = [
  { key: 'pending',          label: 'Pending',          accent: 'var(--cl-status-monitor)' },
  { key: 'sample_collected', label: 'Sample collected',  accent: 'var(--cl-accent-nurse)' },
  { key: 'processing',       label: 'Processing',        accent: 'var(--cl-teal)' },
  { key: 'completed',        label: 'Completed',         accent: 'var(--cl-status-low)' },
];

const NEXT_STATUS: Record<string, string> = {
  pending:          'sample_collected',
  sample_collected: 'processing',
  processing:       'completed',
};

export default function NurseLabQueuePage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<LabBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    fetch(`${API}/api/labs/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setBookings(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const advance = async (id: string, next: string) => {
    setUpdatingId(id);
    try {
      await fetch(`${API}/api/labs/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: next as any } : b));
    } catch {}
    finally { setUpdatingId(null); }
  };

  const byStatus = (key: string) => bookings.filter((b) => b.status === key);

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-accent-nurse)' }}>
              <FlaskConical size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--cl-ink)', margin: 0 }}>Lab queue</h1>
          </div>
          <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>Manage lab bookings from intake to completion.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} aria-label="Refresh queue">
          <RefreshCw size={14} strokeWidth={2} aria-hidden="true" /> Refresh
        </button>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="grid-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 320 }} aria-hidden="true" />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }} className="kanban-grid">
          {STATUS_COLS.map(({ key, label, accent }) => {
            const items = byStatus(key);
            return (
              <div key={key} className="kanban-col" aria-label={`${label} column, ${items.length} items`}>
                <div className="kanban-col-header">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} aria-hidden="true" />
                  {label}
                  <span
                    style={{
                      marginLeft: 'auto',
                      background: 'var(--cl-surface)',
                      border: '1px solid var(--cl-border)',
                      borderRadius: 9999,
                      padding: '0.1rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--cl-muted)',
                    }}
                  >
                    {items.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--cl-subtle)', fontSize: '0.8rem' }}>
                      Empty
                    </div>
                  ) : items.map((b) => {
                    const next = NEXT_STATUS[b.status];
                    return (
                      <div
                        key={b._id}
                        style={{
                          background: 'var(--cl-surface)',
                          border: '1px solid var(--cl-border)',
                          borderLeft: `4px solid ${b.priority === 'urgent' ? 'var(--cl-status-emergency)' : accent}`,
                          borderRadius: 10,
                          padding: '0.75rem 0.875rem',
                        }}
                      >
                        {b.priority === 'urgent' && (
                          <span className="badge badge-danger" style={{ marginBottom: '0.375rem' }}>Urgent</span>
                        )}
                        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '0.8375rem', color: 'var(--cl-ink)', marginBottom: '0.2rem' }}>
                          {b.patient?.name}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--cl-muted)', marginBottom: '0.2rem' }}>
                          {b.labTest?.name}
                        </div>
                        <div style={{ display: 'flex', gap: '0.375rem', fontSize: '0.72rem', color: 'var(--cl-subtle)', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                          {b.timeSlot && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={10} aria-hidden="true" /> {b.timeSlot}
                            </span>
                          )}
                        </div>
                        {next && (
                          <button
                            onClick={() => advance(b._id, next)}
                            disabled={updatingId === b._id}
                            aria-label={`Advance ${b.patient?.name} to ${next.replace('_', ' ')}`}
                            style={{
                              width: '100%',
                              padding: '0.35rem 0.625rem',
                              borderRadius: 6,
                              border: `1px solid ${accent}`,
                              background: 'transparent',
                              color: accent,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: updatingId === b._id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              fontFamily: "'IBM Plex Sans', sans-serif",
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}14`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <ArrowRight size={11} strokeWidth={2} aria-hidden="true" />
                            {key === 'pending' ? 'Collect sample' : key === 'sample_collected' ? 'Start processing' : 'Mark complete'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .kanban-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 520px) { .kanban-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
