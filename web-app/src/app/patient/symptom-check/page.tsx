'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Stethoscope, Mic, MicOff, Send, RotateCcw, Clock, AlertTriangle } from 'lucide-react';
import PulseLine from '@/components/ui/PulseLine';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AnalysisResult {
  aiResponse: string;
  predictedConditions: string[];
  recommendedSpecialist: string;
}

export default function SymptomCheckPage() {
  const { token } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en-LK' | 'si-LK' | 'ta-LK'>('en-LK');
  const recognitionRef = useRef<any>(null);

  const VOICE_LANGS = [
    { code: 'en-LK', label: 'EN', title: 'English' },
    { code: 'si-LK', label: 'සිං', title: 'Sinhala' },
    { code: 'ta-LK', label: 'தமி', title: 'Tamil' },
  ];

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError('Voice input is not supported in this browser. Try Chrome or Edge.'); return; }
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = voiceLang;
    r.onresult = (e: any) => setSymptoms((p) => p ? p + ' ' + e.results[0][0].transcript : e.results[0][0].transcript);
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
    recognitionRef.current = r;
    setListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };

  const analyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${API}/api/ai/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data.data);
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/ai/history`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setHistory(data.data ?? []);
      setShowHistory(true);
    } catch {}
  };

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 960 }}>

      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'var(--cl-teal-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cl-teal)',
            }}
          >
            <Stethoscope size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <h1
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '1.375rem',
              fontWeight: 600,
              color: 'var(--cl-ink)',
              margin: 0,
            }}
          >
            Symptom checker
          </h1>
        </div>
        <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
          Describe your symptoms and get an AI-assisted analysis. This is not a medical diagnosis.
        </p>
      </div>

      {/* AI disclaimer */}
      <div className="ai-disclaimer" style={{ marginBottom: '1.25rem' }} role="note">
        <AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
        <span>
          <strong>Not a substitute for professional advice.</strong>{' '}
          This AI analysis is for informational purposes only. Always consult a qualified healthcare professional for diagnosis and treatment.
        </span>
      </div>

      {/* Input card */}
      <div className="cl-card cl-card--teal" style={{ marginBottom: '1.25rem' }}>
        <label
          className="label"
          htmlFor="symptoms-input"
          style={{ marginBottom: '0.5rem' }}
        >
          Describe your symptoms
        </label>
        <textarea
          id="symptoms-input"
          className="input"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g. I've had a persistent headache for 3 days with mild fever and sensitivity to light…"
          rows={5}
          style={{ resize: 'vertical', marginBottom: '1rem' }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) analyze(); }}
        />

        {/* Controls row */}
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Voice lang select */}
          <div
            style={{
              display: 'flex',
              gap: '2px',
              background: 'var(--cl-surface-2)',
              border: '1px solid var(--cl-border)',
              borderRadius: 8,
              padding: '2px',
            }}
            role="group"
            aria-label="Voice language"
          >
            {VOICE_LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setVoiceLang(l.code as any)}
                title={l.title}
                aria-pressed={voiceLang === l.code}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: 6,
                  border: 'none',
                  background: voiceLang === l.code ? 'var(--cl-teal)' : 'transparent',
                  color: voiceLang === l.code ? '#fff' : 'var(--cl-muted)',
                  fontWeight: voiceLang === l.code ? 700 : 400,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Mic button */}
          <button
            className={`btn ${listening ? 'btn-danger' : 'btn-ghost'}`}
            onClick={listening ? stopListening : startListening}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={listening}
          >
            {listening ? (
              <><MicOff size={15} strokeWidth={2} aria-hidden="true" /> Stop</>
            ) : (
              <><Mic size={15} strokeWidth={2} aria-hidden="true" /> Voice input</>
            )}
            {listening && (
              <span
                aria-hidden="true"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#fff',
                  animation: 'pulse 1s ease infinite',
                  display: 'inline-block',
                }}
              />
            )}
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSymptoms(''); setResult(null); setError(''); }}
            aria-label="Clear input"
            disabled={!symptoms}
          >
            <RotateCcw size={13} strokeWidth={2} aria-hidden="true" /> Clear
          </button>

          <button
            className="btn btn-primary"
            onClick={analyze}
            disabled={loading || !symptoms.trim()}
            style={{ marginLeft: 'auto' }}
            aria-label="Analyse symptoms"
          >
            {loading ? (
              <span className="animate-spin" style={{ display: 'inline-block', width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} aria-hidden="true" />
            ) : (
              <Send size={14} strokeWidth={2} aria-hidden="true" />
            )}
            {loading ? 'Analysing…' : 'Analyse'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            background: 'var(--cl-status-emergency-bg)',
            border: '1px solid var(--cl-status-emergency-border)',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            color: 'var(--cl-status-emergency)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
          {error}
        </div>
      )}

      {/* AI loading */}
      {loading && <PulseLine />}

      {/* Result */}
      {result && (
        <div className="animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <div
            className="cl-card cl-card--teal"
            style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Stethoscope size={16} strokeWidth={2} color="var(--cl-teal)" aria-hidden="true" />
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--cl-teal)',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                AI analysis — not a diagnosis
              </span>
            </div>
            <p
              style={{
                color: 'var(--cl-ink-2)',
                fontSize: '0.875rem',
                lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {result.aiResponse}
            </p>
          </div>

          <div className="grid-2">
            {/* Conditions */}
            <div className="cl-card cl-card--neutral">
              <div className="label" style={{ marginBottom: '0.75rem' }}>Possible conditions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.predictedConditions?.length > 0 ? (
                  result.predictedConditions.map((c, i) => {
                    // Approx confidence: first item highest
                    const confPct = Math.max(30, 90 - i * 18);
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cl-ink)' }}>{c}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--cl-muted)' }}>{confPct}%</span>
                        </div>
                        <div
                          style={{
                            height: 4,
                            background: 'var(--cl-border)',
                            borderRadius: 9999,
                            overflow: 'hidden',
                          }}
                          role="presentation"
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${confPct}%`,
                              background: 'var(--cl-teal)',
                              borderRadius: 9999,
                              transition: 'width 0.6s ease',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>No specific conditions identified.</p>
                )}
              </div>
            </div>

            {/* Specialist callout */}
            <div className="cl-card cl-card--teal">
              <div className="label" style={{ marginBottom: '0.75rem', color: 'var(--cl-teal)' }}>
                Recommended specialist
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Stethoscope size={18} color="var(--cl-teal)" aria-hidden="true" />
                <span
                  style={{
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    color: 'var(--cl-ink)',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  {result.recommendedSpecialist}
                </span>
              </div>
              <a
                href="/patient/book-appointment"
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex' }}
              >
                Book appointment →
              </a>
            </div>
          </div>
        </div>
      )}

      <PulseLine divider />

      {/* History */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={showHistory ? () => setShowHistory(false) : loadHistory}
        aria-expanded={showHistory}
      >
        <Clock size={14} strokeWidth={2} aria-hidden="true" />
        {showHistory ? 'Hide history' : 'View analysis history'}
      </button>

      {showHistory && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {history.length === 0 ? (
            <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>No analysis history yet.</p>
          ) : history.map((h: any) => (
            <div key={h._id} className="cl-card-flat">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--cl-muted)' }}>
                  <Clock size={12} aria-hidden="true" style={{ display: 'inline', marginRight: 3 }} />
                  {new Date(h.createdAt).toLocaleDateString('en-LK')}
                </span>
                <span className="badge badge-teal">{h.recommendedSpecialist}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--cl-ink-2)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                "{h.symptomsProvided?.slice(0, 120)}…"
              </p>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {h.predictedConditions?.map((c: string) => (
                  <span key={c} className="badge badge-neutral">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
      `}</style>
    </div>
  );
}
