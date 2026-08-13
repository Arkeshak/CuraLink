'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Droplets, CheckCircle, RefreshCw, Search, Clock, ScanLine } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface LabBooking {
  _id: string;
  bookingRef?: string;
  patient: { name: string; phone?: string; email?: string };
  lab?: { name: string; category?: { name: string } };
  date: string;
  timeSlot: string;
  status: string;
  testDetails?: string;
}

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  'Booked':           { color: 'var(--cl-status-monitor)', bg: 'var(--cl-status-monitor-bg)', border: 'var(--cl-status-monitor-border)', label: 'Booked' },
  'Sample Collected': { color: 'var(--cl-accent-nurse)',   bg: '#EBF4FF', border: '#B8D4FF',   label: 'Sample collected' },
  'Processing':       { color: 'var(--cl-teal)',           bg: 'var(--cl-teal-light)',         border: 'var(--cl-border-strong)',         label: 'Processing' },
  'Ready':            { color: 'var(--cl-status-low)',     bg: 'var(--cl-status-low-bg)',      border: 'var(--cl-status-low-border)',     label: 'Ready' },
  'Completed':        { color: 'var(--cl-muted)',          bg: 'var(--cl-surface-2)',          border: 'var(--cl-border)',               label: 'Completed' },
  'Cancelled':        { color: 'var(--cl-subtle)',         bg: 'var(--cl-surface-2)',          border: 'var(--cl-border)',               label: 'Cancelled' },
};

const NEXT_STATUS: Record<string, string> = {
  'Booked': 'Sample Collected',
  'Sample Collected': 'Processing',
  'Processing': 'Ready',
  'Ready': 'Completed',
};

const NEXT_LABEL: Record<string, string> = {
  'Booked': 'Collect sample',
  'Sample Collected': 'Send to lab',
  'Processing': 'Mark ready',
  'Ready': 'Mark complete',
};

export default function NurseSamplesPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<LabBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [recentlyChecked, setRecentlyChecked] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
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
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: next } : b));
      if (next === 'Sample Collected') {
        setRecentlyChecked((s) => new Set([...s, id]));
        setTimeout(() => setRecentlyChecked((s) => { const n = new Set(s); n.delete(id); return n; }), 2500);
      }
    } catch {}
    finally { setUpdatingId(null); }
  };

  const filtered = bookings.filter((b) => {
    const matchFilter = filter === 'all' || b.status === filter;
    const matchSearch = !search || b.patient?.name?.toLowerCase().includes(search.toLowerCase()) || b.bookingRef?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const FILTERS = ['all', 'Booked', 'Sample Collected', 'Processing', 'Ready'];

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-accent-nurse)' }}>
              <Droplets size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--cl-ink)', margin: 0 }}>
              Sample collection
            </h1>
          </div>
          <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
            Manage sample collection for each booked lab test.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} aria-label="Refresh list">
          <RefreshCw size={14} strokeWidth={2} aria-hidden="true" /> Refresh
        </button>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--cl-subtle)' }} aria-hidden="true" />
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name or booking ref…"
            style={{ paddingLeft: '2.25rem' }}
            aria-label="Search samples"
          />
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--cl-surface-2)', border: '1px solid var(--cl-border)', borderRadius: 8, padding: '3px', overflow: 'auto' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: 6, border: 'none',
                background: filter === f ? 'var(--cl-accent-nurse)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--cl-muted)',
                fontWeight: filter === f ? 600 : 400,
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} aria-hidden="true" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="cl-card-flat" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--cl-muted)' }}>
          <Droplets size={40} strokeWidth={1.5} style={{ marginBottom: '0.75rem', color: 'var(--cl-subtle)' }} aria-hidden="true" />
          <p style={{ fontWeight: 500 }}>No samples in this view</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }} role="list" aria-label="Sample collection checklist">
          {filtered.map((b) => {
            const cfg = STATUS_STYLES[b.status] ?? STATUS_STYLES['Booked'];
            const next = NEXT_STATUS[b.status];
            const nextLabel = NEXT_LABEL[b.status];
            const isDone = ['Completed', 'Cancelled'].includes(b.status);
            const justChecked = recentlyChecked.has(b._id);

            return (
              <div
                key={b._id}
                className="cl-card"
                role="listitem"
                style={{
                  borderLeftColor: cfg.color,
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  opacity: isDone ? 0.6 : 1,
                  minHeight: 52, // accessible tap target
                  transition: 'opacity 0.3s',
                  background: justChecked ? 'var(--cl-teal-pale)' : 'var(--cl-surface)',
                }}
              >
                {/* Status icon */}
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: isDone ? 'var(--cl-status-low-bg)' : cfg.bg,
                    border: `2px solid ${isDone ? 'var(--cl-status-low-border)' : cfg.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    color: isDone ? 'var(--cl-status-low)' : cfg.color,
                    transition: 'all 0.3s',
                  }}
                  aria-hidden="true"
                >
                  {isDone
                    ? <CheckCircle size={20} strokeWidth={2} />
                    : <Droplets size={18} strokeWidth={2} />}
                </div>

                {/* Patient info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem', color: 'var(--cl-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.patient?.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--cl-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                    {b.lab?.name && <span>{b.lab.name}</span>}
                    {b.timeSlot && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} aria-hidden="true" /> {b.timeSlot}</span>}
                    {b.bookingRef && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><ScanLine size={11} aria-hidden="true" /> {b.bookingRef}</span>}
                  </div>
                </div>

                {/* Status badge */}
                <span className="badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, flexShrink: 0 }}>
                  {cfg.label}
                </span>

                {/* Action — large tap target */}
                {next && (
                  <button
                    onClick={() => advance(b._id, next)}
                    disabled={updatingId === b._id}
                    aria-label={`${nextLabel} for ${b.patient?.name}`}
                    style={{
                      minHeight: 44,
                      minWidth: 44,
                      padding: '0.5rem 1rem',
                      borderRadius: 8,
                      border: `1.5px solid var(--cl-accent-nurse)`,
                      background: 'transparent',
                      color: 'var(--cl-accent-nurse)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: updatingId === b._id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      flexShrink: 0,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#EBF4FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {updatingId === b._id
                      ? <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(61,139,253,0.3)', borderTopColor: 'var(--cl-accent-nurse)', borderRadius: '50%', display: 'inline-block' }} aria-hidden="true" />
                      : <CheckCircle size={14} strokeWidth={2} aria-hidden="true" />}
                    {nextLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
