'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
  hospital?: string;
  consultationFee?: number;
  experienceYears?: number;
  bio?: string;
  photo?: string;
}

interface Slot {
  _id?: string;
  id?: string;
  day: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  consultType?: string;
  repeat?: string;
}

const SPECIALTIES = [
  'All', 'General Practitioner', 'Cardiologist', 'Dermatologist',
  'Neurologist', 'Orthopedic', 'Gynecologist', 'Pediatrician',
  'Psychiatrist', 'Radiologist', 'ENT Specialist',
];

function getDatesForSlot(slot: Slot, count = 14): string[] {
  const dates: string[] = [];
  const today = new Date();
  const days: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  if (slot.repeat === 'daily') {
    for (let i = 0; i < count; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
  } else if (slot.repeat === 'weekly' || days[slot.day] !== undefined) {
    const targetDay = days[slot.day];
    for (let i = 0; i <= 28; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      if (d.getDay() === targetDay) {
        dates.push(d.toISOString().split('T')[0]);
        if (dates.length >= 4) break;
      }
    }
  } else {
    // specific date like "2026-08-10"
    if (slot.day && slot.day.includes('-')) {
      const d = new Date(slot.day);
      if (d >= today) dates.push(slot.day);
    }
  }
  return dates;
}

export default function BookAppointmentPage() {
  const { token } = useAuth();
  const [specialty, setSpecialty] = useState('All');
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (specialty !== 'All') params.set('specialty', specialty);
    if (search) params.set('search', search);
    fetch(`${API}/api/doctor?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setDoctors(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [specialty, search, token]);

  const selectDoctor = async (doc: Doctor) => {
    setSelectedDoctor(doc);
    setSelectedSlot(null);
    setSelectedDate('');
    setSuccess(false);
    setError('');
    setSlotsLoading(true);
    try {
      const res = await fetch(`${API}/api/doctor/${doc._id}/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSlots(data.data ?? []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot || !selectedDate) return;
    setBooking(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/appointments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor: selectedDoctor._id,
          date: selectedDate,
          timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
          symptoms,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '2rem 1.5rem', maxWidth: 700 }}>
        <div style={{ background: 'linear-gradient(135deg, #065F46, #047857)', borderRadius: 24, padding: '3rem 2rem', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.75rem', margin: '0 0 0.5rem' }}>
            Appointment Booked!
          </h1>
          <p style={{ opacity: 0.8, margin: '0 0 0.5rem' }}>
            Your appointment with <strong>Dr. {selectedDoctor?.name}</strong> on{' '}
            <strong>{selectedDate}</strong> at{' '}
            <strong>{selectedSlot?.startTime} - {selectedSlot?.endTime}</strong> is confirmed.
          </p>
          <p style={{ opacity: 0.65, fontSize: '0.85rem', margin: '0 0 2rem' }}>
            Check your dashboard for status updates.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSuccess(false); setSelectedDoctor(null); setSymptoms(''); setNotes(''); }}
              style={{ padding: '0.75rem 1.75rem', borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Book Another
            </button>
            <a href="/patient/dashboard" style={{ padding: '0.75rem 1.75rem', borderRadius: 12, background: 'white', color: '#065F46', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#EDE9FE', color: '#7B2FF7', padding: '0.35rem 1rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
          📅 BOOK APPOINTMENT
        </div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#1A0A3C', margin: '0 0 0.3rem' }}>
          Find a Doctor
        </h1>
        <p style={{ color: '#6D5A9E', fontSize: '0.9rem', margin: 0 }}>
          Search by specialty or name, then pick an available slot.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDoctor ? '1fr 420px' : '1fr', gap: '2rem' }}>
        {/* Left: Doctor Search */}
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              style={{ flex: 1, minWidth: 200, padding: '0.75rem 1rem', border: '1.5px solid #E9E5F8', borderRadius: 12, background: '#FAFAFA', color: '#1A0A3C', fontSize: '0.9rem', outline: 'none' }}
              onFocus={(e) => { e.target.style.borderColor = '#7B2FF7'; e.target.style.background = 'white'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E9E5F8'; e.target.style.background = '#FAFAFA'; }}
            />
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              style={{ padding: '0.75rem 1rem', border: '1.5px solid #E9E5F8', borderRadius: 12, background: '#FAFAFA', color: '#1A0A3C', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
            >
              {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Doctor Cards */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ height: 160, background: '#F5F3FF', borderRadius: 16, animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 16, padding: '3rem', textAlign: 'center', border: '1.5px solid #E9E5F8', color: '#8B7EAA' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <div style={{ fontWeight: 600, color: '#1A0A3C' }}>No doctors found</div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Try a different specialty or search term.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {doctors.map((doc) => {
                const isSelected = selectedDoctor?._id === doc._id;
                return (
                  <button
                    key={doc._id}
                    onClick={() => selectDoctor(doc)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #7B2FF7 0%, #5F0FFF 100%)' : 'white',
                      border: `2px solid ${isSelected ? '#7B2FF7' : '#E9E5F8'}`,
                      borderRadius: 16, padding: '1.25rem', textAlign: 'left',
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 8px 30px rgba(123,47,247,0.3)' : '0 1px 4px rgba(95,15,255,0.06)',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = '#7B2FF7'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                    onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = '#E9E5F8'; e.currentTarget.style.transform = 'none'; } }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #A855F7, #7B2FF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'white', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                        {doc.photo ? (
                          <img 
                            src={doc.photo.startsWith('http') ? doc.photo : `${API}${doc.photo}`} 
                            alt="" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = doc.name.replace('Dr. ', '')[0]; }}
                          />
                        ) : (
                          doc.name.replace('Dr. ', '')[0]
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: isSelected ? 'white' : '#1A0A3C', fontSize: '0.95rem' }}>{doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}</div>
                        <div style={{ fontSize: '0.78rem', color: isSelected ? 'rgba(255,255,255,0.7)' : '#7B2FF7', fontWeight: 600 }}>{doc.specialization || 'General Practitioner'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
                      {doc.hospital && <span style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : '#6D5A9E' }}>🏥 {doc.hospital}</span>}
                      {doc.consultationFee && <span style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : '#10B981', fontWeight: 600 }}>LKR {doc.consultationFee}</span>}
                    </div>
                    {doc.experienceYears && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: isSelected ? 'rgba(255,255,255,0.6)' : '#8B7EAA' }}>
                        {doc.experienceYears} years experience
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Booking Panel */}
        {selectedDoctor && (
          <div>
            <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #E9E5F8', overflow: 'hidden', boxShadow: '0 4px 20px rgba(95,15,255,0.08)', position: 'sticky', top: '1.5rem' }}>
              {/* Doctor header */}
              <div style={{ background: 'linear-gradient(135deg, #130531, #2D0A6B)', padding: '1.5rem', color: 'white' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.2rem' }}>
                  {selectedDoctor.name.startsWith('Dr.') ? selectedDoctor.name : `Dr. ${selectedDoctor.name}`}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{selectedDoctor.specialization}</div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                {/* Slot Selection */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6D5A9E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                    Select Time Slot
                  </label>
                  {slotsLoading ? (
                    <div style={{ height: 80, background: '#F5F3FF', borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
                  ) : slots.length === 0 ? (
                    <div style={{ padding: '1rem', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, fontSize: '0.85rem', color: '#92400E' }}>
                      No availability slots set up yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {slots.map((slot) => {
                        const isSelected = (selectedSlot?._id || selectedSlot?.id) === (slot._id || slot.id);
                        return (
                          <button
                            key={slot._id || slot.id}
                            onClick={() => { setSelectedSlot(slot); setSelectedDate(''); }}
                            style={{
                              padding: '0.75rem 1rem', borderRadius: 12, textAlign: 'left',
                              background: isSelected ? '#EDE9FE' : '#F9F7FF',
                              border: `1.5px solid ${isSelected ? '#7B2FF7' : '#E9E5F8'}`,
                              cursor: 'pointer', transition: 'all 0.15s',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, color: isSelected ? '#7B2FF7' : '#1A0A3C', fontSize: '0.88rem' }}>
                                {slot.startTime} – {slot.endTime}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#8B7EAA', marginTop: '0.1rem' }}>
                                {slot.repeat === 'daily' ? 'Daily' : slot.repeat === 'weekly' ? `Every ${slot.day}` : slot.day} · Max {slot.maxPatients} patients
                              </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: 8, background: slot.consultType === 'Online' ? '#E0F2FE' : '#D1FAE5', color: slot.consultType === 'Online' ? '#0369A1' : '#065F46' }}>
                              {slot.consultType || 'Physical'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Date Selection */}
                {selectedSlot && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6D5A9E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                      Select Date
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {getDatesForSlot(selectedSlot).map((date) => {
                        const d = new Date(date + 'T00:00:00');
                        const isSelected = selectedDate === date;
                        return (
                          <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            style={{
                              padding: '0.5rem 0.75rem', borderRadius: 10,
                              background: isSelected ? '#7B2FF7' : '#F9F7FF',
                              border: `1.5px solid ${isSelected ? '#7B2FF7' : '#E9E5F8'}`,
                              color: isSelected ? 'white' : '#1A0A3C',
                              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                              transition: 'all 0.15s',
                            }}
                          >
                            <div>{d.toLocaleDateString('en-LK', { weekday: 'short' })}</div>
                            <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>{d.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' })}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Symptoms */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#6D5A9E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Symptoms (optional)
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms..."
                    rows={2}
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #E9E5F8', borderRadius: 12, background: '#FAFAFA', color: '#1A0A3C', fontSize: '0.875rem', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = '#7B2FF7'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#E9E5F8'; }}
                  />
                </div>

                {error && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '0.75rem', color: '#991B1B', fontSize: '0.825rem', marginBottom: '1rem' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={bookAppointment}
                  disabled={!selectedSlot || !selectedDate || booking}
                  style={{
                    width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none',
                    background: !selectedSlot || !selectedDate || booking ? '#C4B5FD' : 'linear-gradient(135deg, #7B2FF7, #5F0FFF)',
                    color: 'white', fontWeight: 700, fontSize: '0.95rem',
                    cursor: !selectedSlot || !selectedDate || booking ? 'not-allowed' : 'pointer',
                    boxShadow: !selectedSlot || !selectedDate || booking ? 'none' : '0 4px 16px rgba(123,47,247,0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  {booking ? '⏳ Booking...' : '✓ Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
