'use client';

import { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function PortalLayout({
  children,
  pageTitle,
}: {
  children: React.ReactNode;
  pageTitle?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div
          style={{
            flex: 1,
            marginLeft: 252,
            minHeight: '100vh',
            background: 'var(--cl-canvas)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TopBar pageTitle={pageTitle} onMenuClick={() => setMobileOpen(true)} />
          <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="marginLeft: 252"] { margin-left: 0 !important; }
        }
      `}</style>
    </AuthProvider>
  );
}
