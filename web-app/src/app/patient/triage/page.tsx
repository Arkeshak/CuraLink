'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Camera, Upload, X, AlertTriangle, Clock } from 'lucide-react';
import { UrgencyGauge } from '@/components/ui/UrgencyBadge';
import type { UrgencyLevel } from '@/components/ui/UrgencyBadge';
import PulseLine from '@/components/ui/PulseLine';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TriageResult {
  urgencyFlag: UrgencyLevel;
  urgencyScore: number;
  observations: string[];
  possibleConditions?: string[];
  recommendedSpecialist: string;
  modelResult: string;
  disclaimer: string;
  scanId: string;
}

export default function TriagePage() {
  const { token } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file (JPG, PNG, WEBP).'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null); setError('');
  };

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { setError('Camera access denied. Use file upload instead.'); setShowCamera(false); }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const { videoWidth: w, videoHeight: h } = videoRef.current;
    canvasRef.current.width = w; canvasRef.current.height = h;
    canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0, w, h);
    canvasRef.current.toBlob((blob) => {
      if (blob) { handleFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' })); }
    }, 'image/jpeg', 0.92);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setShowCamera(false);
  }, []);

  const scan = async () => {
    if (!imageFile || !token) return;
    setScanning(true); setError('');
    const form = new FormData();
    form.append('image', imageFile);
    try {
      const res = await fetch(`${API}/api/triage/scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data.data);
    } catch (e: any) {
      setError(e.message || 'Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: '#FFF3ED', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--cl-status-soon)',
            }}
          >
            <Camera size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <h1
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '1.375rem', fontWeight: 600, color: 'var(--cl-ink)', margin: 0,
            }}
          >
            Visual triage
          </h1>
        </div>
        <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
          Upload or photograph a visible symptom to get an AI urgency assessment. This is not a medical diagnosis.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="ai-disclaimer" style={{ marginBottom: '1.25rem' }} role="note">
        <AlertTriangle size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
        <span>
          <strong>AI-assisted triage only.</strong> This tool uses visual pattern recognition to estimate urgency. It cannot replace a clinical examination. If you believe you are having a medical emergency, call emergency services immediately.
        </span>
      </div>

      {/* Upload zone or camera */}
      {!imagePreview && (
        <div style={{ marginBottom: '1.25rem' }}>
          {showCamera ? (
            <div style={{ position: 'relative', background: '#000', borderRadius: 10, overflow: 'hidden', marginBottom: '0.75rem' }}>
              {/* Viewfinder corners */}
              <div className="qr-corner qr-corner--tl" />
              <div className="qr-corner qr-corner--tr" />
              <div className="qr-corner qr-corner--bl" />
              <div className="qr-corner qr-corner--br" />
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', maxHeight: 380, display: 'block' }}
                aria-label="Camera preview"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={capturePhoto}>
                  <Camera size={15} strokeWidth={2} aria-hidden="true" /> Capture photo
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); setShowCamera(false); }}
                >
                  <X size={15} strokeWidth={2} aria-hidden="true" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`upload-zone${dragOver ? ' drag-over' : ''}`}
              tabIndex={0}
              role="button"
              aria-label="Upload symptom image"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            >
              <Upload size={36} strokeWidth={1.5} color="var(--cl-teal)" style={{ marginBottom: '0.875rem' }} aria-hidden="true" />
              <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, color: 'var(--cl-ink)', fontSize: '0.9375rem', marginBottom: '0.375rem' }}>
                Drop an image here, or click to browse
              </p>
              <p style={{ color: 'var(--cl-muted)', fontSize: '0.8125rem' }}>
                JPG, PNG, WEBP supported
              </p>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {!showCamera && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={openCamera}
              style={{ marginTop: '0.625rem' }}
            >
              <Camera size={14} strokeWidth={2} aria-hidden="true" /> Use camera instead
            </button>
          )}
        </div>
      )}

      {/* Image preview + actions */}
      {imagePreview && !result && (
        <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <img
            src={imagePreview}
            alt="Selected symptom image"
            style={{
              maxWidth: 260, maxHeight: 200,
              borderRadius: 10,
              border: '1px solid var(--cl-border)',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--cl-ink-2)' }}>
              Image ready for analysis. Review it and click scan when ready.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={scan}
                disabled={scanning}
                aria-label="Run visual triage scan"
              >
                {scanning
                  ? <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} aria-hidden="true" />
                  : <Camera size={14} strokeWidth={2} aria-hidden="true" />}
                {scanning ? 'Scanning…' : 'Scan now'}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setImagePreview(null); setImageFile(null); setResult(null); setError(''); }}
                aria-label="Remove selected image"
              >
                <X size={14} strokeWidth={2} aria-hidden="true" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {scanning && <PulseLine label="Analysing image…" />}

      {/* Error */}
      {error && (
        <div role="alert" style={{
          background: 'var(--cl-status-emergency-bg)', border: '1px solid var(--cl-status-emergency-border)',
          borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--cl-status-emergency)',
          fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem',
        }}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-fade-in">
          {/* Re-scan control */}
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: '1.25rem' }}
            onClick={() => { setImagePreview(null); setImageFile(null); setResult(null); }}
            aria-label="Scan another image"
          >
            <Camera size={14} strokeWidth={2} aria-hidden="true" /> Scan another image
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }} className="triage-grid">

            {/* Left — gauge + image */}
            <div>
              <div
                className="cl-card-flat"
                style={{ textAlign: 'center', padding: '1.5rem 1.25rem', marginBottom: '1rem' }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <UrgencyGauge level={result.urgencyFlag} score={result.urgencyScore} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--cl-muted)', marginTop: '0.5rem' }}>
                  Urgency score
                </p>
              </div>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Analysed symptom image"
                  style={{ width: '100%', borderRadius: 10, border: '1px solid var(--cl-border)', objectFit: 'cover', maxHeight: 200 }}
                />
              )}
            </div>

            {/* Right — analysis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Model result */}
              <div className="cl-card cl-card--neutral">
                <div className="label" style={{ marginBottom: '0.5rem' }}>What the AI sees</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--cl-ink-2)', lineHeight: 1.65 }}>{result.modelResult}</p>
              </div>

              {/* Observations */}
              <div className="cl-card cl-card--neutral">
                <div className="label" style={{ marginBottom: '0.5rem' }}>Observations</div>
                <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {result.observations.map((o, i) => (
                    <li key={i} style={{ fontSize: '0.875rem', color: 'var(--cl-ink-2)', lineHeight: 1.55 }}>{o}</li>
                  ))}
                </ol>
              </div>

              {/* Possible Conditions */}
              {result.possibleConditions && result.possibleConditions.length > 0 && (
                <div className="cl-card cl-card--neutral">
                  <div className="label" style={{ marginBottom: '0.5rem' }}>Possible conditions</div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {result.possibleConditions.map((c, i) => (
                      <li key={i} style={{ fontSize: '0.875rem', color: 'var(--cl-ink-2)', lineHeight: 1.55 }}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended specialist */}
              <div
                className="cl-card"
                style={{
                  borderLeftColor: result.urgencyFlag === 'Emergency' ? 'var(--cl-status-emergency)'
                    : result.urgencyFlag === 'See Doctor Soon' ? 'var(--cl-status-soon)'
                    : result.urgencyFlag === 'Monitor' ? 'var(--cl-status-monitor)'
                    : 'var(--cl-status-low)',
                }}
              >
                <div className="label" style={{ marginBottom: '0.375rem' }}>Recommended specialist</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cl-ink)', fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: '0.75rem' }}>
                  {result.recommendedSpecialist}
                </div>
                <Link href="/patient/book-appointment" className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
                  Book appointment →
                </Link>
              </div>

              {/* Disclaimer */}
              <div
                style={{
                  background: 'var(--cl-surface-2)',
                  border: '1px solid var(--cl-border)',
                  borderRadius: 8,
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.75rem',
                  color: 'var(--cl-muted)',
                  display: 'flex',
                  gap: '0.4rem',
                }}
                role="note"
              >
                <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
                {result.disclaimer}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 680px) {
          .triage-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
