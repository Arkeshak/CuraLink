'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  createdAt: string;
  specialization?: string;
  hospital?: string;
  department?: string;
}

const ROLES = ['all', 'patient', 'doctor', 'nurse', 'admin', 'pharmacy'];
const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  patient: { bg: '#EDE9FE', color: '#7B2FF7' },
  doctor: { bg: '#E0F2FE', color: '#0369A1' },
  nurse: { bg: '#D1FAE5', color: '#065F46' },
  admin: { bg: '#FEE2E2', color: '#991B1B' },
  pharmacy: { bg: '#FEF3C7', color: '#D97706' },
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  active: { bg: '#D1FAE5', color: '#065F46' },
  approved: { bg: '#D1FAE5', color: '#065F46' },
  pending: { bg: '#FEF3C7', color: '#D97706' },
  suspended: { bg: '#FEE2E2', color: '#991B1B' },
  inactive: { bg: '#F3F4F6', color: '#6B7280' },
};

export default function AdminRolesPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'patient', phone: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setUsers(data.data ?? data.users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const saveEdit = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...editForm } : u)));
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch(`${API}/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u)));
      }
    } catch {}
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {}
  };

  const addUser = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) { setError('Name, email and password are required.'); return; }
    setAdding(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/admin/users`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowAddForm(false);
      setAddForm({ name: '', email: '', password: '', role: 'patient', phone: '' });
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to add user');
    } finally {
      setAdding(false);
    }
  };

  const roleCounts: Record<string, number> = {};
  users.forEach((u) => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#F3F4F6', color: '#374151', padding: '0.35rem 1rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
            👥 USER MANAGEMENT
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#1A0A3C', margin: '0 0 0.3rem' }}>
            Platform Users
          </h1>
          <p style={{ color: '#6D5A9E', fontSize: '0.9rem', margin: 0 }}>
            {users.length} users across all roles.
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setError(''); }}
          style={{ padding: '0.75rem 1.5rem', borderRadius: 12, background: 'linear-gradient(135deg, #1F2937, #374151)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          + Add User
        </button>
      </div>

      {/* Role summary pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {ROLES.map((r) => {
          const count = r === 'all' ? users.length : roleCounts[r] ?? 0;
          const style = r !== 'all' ? ROLE_BADGE[r] : { bg: '#F3F4F6', color: '#374151' };
          return (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{ padding: '0.45rem 1rem', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 600, border: `1.5px solid ${roleFilter === r ? style.color : '#E9E5F8'}`, background: roleFilter === r ? style.bg : 'white', color: roleFilter === r ? style.color : '#6D5A9E', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Add user form */}
      {showAddForm && (
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #E5E7EB', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(55,65,81,0.1)' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, color: '#1A0A3C', margin: '0 0 1.25rem', fontSize: '1rem' }}>Add New User</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1rem' }}>
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. John Silva' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'john@hospital.lk' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+94 71 000 0000' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  type={type}
                  value={(addForm as any)[key]}
                  onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Role</label>
              <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} style={selectStyle}>
                {['patient', 'doctor', 'nurse', 'admin', 'pharmacy'].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {error && <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '0.75rem 1rem', color: '#991B1B', fontSize: '0.82rem', marginBottom: '1rem' }}>⚠️ {error}</div>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={addUser} disabled={adding} style={{ padding: '0.75rem 1.5rem', borderRadius: 12, background: adding ? '#9CA3AF' : 'linear-gradient(135deg, #1F2937, #374151)', color: 'white', border: 'none', fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer' }}>
              {adding ? '⏳ Adding...' : '+ Add User'}
            </button>
            <button onClick={() => setShowAddForm(false)} style={{ padding: '0.75rem 1.25rem', borderRadius: 12, background: '#F9F7FF', color: '#6D5A9E', border: '1.5px solid #E9E5F8', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ flex: 1, padding: '0.7rem 1rem', border: '1.5px solid #E9E5F8', borderRadius: 12, background: '#FAFAFA', color: '#1A0A3C', fontSize: '0.875rem', outline: 'none' }}
          onFocus={(e) => (e.target.style.borderColor = '#374151')}
          onBlur={(e) => (e.target.style.borderColor = '#E9E5F8')}
        />
      </div>

      {/* User table */}
      <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #E9E5F8', overflow: 'hidden', boxShadow: '0 1px 4px rgba(95,15,255,0.06)' }}>
        {loading ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4].map((i) => <div key={i} style={{ height: 56, background: '#F3F4F6', borderRadius: 10, animation: 'shimmer 1.5s infinite' }} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map((col) => (
                    <th key={col} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E9E5F8' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const roleBadge = ROLE_BADGE[u.role] ?? { bg: '#F3F4F6', color: '#6B7280' };
                  const statusBadge = STATUS_BADGE[u.status?.toLowerCase()] ?? STATUS_BADGE.inactive;
                  const isEditing = editingId === u._id;
                  return (
                    <tr key={u._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F0FF' : 'none', background: isEditing ? '#FAFAFA' : 'white' }}>
                      <td style={{ padding: '1rem 1rem' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <input value={editForm.name ?? ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ ...inputStyle, fontSize: '0.8rem', padding: '0.4rem 0.6rem' }} placeholder="Name" />
                            <input value={editForm.email ?? ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={{ ...inputStyle, fontSize: '0.8rem', padding: '0.4rem 0.6rem' }} placeholder="Email" />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #A855F7, #7B2FF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#1A0A3C', fontSize: '0.875rem' }}>{u.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#8B7EAA' }}>{u.email}</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        {isEditing ? (
                          <select value={editForm.role ?? u.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} style={{ ...selectStyle, fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}>
                            {['patient', 'doctor', 'nurse', 'admin', 'pharmacy'].map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : (
                          <span style={{ padding: '0.2rem 0.65rem', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, background: roleBadge.bg, color: roleBadge.color, textTransform: 'capitalize' }}>{u.role}</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.65rem', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700, background: statusBadge.bg, color: statusBadge.color, textTransform: 'capitalize' }}>{u.status || 'active'}</span>
                      </td>
                      <td style={{ padding: '1rem 1rem', fontSize: '0.8rem', color: '#8B7EAA' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-LK')}
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(u._id)} disabled={saving} style={{ padding: '0.35rem 0.75rem', borderRadius: 8, background: '#065F46', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                                {saving ? '⏳' : '✓ Save'}
                              </button>
                              <button onClick={() => setEditingId(null)} style={{ padding: '0.35rem 0.75rem', borderRadius: 8, background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingId(u._id); setEditForm({ name: u.name, email: u.email, role: u.role }); }} style={{ padding: '0.35rem 0.65rem', borderRadius: 8, background: '#EDE9FE', color: '#7B2FF7', border: 'none', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => toggleStatus(u._id, u.status ?? 'active')} style={{ padding: '0.35rem 0.65rem', borderRadius: 8, background: u.status === 'suspended' ? '#D1FAE5' : '#FEF3C7', color: u.status === 'suspended' ? '#065F46' : '#D97706', border: 'none', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                                {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </button>
                              <button onClick={() => deleteUser(u._id, u.name)} style={{ padding: '0.35rem 0.65rem', borderRadius: 8, background: '#FEE2E2', color: '#991B1B', border: 'none', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>Del</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#8B7EAA' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                No users found.
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0% { background-color: #F3F4F6; } 50% { background-color: #E5E7EB; } 100% { background-color: #F3F4F6; } }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6D5A9E', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #E9E5F8', borderRadius: 10, background: '#FAFAFA', color: '#1A0A3C', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };
const selectStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #E9E5F8', borderRadius: 10, background: '#FAFAFA', color: '#1A0A3C', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' };
