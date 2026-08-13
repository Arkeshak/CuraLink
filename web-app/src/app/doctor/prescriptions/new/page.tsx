'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ClipboardPlus, Plus, Trash2, CheckCircle, AlertTriangle, ChevronDown, User, Pill,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Patient { _id: string; name: string; email: string; phone?: string; }
interface Appointment { _id: string; patient: Patient; date: string; timeSlot: string; queueNumber?: number; status: string; }
interface Medicine { name: string; dosage: string; frequency: string; duration: string; notes: string; }

const emptyMed = (): Medicine => ({ name: '', dosage: '', frequency: '', duration: '', notes: '' });
const FREQS = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 8 hours', 'Every 12 hours', 'As needed'];
const DURS = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '3 months', 'Ongoing'];

export default function NewPrescriptionPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([emptyMed()]);
  const [instructions, setInstructions] = useState('');
  const [diagnosisNote, setDiagnosisNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/doctor/appointments/today`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setAppointments(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingAppts(false));
  }, [token]);

  const filteredAppts = appointments.filter((a) =>
    !patientSearch || a.patient?.name?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const addMed = () => setMedicines((m) => [...m, emptyMed()]);
  const removeMed = (i: number) => setMedicines((m) => m.filter((_, idx) => idx !== i));
  const updateMed = (i: number, field: keyof Medicine, val: string) =>
    setMedicines((m) => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med));

  const submit = async () => {
    if (!selectedAppt) { setError('Please select a patient appointment first.'); return; }
    const meds = medicines.filter((m) => m.name.trim());
    if (meds.length === 0) { setError('Please add at least one medicine.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`${API}/api/prescriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppt._id,
          patientId: selectedAppt.patient._id,
          medicines: meds,
          instructions,
          diagnosisNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to create prescription.');
    } finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <div style={{ padding: '1.75rem 1.5rem', maxWidth: 600 }}>
        <div
          className="cl-card cl-card--low animate-fade-in"
          style={{ textAlign: 'center', padding: '2.5rem 2rem' }}
        >
          <CheckCircle size={48} strokeWidth={1.5} color="var(--cl-status-low)" style={{ marginBottom: '1rem' }} aria-hidden="true" />
          <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: '1.25rem', color: 'var(--cl-ink)', marginBottom: '0.5rem' }}>
            Prescription issued
          </h2>
          <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            The QR-coded prescription has been sent to {selectedAppt?.patient.name}.
          </p>
          {success.qrToken && (
            <div
              style={{
                background: 'var(--cl-surface-2)',
                border: '1px solid var(--cl-border)',
                borderRadius: 8,
                padding: '0.75rem 1rem',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--cl-ink)',
                marginBottom: '1.25rem',
              }}
              aria-label={`QR token: ${success.qrToken}`}
            >
              {success.qrToken}
            </div>
          )}
          <button
            className="btn btn-blue"
            onClick={() => { setSuccess(null); setSelectedAppt(null); setMedicines([emptyMed()]); setInstructions(''); setDiagnosisNote(''); }}
          >
            <ClipboardPlus size={15} strokeWidth={2} aria-hidden="true" /> Issue another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.75rem 1.5rem', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--cl-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cl-blue)' }}>
            <ClipboardPlus size={18} strokeWidth={2} aria-hidden="true" />
          </div>
          <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.375rem', fontWeight: 600, color: 'var(--cl-ink)', margin: 0 }}>
            Issue prescription
          </h1>
        </div>
        <p style={{ color: 'var(--cl-muted)', fontSize: '0.875rem' }}>
          Create a QR-coded digital prescription for today's patient.
        </p>
      </div>

      {/* Step 1 — Patient selection */}
      <div className="cl-card cl-card--blue" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
        <div className="label" style={{ marginBottom: '0.5rem' }}>Step 1 — Select patient</div>
        <input
          className="input"
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
          placeholder="Search by patient name…"
          style={{ marginBottom: '0.75rem' }}
          aria-label="Search patient"
        />
        {loadingAppts ? (
          <div className="skeleton" style={{ height: 60 }} aria-hidden="true" />
        ) : filteredAppts.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--cl-muted)' }}>No appointments found for today.</p>
        ) : (
          <div
            style={{
              maxHeight: 220,
              overflowY: 'auto',
              border: '1px solid var(--cl-border)',
              borderRadius: 8,
              background: 'var(--cl-surface)',
            }}
            role="listbox"
            aria-label="Today's appointments"
          >
            {filteredAppts.map((a) => (
              <button
                key={a._id}
                role="option"
                aria-selected={selectedAppt?._id === a._id}
                onClick={() => setSelectedAppt(a)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: selectedAppt?._id === a._id ? 'var(--cl-blue-light)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--cl-border)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: selectedAppt?._id === a._id ? 'var(--cl-blue)' : 'var(--cl-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: selectedAppt?._id === a._id ? '#fff' : 'var(--cl-muted)',
                    fontSize: '0.75rem', fontWeight: 700, fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                  aria-hidden="true"
                >
                  {a.queueNumber ?? <User size={14} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cl-ink)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    {a.patient.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cl-muted)' }}>
                    {a.timeSlot} · {a.patient.email}
                  </div>
                </div>
                {selectedAppt?._id === a._id && (
                  <CheckCircle size={16} strokeWidth={2} color="var(--cl-blue)" style={{ marginLeft: 'auto' }} aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2 — Medicines (ruled-paper card) */}
      <div
        className="cl-card cl-card--blue"
        style={{ marginBottom: '1.25rem', padding: '1.25rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Pill size={13} aria-hidden="true" /> Step 2 — Medicines
          </div>
          <button className="btn btn-ghost btn-sm" onClick={addMed}>
            <Plus size={13} strokeWidth={2} aria-hidden="true" /> Add row
          </button>
        </div>

        {/* Ruled-paper background for medicines section */}
        <div
          className="ruled-paper"
          style={{ borderRadius: 8, padding: '0.5rem', marginBottom: '0.75rem', overflow: 'hidden' }}
        >
          {medicines.map((med, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1.5fr 1.2fr auto',
                gap: '0.5rem',
                alignItems: 'center',
                padding: '0.375rem 0.5rem',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.6)' : 'transparent',
                borderRadius: 6,
                marginBottom: '0.375rem',
              }}
              role="group"
              aria-label={`Medicine row ${i + 1}`}
            >
              <input className="input" value={med.name} onChange={(e) => updateMed(i, 'name', e.target.value)} placeholder="Drug name" aria-label={`Medicine ${i + 1} name`} style={{ fontSize: '0.8125rem' }} />
              <input className="input" value={med.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} placeholder="Dosage" aria-label={`Medicine ${i + 1} dosage`} style={{ fontSize: '0.8125rem' }} />
              <select className="input" value={med.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} aria-label={`Medicine ${i + 1} frequency`} style={{ fontSize: '0.8125rem' }}>
                <option value="">Frequency</option>
                {FREQS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <select className="input" value={med.duration} onChange={(e) => updateMed(i, 'duration', e.target.value)} aria-label={`Medicine ${i + 1} duration`} style={{ fontSize: '0.8125rem' }}>
                <option value="">Duration</option>
                {DURS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <button
                onClick={() => removeMed(i)}
                disabled={medicines.length === 1}
                aria-label={`Remove medicine ${i + 1}`}
                style={{ background: 'none', border: 'none', cursor: medicines.length === 1 ? 'not-allowed' : 'pointer', color: 'var(--cl-subtle)', padding: '0.25rem', display: 'flex' }}
              >
                <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3 — Notes */}
      <div className="cl-card cl-card--blue" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
        <div className="label" style={{ marginBottom: '0.75rem' }}>Step 3 — Notes</div>
        <div style={{ display: 'grid', gap: '0.875rem' }}>
          <div>
            <label className="label" htmlFor="diagnosis-note" style={{ marginBottom: '0.375rem' }}>Diagnosis / clinical note</label>
            <textarea id="diagnosis-note" className="input" rows={3} value={diagnosisNote} onChange={(e) => setDiagnosisNote(e.target.value)} placeholder="Brief diagnosis or clinical observation…" />
          </div>
          <div>
            <label className="label" htmlFor="patient-instructions" style={{ marginBottom: '0.375rem' }}>Instructions for patient</label>
            <textarea id="patient-instructions" className="input" rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Take with food, avoid alcohol…" />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" style={{ background: 'var(--cl-status-emergency-bg)', border: '1px solid var(--cl-status-emergency-border)', borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--cl-status-emergency)', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          className="btn btn-blue"
          onClick={submit}
          disabled={submitting}
          aria-label="Issue prescription"
        >
          {submitting
            ? <span className="animate-spin" style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} aria-hidden="true" />
            : <ClipboardPlus size={15} strokeWidth={2} aria-hidden="true" />}
          {submitting ? 'Issuing…' : 'Issue prescription'}
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--cl-muted)' }}>
          A QR code will be generated automatically.
        </span>
      </div>
    </div>
  );
}
