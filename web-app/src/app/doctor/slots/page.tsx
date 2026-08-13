'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Slot {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  consultType: string;
  type: string;
  repeat?: string;
  notes?: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const REPEAT_OPTIONS = ['none', 'weekly', 'daily'];
const CONSULT_TYPES = ['Physical', 'Online', 'Both'];

const emptyForm = { day: 'Mon', startTime: '09:00', endTime: '17:00', maxPatients: 1, consultType: 'Physical', repeat: 'weekly', notes: '' };

export default function DoctorSlotsPage() {
  const { token } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`${API}/api/doctor/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setSlots(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (token) load(); }, [token]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/doctor/schedule`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to save slot');
    } finally {
      setSaving(false);
    }
  };

  const deleteSlot = async (id: string) => {
    if (!confirm('Delete this slot?')) return;
    setDeletingId(id);
    try {
      await fetch(`${API}/api/doctor/schedule/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSlots((prev) => prev.filter((s) => s._id !== id));
    } catch {
      alert('Failed to delete slot');
    } finally {
      setDeletingId(null);
    }
  };

  // Group by day
  const byDay: Record<string, Slot[]> = {};
  slots.forEach((s) => {
    const key = s.repeat === 'daily' ? 'Daily' : s.day;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(s);
  });

  const dayOrder = [...DAYS, 'Daily'];
  const sortedKeys = Object.keys(byDay).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#E0F2FE', color: '#0369A1', padding: '0.35rem 1rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
            📅 MY SCHEDULE
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#1A0A3C', margin: '0 0 0.3rem' }}>
            Availability Slots
          </h1>
          <p style={{ color: '#6D5A9E', fontSize: '0.9rem', margin: 0 }}>
            Configure your weekly schedule — patients book into these slots.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(''); setForm(emptyForm); }}
          style={{ padding: '0.75rem 1.5rem', borderRadius: 12, background: 'linear-gradient(135deg, #0C4A6E, #0369A1)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(3,105,161,0.35)' }}
        >
          + Add Slot
        </button>
      </div>

      {/* Add Slot Form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #BAE6FD', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(3,105,161,0.1)' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#1A0A3C', margin: '0 0 1.25rem', fontSize: '1.1rem' }}>
            New Availability Slot
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Repeat</label>
              <select value={form.repeat} onChange={(e) => setForm({ ...form, repeat: e.target.value })} style={selectStyle}>
                {REPEAT_OPTIONS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            {form.repeat !== 'daily' && (
              <div>
                <label style={labelStyle}>{form.repeat === 'none' ? 'Date (YYYY-MM-DD)' : 'Day of Week'}</label>
                {form.repeat === 'weekly' ? (
                  <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} style={selectStyle}>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <input type="date" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} style={inputStyle} />
                )}
              </div>
            )}
            <div>
              <label style={labelStyle}>Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Max Patients</label>
              <input type="number" min={1} max={50} value={form.maxPatients} onChange={(e) => setForm({ ...form, maxPatients: Number(e.target.value) })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Consult Type</label>
              <select value={form.consultType} onChange={(e) => setForm({ ...form, consultType: e.target.value })} style={selectStyle}>
                {CONSULT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Notes (optional)</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. New patient consultations only" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          </div>
          {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '0.75rem 1rem', color: '#991B1B', fontSize: '0.82rem', marginBottom: '1rem' }}>⚠️ {error}</div>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={save} disabled={saving} style={{ padding: '0.75rem 1.75rem', borderRadius: 12, background: saving ? '#7DD3FC' : 'linear-gradient(135deg, #0C4A6E, #0369A1)', color: 'white', border: 'none', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? '⏳ Saving...' : '✓ Save Slot'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.75rem 1.25rem', borderRadius: 12, background: '#F9F7FF', color: '#6D5A9E', border: '1.5px solid #E9E5F8', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slots Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 140, background: '#F0F9FF', borderRadius: 16, animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 20, padding: '4rem', textAlign: 'center', border: '2px dashed #BAE6FD', color: '#8B7EAA' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <div style={{ fontWeight: 700, color: '#1A0A3C', marginBottom: '0.4rem' }}>No slots configured</div>
          <div style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Add your first availability slot so patients can start booking.</div>
          <button onClick={() => setShowForm(true)} style={{ padding: '0.75rem 1.75rem', borderRadius: 12, background: 'linear-gradient(135deg, #0C4A6E, #0369A1)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            + Add Your First Slot
          </button>
        </div>
      ) : (
        <div>
          {sortedKeys.map((day) => (
            <div key={day} style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{ height: 1, flex: 1, background: '#E9E5F8' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8B7EAA', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {day === 'Daily' ? '🔄 Repeats Daily' : `📅 ${day}`}
                </span>
                <div style={{ height: 1, flex: 1, background: '#E9E5F8' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
                {byDay[day].map((slot) => (
                  <div key={slot._id || slot.id} style={{ background: 'white', borderRadius: 16, padding: '1.25rem', border: '1.5px solid #E0F2FE', boxShadow: '0 1px 4px rgba(3,105,161,0.06)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#0C4A6E' }}>
                          {slot.startTime} – {slot.endTime}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#6D5A9E', marginTop: '0.2rem' }}>
                          Max {slot.maxPatients} patient{slot.maxPatients !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, background: slot.consultType === 'Online' ? '#E0F2FE' : slot.consultType === 'Both' ? '#EDE9FE' : '#D1FAE5', color: slot.consultType === 'Online' ? '#0369A1' : slot.consultType === 'Both' ? '#7B2FF7' : '#065F46' }}>
                        {slot.consultType}
                      </span>
                    </div>
                    {slot.notes && (
                      <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#8B7EAA', fontStyle: 'italic' }}>
                        {slot.notes}
                      </div>
                    )}
                    <button
                      onClick={() => deleteSlot(slot._id || slot.id)}
                      disabled={deletingId === (slot._id || slot.id)}
                      style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: 28, height: 28, borderRadius: 8, background: '#FEE2E2', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0% { background-color: #F0F9FF; } 50% { background-color: #E0F2FE; } 100% { background-color: #F0F9FF; } }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6D5A9E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #E9E5F8', borderRadius: 10, background: '#FAFAFA', color: '#1A0A3C', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const selectStyle: React.CSSProperties = { width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #E9E5F8', borderRadius: 10, background: '#FAFAFA', color: '#1A0A3C', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' };
