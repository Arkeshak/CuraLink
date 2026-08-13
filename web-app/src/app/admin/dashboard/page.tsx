'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: 1200 }}>
      <div style={{ background: 'linear-gradient(135deg, #1F2937, #374151)', borderRadius: 20, padding: '2rem', marginBottom: '2rem', color: 'white' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, margin: '0 0 0.3rem', fontSize: '1.75rem' }}>
          Admin Console 🏥
        </h1>
        <p style={{ opacity: 0.75, margin: 0 }}>Manage platform users, verifications, and monitoring</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {[
          { href: '/admin/verification', icon: '✅', label: 'Staff Verification', desc: 'Review doctor & nurse applications' },
          { href: '/admin/roles',        icon: '👥', label: 'User Management',   desc: 'Manage roles and permissions' },
          { href: '/admin/monitoring',   icon: '📊', label: 'AI Monitoring',     desc: 'View AI usage and audit logs' },
        ].map((a) => (
          <Link key={a.href} href={a.href} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1.5px solid #E9E5F8', textDecoration: 'none', transition: 'all 0.2s', display: 'block' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6B7280'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E9E5F8'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{a.icon}</div>
            <div style={{ fontWeight: 700, color: '#1A0A3C', marginBottom: '0.3rem' }}>{a.label}</div>
            <div style={{ fontSize: '0.82rem', color: '#6D5A9E' }}>{a.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
