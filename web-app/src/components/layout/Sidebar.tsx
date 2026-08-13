'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  FileText,
  Pill,
  Camera,
  ClipboardPlus,
  Users,
  FlaskConical,
  Droplets,
  ShieldCheck,
  UserCheck,
  Activity,
  ScanLine,
  Syringe,
  LogOut,
  Home,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

const ROLE_NAV: Record<string, NavItem[]> = {
  patient: [
    { href: '/patient/dashboard',        label: 'Dashboard',        Icon: LayoutDashboard },
    { href: '/patient/symptom-check',    label: 'Symptom checker',  Icon: Stethoscope },
    { href: '/patient/book-appointment', label: 'Book appointment',  Icon: CalendarDays },
    { href: '/patient/my-reports',       label: 'My reports',       Icon: FileText },
    { href: '/patient/prescriptions',    label: 'Prescriptions',    Icon: Pill },
    { href: '/patient/triage',           label: 'Visual triage',    Icon: Camera },
  ],
  doctor: [
    { href: '/doctor/dashboard',             label: 'Dashboard',        Icon: LayoutDashboard },
    { href: '/doctor/slots',                 label: 'My schedule',       Icon: CalendarDays },
    { href: '/doctor/queue',                 label: 'Live queue',        Icon: Users },
    { href: '/doctor/prescriptions/new',     label: 'New prescription',  Icon: ClipboardPlus },
  ],
  nurse: [
    { href: '/nurse/dashboard',  label: 'OPD Triage',  Icon: LayoutDashboard },
    { href: '/nurse/lab-queue',  label: 'Lab queue',   Icon: FlaskConical },
    { href: '/nurse/samples',    label: 'Samples',     Icon: Droplets },
  ],
  admin: [
    { href: '/admin/dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
    { href: '/admin/verification', label: 'Verification', Icon: UserCheck },
    { href: '/admin/roles',        label: 'Users',        Icon: Users },
    { href: '/admin/monitoring',   label: 'Monitoring',   Icon: Activity },
  ],
  pharmacy: [
    { href: '/pharmacy/scan',         label: 'Scan QR code',      Icon: ScanLine },
    { href: '/pharmacy/interactions', label: 'Drug interactions',  Icon: Syringe },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  patient:  'Patient portal',
  doctor:   'Doctor portal',
  nurse:    'Nurse portal',
  admin:    'Admin console',
  pharmacy: 'Pharmacy portal',
};

// Per-role active highlight color (matches plan accent tokens)
const ROLE_ACCENT: Record<string, string> = {
  patient:  '#0B6E6E',
  doctor:   '#1E5B94',
  nurse:    '#3D8BFD',
  admin:    '#5B5F97',
  pharmacy: '#C97B2E',
};

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role ?? 'patient';
  const navItems = ROLE_NAV[role] ?? [];
  const accent = ROLE_ACCENT[role] ?? '#0B6E6E';
  const initial = (user?.name?.[0] ?? '?').toUpperCase();

  return (
    <>
      {/* Mobile dim overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,30,30,0.55)',
            zIndex: 39,
          }}
        />
      )}

      <aside
        aria-label="Sidebar navigation"
        style={{
          width: 252,
          minWidth: 252,
          background: 'var(--cl-sidebar-bg)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
          zIndex: 40,
          transform: mobileOpen ? 'none' : undefined,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '1.25rem 1.25rem 1rem',
            borderBottom: '1px solid var(--cl-sidebar-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {/* Brand mark — teal cross + pulse */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HeartPulse size={20} strokeWidth={2} color="#fff" aria-hidden="true" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              CuraLink
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: 'rgba(255,255,255,0.38)',
                marginTop: '0.05rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {ROLE_LABELS[role]}
            </div>
          </div>
        </div>

        {/* User chip */}
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderBottom: '1px solid var(--cl-sidebar-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: `${accent}33`,
              border: `1.5px solid ${accent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: accent,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {initial}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.8375rem',
                fontWeight: 600,
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {user?.name ?? 'User'}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.38)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email ?? ''}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          aria-label="Main navigation"
          style={{
            flex: 1,
            padding: '0.625rem 0.625rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 8,
                  background: isActive ? `${accent}22` : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  letterSpacing: '0.01em',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `2px solid ${accent}`;
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <item.Icon
                  size={17}
                  strokeWidth={2}
                  aria-hidden="true"
                  style={{ flexShrink: 0, color: isActive ? accent : undefined }}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '0.625rem', borderTop: '1px solid var(--cl-sidebar-border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link
            href="/"
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              transition: 'all 0.15s ease',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <Home size={15} strokeWidth={2} aria-hidden="true" />
            Back to home
          </Link>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              background: 'transparent',
              color: 'rgba(255,255,255,0.45)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              transition: 'all 0.15s ease',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(214,69,69,0.12)';
              e.currentTarget.style.color = '#F29999';
              e.currentTarget.style.borderColor = 'rgba(214,69,69,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <LogOut size={15} strokeWidth={2} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          aside[aria-label="Sidebar navigation"] {
            transform: translateX(${mobileOpen ? '0' : '-100%'});
            transition: transform 0.28s ease;
          }
        }
      `}</style>
    </>
  );
}
