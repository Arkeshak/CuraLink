'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface Prescription {
  _id: string;
  doctor: { name: string; specialization?: string };
  patient: { name: string };
  medicines: Medicine[];
  instructions?: string;
  diagnosisNote?: string;
  qrCode?: string;
  qrToken?: string;
  status: string;
  redeemed: boolean;
  redeemedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  issued: { bg: '#EDE9FE', color: '#7B2FF7' },
  redeemed: { bg: '#D1FAE5', color: '#065F46' },
  expired: { bg: '#FEE2E2', color: '#991B1B' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280' },
};

export default function PatientPrescriptionsPage() {
  const { token } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'issued' | 'redeemed'>('all');

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/prescriptions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setPrescriptions(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = prescriptions.filter((p) => filter === 'all' || p.status === filter);

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#FEE2E2', color: '#991B1B', padding: '0.35rem 1rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
          💊 MY PRESCRIPTIONS
        </div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#1A0A3C', margin: '0 0 0.3rem' }}>
          Prescriptions
        </h1>
        <p style={{ color: '#6D5A9E', fontSize: '0.9rem', margin: 0 }}>
          Your digital prescriptions with QR codes for pharmacy redemption.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['all', 'issued', 'redeemed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 9999, fontSize: '0.82rem', fontWeight: 600,
              border: `1.5px solid ${filter === f ? '#EF4444' : '#E9E5F8'}`,
              background: filter === f ? '#EF4444' : 'white',
              color: filter === f ? 'white' : '#6D5A9E',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#8B7EAA', alignSelf: 'center' }}>
          {filtered.length} prescription{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 100, background: '#F5F3FF', borderRadius: 16, animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 20, padding: '3.5rem', textAlign: 'center', border: '1.5px solid #E9E5F8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💊</div>
          <div style={{ fontWeight: 700, color: '#1A0A3C', marginBottom: '0.4rem' }}>No prescriptions yet</div>
          <div style={{ color: '#8B7EAA', fontSize: '0.875rem' }}>Prescriptions issued by your doctor will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((rx) => {
            const statusStyle = STATUS_STYLES[rx.status] ?? STATUS_STYLES.issued;
            const isOpen = expanded === rx._id;
            return (
              <div
                key={rx._id}
                style={{ background: 'white', borderRadius: 20, border: `1.5px solid ${isOpen ? '#EF4444' : '#E9E5F8'}`, overflow: 'hidden', boxShadow: isOpen ? '0 8px 30px rgba(239,68,68,0.1)' : '0 1px 4px rgba(95,15,255,0.06)', transition: 'all 0.2s' }}
              >
                {/* Card header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : rx._id)}
                  style={{ width: '100%', padding: '1.25rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    💊
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#1A0A3C', fontSize: '0.95rem' }}>
                        Dr. {rx.doctor?.name}
                      </span>
                      {rx.doctor?.specialization && (
                        <span style={{ fontSize: '0.75rem', color: '#7B2FF7', fontWeight: 600 }}>{rx.doctor.specialization}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#8B7EAA', marginTop: '0.15rem' }}>
                      {rx.medicines.length} medicine{rx.medicines.length !== 1 ? 's' : ''} · {new Date(rx.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color, textTransform: 'capitalize' }}>
                      {rx.status}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#8B7EAA', transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #F3F0FF', padding: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: rx.qrCode ? '1fr auto' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
                      <div>
                        {/* Medicines */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8B7EAA', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Medicines</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {rx.medicines.map((m, i) => (
                              <div key={i} style={{ background: '#F9F7FF', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#1A0A3C', fontSize: '0.9rem' }}>{m.name}</div>
                                  {m.notes && <div style={{ fontSize: '0.75rem', color: '#8B7EAA', marginTop: '0.15rem' }}>{m.notes}</div>}
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <div style={{ fontSize: '0.78rem', color: '#6D5A9E', fontWeight: 600 }}>{m.dosage}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#8B7EAA' }}>{m.frequency} · {m.duration}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Instructions */}
                        {rx.instructions && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8B7EAA', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Instructions</div>
                            <div style={{ fontSize: '0.875rem', color: '#1A0A3C', background: '#FFF7ED', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #FED7AA' }}>
                              {rx.instructions}
                            </div>
                          </div>
                        )}

                        {/* QR Token */}
                        {rx.qrToken && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F0FDF4', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #BBF7D0' }}>
                            <span style={{ fontSize: '1.2rem' }}>📲</span>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>QR Token</div>
                              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#065F46', letterSpacing: '0.1em', fontSize: '0.95rem' }}>{rx.qrToken}</div>
                            </div>
                          </div>
                        )}

                        {/* Redeemed info */}
                        {rx.redeemed && rx.redeemedAt && (
                          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#065F46', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            ✅ Dispensed on {new Date(rx.redeemedAt).toLocaleDateString('en-LK')}
                          </div>
                        )}
                      </div>

                      {/* QR Code image */}
                      {rx.qrCode && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ background: 'white', border: '2px solid #E9E5F8', borderRadius: 12, padding: '0.75rem', display: 'inline-block' }}>
                            <img src={rx.qrCode} alt="Prescription QR" style={{ width: 120, height: 120, display: 'block' }} />
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#8B7EAA', marginTop: '0.5rem' }}>Show at pharmacy</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-color: #F5F3FF; }
          50% { background-color: #EDE9FE; }
          100% { background-color: #F5F3FF; }
        }
      `}</style>
    </div>
  );
}
