'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import { SessionProvider } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <main style={{ flex: 1, marginLeft: '240px', padding: '2rem', background: 'var(--bg-primary)' }}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
