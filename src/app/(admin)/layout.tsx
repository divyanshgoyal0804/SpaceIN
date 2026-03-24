import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          padding: '2rem',
          background: 'var(--bg-primary)',
          marginLeft: '240px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
