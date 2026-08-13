'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Users, PhoneCall, CheckCircle, Stethoscope, RefreshCw, Clock } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Appointment {
  _id: string;
  patient: { name: string; phone?: string };
  doctor: { name: string; specialization?: string };
  timeSlot: string;
  status: string;
  queueNumber?: number;
}

const STATUS_COLOR: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending:   { bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB', label: 'Pending' },
  confirmed: { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD', label: 'Waiting' },
  started:   { bg: '#FEF08A', text: '#A16207', border: '#FDE047', label: 'In Triage' },
  ready:     { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0', label: 'Ready for Dr' },
  in:        { bg: '#E0E7FF', text: '#4338CA', border: '#C7D2FE', label: 'In Consult' },
  completed: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA', label: 'Cancelled' },
};

export default function NurseDashboard() {
  const { user, token } = useAuth();
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadQueue = useCallback(() => {
    if (!token) return;
    fetch(`${API}/api/nurse/appointments/today`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => setAppts(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await fetch(`${API}/api/nurse/appointments/${id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setAppts((prev) => prev.map((a) => a._id === id ? { ...a, status } : a));
    } catch {}
    finally {
      setUpdatingId(null);
    }
  };

  const todayActive = appts.filter((a) => !['completed', 'cancelled'].includes(a.status));
  const waitingCount = appts.filter((a) => ['pending', 'confirmed'].includes(a.status)).length;
  const inTriageCount = appts.filter((a) => a.status === 'started').length;
  const readyCount = appts.filter((a) => a.status === 'ready').length;

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1100 }}>
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 20, padding: '2rem', marginBottom: '2rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.15), transparent)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.4rem', fontWeight: 500, letterSpacing: '0.02em' }}>
            {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.75rem', margin: '0 0 0.4rem' }}>
            Welcome, {user?.name?.split(' ')[0]} 🩺
          </h1>
          <p style={{ opacity: 0.85, margin: 0, fontSize: '0.95rem', fontWeight: 400 }}>
            OPD Nursing Portal — manage doctor consultation queues and patient triage.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: <Users size={24}/>, label: 'Total Patients Today', value: loading ? null : appts.length, color: '#0F172A', bg: '#F1F5F9' },
          { icon: <Clock size={24}/>, label: 'Waiting in Queue', value: loading ? null : waitingCount, color: '#0369A1', bg: '#E0F2FE' },
          { icon: <Stethoscope size={24}/>, label: 'Currently in Triage', value: loading ? null : inTriageCount, color: '#A16207', bg: '#FEF08A' },
          { icon: <CheckCircle size={24}/>, label: 'Ready for Doctor', value: loading ? null : readyCount, color: '#047857', bg: '#D1FAE5' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 16, padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                {s.value === null ? <div style={{ width: 40, height: 26, background: '#F1F5F9', borderRadius: 6, animation: 'shimmer 1.5s infinite' }} /> : s.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Queue Management */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="#0EA5E9" />
          OPD Live Queue
        </h2>
        <button onClick={loadQueue} style={{ background: 'transparent', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4].map((i) => <div key={i} style={{ height: 64, background: '#F8FAFC', borderRadius: 10, animation: 'shimmer 1.5s infinite' }} />)}
          </div>
        ) : todayActive.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748B' }}>
            <CheckCircle size={48} color="#94A3B8" style={{ marginBottom: '1rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.25rem' }}>Queue is clear!</div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>There are no active patients waiting in the queue today.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', width: '80px' }}>Token</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', width: '120px' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {todayActive
                .sort((a, b) => (a.queueNumber ?? 999) - (b.queueNumber ?? 999))
                .map((a, i) => {
                const conf = STATUS_COLOR[a.status] || STATUS_COLOR.pending;
                return (
                  <tr key={a._id} style={{ borderBottom: i < todayActive.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'background 0.2s', background: a.status === 'started' ? '#FEFCE8' : 'white' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: a.status === 'started' ? '#CA8A04' : '#F1F5F9', color: a.status === 'started' ? 'white' : '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', border: `1px solid ${a.status === 'started' ? '#CA8A04' : '#E2E8F0'}` }}>
                        {a.queueNumber ?? '-'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.95rem' }}>{a.patient?.name}</div>
                      {a.patient?.phone && (
                        <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                          <PhoneCall size={12} /> {a.patient.phone}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem' }}>Dr. {a.doctor?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.1rem' }}>{a.timeSlot}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ display: 'inline-flex', padding: '0.3rem 0.75rem', borderRadius: 9999, background: conf.bg, color: conf.text, border: `1px solid ${conf.border}`, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {conf.label}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {['pending', 'confirmed'].includes(a.status) && (
                        <button 
                          disabled={updatingId === a._id}
                          onClick={() => updateStatus(a._id, 'started')}
                          style={{ background: '#0EA5E9', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)' }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#0284C7'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#0EA5E9'}
                        >
                          Call Patient
                        </button>
                      )}
                      {a.status === 'started' && (
                        <button 
                          disabled={updatingId === a._id}
                          onClick={() => updateStatus(a._id, 'ready')}
                          style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                          onMouseOut={(e) => e.currentTarget.style.background = '#10B981'}
                        >
                          Finish Triage
                        </button>
                      )}
                      {a.status === 'ready' && (
                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>Waiting for Dr.</span>
                      )}
                      {a.status === 'in' && (
                        <span style={{ fontSize: '0.8rem', color: '#4338CA', fontWeight: 500 }}>In Consultation</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0% { background-color: #F8FAFC; } 50% { background-color: #F1F5F9; } 100% { background-color: #F8FAFC; } }
      `}</style>
    </div>
  );
}
