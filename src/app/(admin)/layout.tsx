'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <div style={{ minHeight: '100vh' }}>
      {!isLoginPage && <AdminSidebar />}
      <main
        style={{
          minHeight: '100vh',
          padding: isLoginPage ? '0' : '2rem',
          background: 'var(--bg-primary)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
