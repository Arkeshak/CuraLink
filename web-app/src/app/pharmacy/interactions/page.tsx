'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Syringe, Plus, X, AlertTriangle, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import PulseLine from '@/components/ui/PulseLine';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface InteractionResult {
  safe: boolean;
  interactions: string[];
  allergyWarnings: string[];
  checkedAt?: string;
}

const COMMON_DRUGS = [
  'Amoxicillin', 'Aspirin', 'Atorvastatin', 'Lisinopril', 'Metformin',
  'Omeprazole', 'Paracetamol', 'Warfarin', 'Ibuprofen', 'Metoprolol',
  'Simvastatin', 'Ciprofloxacin', 'Diazepam', 'Clopidogrel', 'Amlodipine',
];

export default function PharmacyInteractionsPage() {
  const { token } = useAuth();
  const [drugs, setDrugs] = useState<string[]>(['', '']);
  const [allergies, setAllergies] = useState('');
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Array<{ drugs: string[]; result: InteractionResult; time: string }>>([]);

  const addDrug = () => setDrugs((p) => [...p, '']);
  const removeDrug = (i: number) => setDrugs((p) => p.filter((_, idx) => idx !== i));
  const updateDrug = (i: number, val: string) => setDrugs((p) => p.map((d, idx) => idx === i ? val : d));

  const addQuick = (name: string) => {
    const empty = drugs.findIndex((d) => !d.trim());
    if (empty >= 0) updateDrug(empty, name);
    else setDrugs((p) => [...p, name]);
  };

  const check = async () => {
    const drugList = drugs.filter((d) => d.trim());
    if (drugList.length < 2) { setError('Please enter at least 2 drug names to check for interactions.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API}/api/pharmacy/interactions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: drugList, allergies: allergies.split(',').map(a => a.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const r = data.data;
      setResult(r);
      setHistory((h) => [{ drugs: drugList, result: r, time: new Date().toLocaleTimeString('en-LK') }, ...h.slice(0, 4)]);
    } catch (e: any) {
      setError(e.message || 'Check failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 760 }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FDF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-accent-pharmacy)' }}>
            <Syringe size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--cl-ink)', margin: 0 }}>
            Drug interaction checker
          </h1>
        </div>
        <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
          Enter two or more drug names to check for known interactions and allergy conflicts.
        </p>
      </div>

      {/* Quick add common drugs */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="label" style={{ marginBottom: '0.5rem' }}>Quick add common drugs</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {COMMON_DRUGS.map((d) => (
            <button
              key={d}
              onClick={() => addQuick(d)}
              style={{
                padding: '0.25rem 0.625rem',
                borderRadius: 6,
                border: '1px solid var(--cl-border)',
                background: 'var(--cl-surface)',
                color: 'var(--cl-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cl-teal-light)'; e.currentTarget.style.color = 'var(--cl-teal)'; e.currentTarget.style.borderColor = 'var(--cl-border-strong)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--cl-surface)'; e.currentTarget.style.color = 'var(--cl-muted)'; e.currentTarget.style.borderColor = 'var(--cl-border)'; }}
            >
              + {d}
            </button>
          ))}
        </div>
      </div>

      {/* Drug inputs */}
      <div className="cl-card cl-card--pharmacy" style={{ marginBottom: '1.25rem' }}>
        <div className="label" style={{ marginBottom: '0.75rem' }}>Drugs to check</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {drugs.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--cl-surface-2)', border: '1px solid var(--cl-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--cl-muted)', flexShrink: 0 }} aria-hidden="true">
                {i + 1}
              </span>
              <input
                className="input"
                value={d}
                onChange={(e) => updateDrug(i, e.target.value)}
                placeholder={`Drug ${i + 1} name (e.g. Warfarin)`}
                aria-label={`Drug ${i + 1}`}
                list={`drug-suggestions-${i}`}
              />
              <datalist id={`drug-suggestions-${i}`}>
                {COMMON_DRUGS.map((name) => <option key={name} value={name} />)}
              </datalist>
              {drugs.length > 2 && (
                <button
                  onClick={() => removeDrug(i)}
                  aria-label={`Remove drug ${i + 1}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--cl-subtle)', flexShrink: 0 }}
                >
                  <X size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button className="btn btn-ghost btn-sm" onClick={addDrug} style={{ marginBottom: '1.25rem' }}>
          <Plus size={14} strokeWidth={2} aria-hidden="true" /> Add drug
        </button>

        {/* Allergies */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="label" htmlFor="allergies-input" style={{ marginBottom: '0.375rem' }}>
            Known patient allergies (optional, comma-separated)
          </label>
          <input
            id="allergies-input"
            className="input"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g. Penicillin, Sulfonamides"
          />
        </div>

        {/* Check button */}
        <button
          className="btn"
          onClick={check}
          disabled={loading || drugs.filter((d) => d.trim()).length < 2}
          style={{ background: 'var(--cl-accent-pharmacy)', color: '#fff', border: 'none' }}
          aria-label="Check drug interactions"
        >
          {loading
            ? <Loader size={15} style={{ animation: 'spin 0.9s linear infinite' }} aria-hidden="true" />
            : <Syringe size={15} strokeWidth={2} aria-hidden="true" />}
          {loading ? 'Checking…' : 'Check interactions'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" style={{ background: 'var(--cl-status-emergency-bg)', border: '1px solid var(--cl-status-emergency-border)', borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--cl-status-emergency)', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          {error}
        </div>
      )}

      {loading && <PulseLine label="Checking interactions…" />}

      {/* Result */}
      {result && (
        <div className="animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <div
            role="alert"
            aria-live="assertive"
            style={{
              background: result.safe ? 'var(--cl-status-low-bg)' : 'var(--cl-status-emergency-bg)',
              border: `2px solid ${result.safe ? 'var(--cl-status-low-border)' : 'var(--cl-status-emergency-border)'}`,
              borderRadius: 10,
              padding: '1.25rem 1.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {result.safe
              ? <CheckCircle size={36} strokeWidth={2} color="var(--cl-status-low)" aria-hidden="true" />
              : <XCircle size={36} strokeWidth={2} color="var(--cl-status-emergency)" aria-hidden="true" />}
            <div>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, fontSize: '1.125rem', color: result.safe ? 'var(--cl-status-low)' : 'var(--cl-status-emergency)', marginBottom: '0.25rem' }}>
                {result.safe ? '✓ No significant interactions' : '✗ Interaction detected'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: result.safe ? '#1A6B2A' : '#7A2020' }}>
                {result.safe
                  ? 'The selected drug combination appears safe based on available data.'
                  : 'Review all warnings carefully before dispensing.'}
              </div>
            </div>
          </div>

          {result.interactions.length > 0 && (
            <div className="cl-card cl-card--emergency" style={{ marginBottom: '0.75rem', padding: '1rem 1.25rem' }}>
              <div className="label" style={{ color: 'var(--cl-status-emergency)', marginBottom: '0.5rem' }}>Drug interactions</div>
              {result.interactions.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', fontSize: '0.875rem', color: 'var(--cl-ink-2)' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--cl-status-emergency)' }} aria-hidden="true" />
                  {w}
                </div>
              ))}
            </div>
          )}

          {result.allergyWarnings.length > 0 && (
            <div className="cl-card cl-card--soon" style={{ padding: '1rem 1.25rem' }}>
              <div className="label" style={{ color: 'var(--cl-status-soon)', marginBottom: '0.5rem' }}>Allergy warnings</div>
              {result.allergyWarnings.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', fontSize: '0.875rem', color: 'var(--cl-ink-2)' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--cl-status-soon)' }} aria-hidden="true" />
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <div className="label" style={{ marginBottom: '0.625rem' }}>Recent checks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.map((h, i) => (
              <div
                key={i}
                className="cl-card-flat"
                style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--cl-muted)' }}>
                  <Clock size={12} aria-hidden="true" /> {h.time}
                </span>
                <div style={{ flex: 1, display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {h.drugs.map((d, j) => <span key={j} className="badge badge-neutral">{d}</span>)}
                </div>
                {h.result.safe
                  ? <span className="badge badge-success">Safe</span>
                  : <span className="badge badge-danger">Interaction</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
