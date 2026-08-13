'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  UserCheck, CheckCircle, XCircle, ChevronDown, ChevronUp,
  RefreshCw, Stethoscope, Droplets, Calendar, Phone,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Request {
  _id: string;
  name: string;
  email: string;
  role: 'doctor' | 'nurse';
  specialization?: string;
  hospital?: string;
  department?: string;
  certifications?: string[];
  bio?: string;
  experienceYears?: number;
  createdAt: string;
  status: string;
  staffId?: string;
  phone?: string;
}

const ROLE_CONFIG = {
  doctor: { Icon: Stethoscope, label: 'Doctor',  accent: 'var(--cl-blue)',         bg: 'var(--cl-blue-light)',  border: '#B8D0EB' },
  nurse:  { Icon: Droplets,    label: 'Nurse',   accent: 'var(--cl-accent-nurse)', bg: '#EBF4FF',               border: '#B8D4FF' },
};

export default function AdminVerificationPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'doctor' | 'nurse'>('all');

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/api/admin/requests`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setRequests(d.data ?? d.requests ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    setActingId(id + action);
    try {
      const body: any = {};
      if (action === 'reject' && rejectNote[id]) body.reason = rejectNote[id];
      await fetch(`${API}/api/admin/requests/${id}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {}
    finally { setActingId(null); }
  };

  const filtered = requests.filter((r) => filter === 'all' || r.role === filter);

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EFEFF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-accent-admin)' }}>
              <UserCheck size={18} strokeWidth={2} aria-hidden="true" />
            </div>
            <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--cl-ink)', margin: 0 }}>
              Account verification
            </h1>
          </div>
          <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
            Review and approve or reject doctor and nurse registration requests.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={load} aria-label="Refresh requests">
            <RefreshCw size={14} strokeWidth={2} aria-hidden="true" /> Refresh
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--cl-surface-2)', border: '1px solid var(--cl-border)', borderRadius: 8, padding: '3px', marginBottom: '1.25rem', width: 'fit-content' }}>
        {(['all', 'doctor', 'nurse'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            style={{
              padding: '0.3rem 0.875rem',
              borderRadius: 6, border: 'none',
              background: filter === f ? 'var(--cl-accent-admin)' : 'transparent',
              color: filter === f ? '#fff' : 'var(--cl-muted)',
              fontWeight: filter === f ? 600 : 400,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif",
              textTransform: 'capitalize',
            }}
          >
            {f} {f !== 'all' && `(${requests.filter(r => r.role === f).length})`}
          </button>
        ))}
      </div>

      {/* Requests */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100 }} aria-hidden="true" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="cl-card-flat" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--cl-muted)' }}>
          <UserCheck size={40} strokeWidth={1.5} style={{ marginBottom: '0.75rem', color: 'var(--cl-subtle)' }} aria-hidden="true" />
          <p style={{ fontWeight: 500 }}>No pending requests</p>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>All accounts have been reviewed.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((req) => {
            const cfg = ROLE_CONFIG[req.role] ?? ROLE_CONFIG.doctor;
            const isOpen = expanded === req._id;

            return (
              <div
                key={req._id}
                className="cl-card"
                style={{ borderLeftColor: cfg.accent, padding: 0, overflow: 'hidden' }}
              >
                {/* Card header (always visible) */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
                  <div
                    style={{ width: 44, height: 44, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.accent, flexShrink: 0 }}
                    aria-hidden="true"
                  >
                    <cfg.Icon size={20} strokeWidth={2} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
                      <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '0.9375rem', color: 'var(--cl-ink)' }}>
                        {req.name}
                      </span>
                      <span
                        className="badge"
                        style={{ background: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.label}
                      </span>
                      <span className="badge badge-pending">Pending review</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--cl-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span>{req.email}</span>
                      {req.specialization && <span>· {req.specialization}</span>}
                      {req.department && <span>· {req.department}</span>}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Calendar size={11} aria-hidden="true" />
                        {new Date(req.createdAt).toLocaleDateString('en-LK')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => act(req._id, 'approve')}
                      disabled={actingId === req._id + 'approve'}
                      aria-label={`Approve ${req.name}'s request`}
                    >
                      <CheckCircle size={14} strokeWidth={2} aria-hidden="true" />
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => act(req._id, 'reject')}
                      disabled={actingId === req._id + 'reject'}
                      aria-label={`Reject ${req.name}'s request`}
                    >
                      <XCircle size={14} strokeWidth={2} aria-hidden="true" />
                      Reject
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => setExpanded(isOpen ? null : req._id)}
                      aria-expanded={isOpen}
                      aria-label={isOpen ? 'Collapse details' : 'Expand details'}
                    >
                      {isOpen ? <ChevronUp size={16} strokeWidth={2} aria-hidden="true" /> : <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--cl-border)', paddingTop: '1rem' }}>
                    <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
                      {req.staffId && <div><div className="label">Staff ID</div><div style={{ fontSize: '0.875rem', color: 'var(--cl-ink)' }}>{req.staffId}</div></div>}
                      {req.phone && <div><div className="label">Phone</div><div style={{ fontSize: '0.875rem', color: 'var(--cl-ink)', display: 'flex', gap: 4 }}><Phone size={13} aria-hidden="true" /> {req.phone}</div></div>}
                      {req.hospital && <div><div className="label">Hospital / Clinic</div><div style={{ fontSize: '0.875rem', color: 'var(--cl-ink)' }}>{req.hospital}</div></div>}
                      {req.experienceYears && <div><div className="label">Experience</div><div style={{ fontSize: '0.875rem', color: 'var(--cl-ink)' }}>{req.experienceYears} years</div></div>}
                    </div>
                    {req.bio && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div className="label">Bio</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--cl-ink-2)', lineHeight: 1.65 }}>{req.bio}</p>
                      </div>
                    )}
                    {req.certifications && req.certifications.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div className="label">Certifications</div>
                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                          {req.certifications.map((c, i) => <span key={i} className="badge badge-neutral">{c}</span>)}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="label" htmlFor={`note-${req._id}`}>Rejection note (optional)</label>
                      <textarea
                        id={`note-${req._id}`}
                        className="input"
                        rows={2}
                        placeholder="State a reason for rejection…"
                        value={rejectNote[req._id] ?? ''}
                        onChange={(e) => setRejectNote((n) => ({ ...n, [req._id]: e.target.value }))}
                        style={{ marginTop: '0.375rem' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
