'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ScanLine, AlertTriangle, CheckCircle, XCircle, User,
  Stethoscope, Pill, Calendar, Loader,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PharmacyScanPage() {
  const { token } = useAuth();
  const [qrToken, setQrToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redeem = async () => {
    if (!qrToken.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API}/api/pharmacy/redeem`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: qrToken.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data.data);
    } catch (e: any) {
      setError(e.message || 'Redemption failed. Check the QR token and try again.');
    } finally { setLoading(false); }
  };

  const isSafe = result && (result.drugCheck?.safe !== false);
  const hasWarnings = result?.drugCheck?.interactions?.length > 0 || result?.drugCheck?.allergyWarnings?.length > 0;

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 700 }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FDF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-accent-pharmacy)' }}>
            <ScanLine size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--cl-ink)', margin: 0 }}>
            Scan prescription
          </h1>
        </div>
        <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
          Enter the patient's QR token to verify and dispense their prescription. Drug interactions are checked automatically.
        </p>
      </div>

      {/* QR Input area — styled as scanner viewfinder */}
      <div
        className="cl-card cl-card--pharmacy"
        style={{ marginBottom: '1.25rem', padding: '1.5rem' }}
      >
        {/* Viewfinder frame */}
        <div
          style={{
            position: 'relative',
            background: '#0a0a0a',
            borderRadius: 10,
            padding: '2rem',
            marginBottom: '1.25rem',
            minHeight: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          role="img"
          aria-label="QR code scanner viewfinder"
        >
          {/* Corner brackets */}
          <div className="qr-corner qr-corner--tl" />
          <div className="qr-corner qr-corner--tr" />
          <div className="qr-corner qr-corner--bl" />
          <div className="qr-corner qr-corner--br" />

          <div style={{ textAlign: 'center' }}>
            <ScanLine size={40} strokeWidth={1.5} color="var(--cl-accent-pharmacy)" style={{ marginBottom: '0.625rem', opacity: 0.8 }} aria-hidden="true" />
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8125rem', fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Point camera at QR code or enter token below
            </p>
          </div>
        </div>

        <label className="label" htmlFor="qr-token-input" style={{ marginBottom: '0.5rem' }}>
          Prescription QR token
        </label>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <input
            id="qr-token-input"
            className="input"
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value.toUpperCase())}
            placeholder="e.g. A3F9D2B1C7E4"
            onKeyDown={(e) => { if (e.key === 'Enter') redeem(); }}
            aria-label="Enter QR token from patient's prescription"
            style={{ fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.08em', fontWeight: 600 }}
          />
          <button
            className="btn"
            onClick={redeem}
            disabled={loading || !qrToken.trim()}
            aria-label="Redeem prescription"
            style={{
              background: 'var(--cl-accent-pharmacy)',
              color: '#fff',
              border: 'none',
              flexShrink: 0,
            }}
          >
            {loading
              ? <Loader size={15} strokeWidth={2} style={{ animation: 'spin 0.9s linear infinite' }} aria-hidden="true" />
              : <ScanLine size={15} strokeWidth={2} aria-hidden="true" />}
            {loading ? 'Verifying…' : 'Redeem'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" style={{ background: 'var(--cl-status-emergency-bg)', border: '1px solid var(--cl-status-emergency-border)', borderRadius: 8, padding: '0.875rem 1rem', color: 'var(--cl-status-emergency)', fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-fade-in">
          {/* Drug interaction result — prominent */}
          <div
            role="alert"
            aria-live="assertive"
            style={{
              background: isSafe && !hasWarnings ? 'var(--cl-status-low-bg)' : 'var(--cl-status-emergency-bg)',
              border: `2px solid ${isSafe && !hasWarnings ? 'var(--cl-status-low-border)' : 'var(--cl-status-emergency-border)'}`,
              borderRadius: 10,
              padding: '1.25rem 1.5rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {isSafe && !hasWarnings ? (
              <CheckCircle size={36} strokeWidth={2} color="var(--cl-status-low)" aria-hidden="true" />
            ) : (
              <XCircle size={36} strokeWidth={2} color="var(--cl-status-emergency)" aria-hidden="true" />
            )}
            <div>
              <div
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: isSafe && !hasWarnings ? 'var(--cl-status-low)' : 'var(--cl-status-emergency)',
                  letterSpacing: '0.02em',
                  marginBottom: '0.25rem',
                }}
              >
                {isSafe && !hasWarnings ? '✓ Safe to dispense' : '✗ DO NOT DISPENSE'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: isSafe && !hasWarnings ? '#1A6B2A' : '#7A2020' }}>
                {isSafe && !hasWarnings
                  ? 'No drug interactions or allergy conflicts detected.'
                  : 'Drug interaction or allergy conflict detected. Review warnings below before dispensing.'}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {hasWarnings && (
            <div className="cl-card cl-card--emergency" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
              <div className="label" style={{ marginBottom: '0.625rem', color: 'var(--cl-status-emergency)' }}>Interaction warnings</div>
              {result.drugCheck.interactions?.map((w: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', fontSize: '0.875rem', color: 'var(--cl-ink-2)' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--cl-status-emergency)' }} aria-hidden="true" />
                  {w}
                </div>
              ))}
              {result.drugCheck.allergyWarnings?.map((w: string, i: number) => (
                <div key={'a' + i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', fontSize: '0.875rem', color: 'var(--cl-ink-2)' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--cl-status-soon)' }} aria-hidden="true" />
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* Prescription details */}
          {result.prescription && (
            <div className="cl-card cl-card--pharmacy" style={{ padding: '1.25rem' }}>
              <div className="label" style={{ marginBottom: '0.875rem' }}>Prescription details</div>
              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cl-muted)', display: 'flex', gap: 4, marginBottom: '0.2rem' }}>
                    <User size={12} aria-hidden="true" /> Patient
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--cl-ink)' }}>{result.prescription.patient?.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cl-muted)', display: 'flex', gap: 4, marginBottom: '0.2rem' }}>
                    <Stethoscope size={12} aria-hidden="true" /> Prescribed by
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--cl-ink)' }}>{result.prescription.doctor?.name}</div>
                </div>
                {result.prescription.createdAt && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cl-muted)', display: 'flex', gap: 4, marginBottom: '0.2rem' }}>
                      <Calendar size={12} aria-hidden="true" /> Date issued
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--cl-ink-2)' }}>{new Date(result.prescription.createdAt).toLocaleDateString('en-LK')}</div>
                  </div>
                )}
              </div>

              {result.prescription.medicines?.length > 0 && (
                <div>
                  <div className="label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Pill size={12} aria-hidden="true" /> Medicines
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.prescription.medicines.map((m: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.625rem 0.875rem',
                          background: 'var(--cl-surface-2)',
                          borderRadius: 8,
                          border: '1px solid var(--cl-border)',
                          fontSize: '0.875rem',
                          flexWrap: 'wrap',
                          gap: '0.375rem',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--cl-ink)' }}>{m.name}</span>
                        <span style={{ color: 'var(--cl-muted)' }}>{m.dosage}{m.frequency ? ` · ${m.frequency}` : ''}{m.duration ? ` · ${m.duration}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '1rem' }}
            onClick={() => { setResult(null); setQrToken(''); setError(''); }}
          >
            <ScanLine size={14} strokeWidth={2} aria-hidden="true" /> Scan another prescription
          </button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
