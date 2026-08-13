'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  FileText, Upload, CheckCircle, AlertCircle, Clock, Loader,
  MessageSquare, Send, Trash2, AlertTriangle, BookOpen,
} from 'lucide-react';
import PulseLine from '@/components/ui/PulseLine';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Report {
  _id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  uploadedAt: string;
  mimeType: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  sources?: { reportName: string; excerpt: string }[];
}

const STATUS_CONFIG = {
  pending:    { Icon: Clock,        label: 'Pending',    color: 'var(--cl-status-monitor)', bg: 'var(--cl-status-monitor-bg)' },
  processing: { Icon: Loader,       label: 'Processing', color: 'var(--cl-teal)',            bg: 'var(--cl-teal-light)' },
  ready:      { Icon: CheckCircle,  label: 'Ready',      color: 'var(--cl-status-low)',      bg: 'var(--cl-status-low-bg)' },
  failed:     { Icon: AlertCircle,  label: 'Failed',     color: 'var(--cl-status-emergency)', bg: 'var(--cl-status-emergency-bg)' },
};

export default function MyReportsPage() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [askingAI, setAskingAI] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const headers = { Authorization: `Bearer ${token}` };

  const loadReports = useCallback(async () => {
    if (!token) return;
    setLoadingReports(true);
    try {
      const res = await fetch(`${API}/api/reports`, { headers });
      const data = await res.json();
      setReports(data.data ?? []);
    } catch {}
    finally { setLoadingReports(false); }
  }, [token]);

  useEffect(() => { loadReports(); }, [loadReports]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const uploadFile = async (file: File) => {
    setError(''); setUploading(true);
    const form = new FormData();
    form.append('report', file);
    try {
      const res = await fetch(`${API}/api/reports/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await loadReports();
    } catch (e: any) {
      setError(e.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  const askAI = async () => {
    if (!question.trim() || !selectedReport) return;
    const q = question.trim();
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setQuestion(''); setAskingAI(true);
    try {
      const res = await fetch(`${API}/api/reports/${selectedReport._id}/ask`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessages((m) => [...m, {
        role: 'ai',
        content: data.data.answer,
        sources: data.data.sources,
      }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'ai', content: `Error: ${e.message}` }]);
    } finally { setAskingAI(false); }
  };

  const deleteReport = async (id: string) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    try {
      await fetch(`${API}/api/reports/${id}`, { method: 'DELETE', headers });
      setReports((r) => r.filter((x) => x._id !== id));
      if (selectedReport?._id === id) { setSelectedReport(null); setMessages([]); }
    } catch {}
  };

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EBFBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-status-low)' }}>
            <BookOpen size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--cl-ink)', margin: 0 }}>
            My reports
          </h1>
        </div>
        <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
          Upload lab reports and ask plain-language questions using AI. Sources are cited in every answer.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.25rem', alignItems: 'start' }} className="reports-grid">

        {/* Left — upload + report list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Upload zone */}
          <div
            className={`upload-zone${dragOver ? ' drag-over' : ''}`}
            style={{ padding: '1.5rem 1.25rem', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
            tabIndex={0}
            role="button"
            aria-label="Upload a lab report"
            aria-disabled={uploading}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          >
            {uploading ? (
              <Loader size={28} strokeWidth={1.5} color="var(--cl-teal)" style={{ animation: 'spin 0.9s linear infinite', marginBottom: '0.5rem' }} aria-hidden="true" />
            ) : (
              <Upload size={28} strokeWidth={1.5} color="var(--cl-teal)" style={{ marginBottom: '0.5rem' }} aria-hidden="true" />
            )}
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cl-ink)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {uploading ? 'Uploading…' : 'Drop a PDF or image'}
            </p>
            <p style={{ color: 'var(--cl-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              PDF, JPG, PNG supported
            </p>
            <input ref={fileInputRef} type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
          </div>

          {/* Error */}
          {error && (
            <div role="alert" style={{ background: 'var(--cl-status-emergency-bg)', border: '1px solid var(--cl-status-emergency-border)', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'var(--cl-status-emergency)', display: 'flex', gap: '0.4rem' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Report list */}
          <div>
            <div className="label" style={{ marginBottom: '0.5rem' }}>Your reports ({reports.length})</div>
            {loadingReports ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 56, marginBottom: '0.5rem' }} aria-hidden="true" />)
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--cl-muted)', fontSize: '0.875rem', border: '1px dashed var(--cl-border)', borderRadius: 10 }}>
                <FileText size={28} strokeWidth={1.5} style={{ marginBottom: '0.5rem', color: 'var(--cl-subtle)' }} aria-hidden="true" />
                <p>No reports uploaded yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {reports.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
                  const isSelected = selectedReport?._id === r._id;
                  return (
                    <div
                      key={r._id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => { if (r.status === 'ready') { setSelectedReport(r); setMessages([]); } }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { if (r.status === 'ready') { setSelectedReport(r); setMessages([]); } } }}
                      style={{
                        background: isSelected ? 'var(--cl-teal-light)' : 'var(--cl-surface)',
                        border: `1px solid ${isSelected ? 'var(--cl-border-strong)' : 'var(--cl-border)'}`,
                        borderLeft: `4px solid ${isSelected ? 'var(--cl-teal)' : cfg.color}`,
                        borderRadius: 10,
                        padding: '0.75rem 0.875rem',
                        cursor: r.status === 'ready' ? 'pointer' : 'default',
                        transition: 'background 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                      }}
                    >
                      <FileText size={16} strokeWidth={2} color={cfg.color} aria-hidden="true" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cl-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.fileName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.15rem' }}>
                          <cfg.Icon size={11} strokeWidth={2} color={cfg.color} aria-hidden="true"
                            style={r.status === 'processing' ? { animation: 'spin 0.9s linear infinite' } : {}} />
                          <span style={{ fontSize: '0.72rem', color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteReport(r._id); }}
                        aria-label={`Delete ${r.fileName}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--cl-subtle)', borderRadius: 6, display: 'flex' }}
                      >
                        <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right — Q&A chat */}
        <div className="cl-card-flat" style={{ display: 'flex', flexDirection: 'column', height: '70vh', padding: 0, overflow: 'hidden' }}>
          {/* Chat header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--cl-border)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <MessageSquare size={17} strokeWidth={2} color="var(--cl-teal)" aria-hidden="true" />
            <div>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '0.9rem', color: 'var(--cl-ink)' }}>
                {selectedReport ? `Q&A — ${selectedReport.fileName}` : 'Report Q&A'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--cl-muted)' }}>
                {selectedReport ? 'Ask a question about this report' : 'Select a ready report from the list to begin'}
              </div>
            </div>
          </div>

          {/* Chat body */}
          <div
            role="log"
            aria-label="AI chat history"
            aria-live="polite"
            style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {messages.length === 0 && !askingAI && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-muted)', textAlign: 'center', gap: '0.5rem', padding: '2rem' }}>
                <MessageSquare size={36} strokeWidth={1.5} color="var(--cl-subtle)" aria-hidden="true" />
                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {selectedReport ? 'Ask any question about your report' : 'Select a report to start'}
                </p>
                <p style={{ fontSize: '0.8rem' }}>
                  e.g. "What does my ALT level mean?" or "Are my cholesterol values normal?"
                </p>
                <div className="ai-disclaimer" style={{ marginTop: '0.5rem', textAlign: 'left' }} role="note">
                  <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                  <span>AI answers are for informational purposes only, not medical advice.</span>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  {msg.content}
                </div>
                {/* Source citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                    {msg.sources.map((s, si) => (
                      <span
                        key={si}
                        className="citation-chip"
                        title={s.excerpt}
                        aria-label={`Source ${si + 1}: ${s.reportName}`}
                      >
                        {si + 1}
                      </span>
                    ))}
                    <span style={{ fontSize: '0.7rem', color: 'var(--cl-muted)', alignSelf: 'center' }}>
                      {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''} cited
                    </span>
                  </div>
                )}
              </div>
            ))}

            {askingAI && <PulseLine label="Reading your report…" />}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--cl-border)', display: 'flex', gap: '0.5rem' }}>
            <input
              className="input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={selectedReport ? 'Ask a question about this report…' : 'Select a report first'}
              disabled={!selectedReport || askingAI}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI(); } }}
              aria-label="Your question about the report"
            />
            <button
              className="btn btn-primary"
              onClick={askAI}
              disabled={!selectedReport || askingAI || !question.trim()}
              aria-label="Send question"
              style={{ flexShrink: 0 }}
            >
              <Send size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .reports-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 360px) { .reports-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
