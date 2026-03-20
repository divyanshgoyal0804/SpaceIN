'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Building2, FileText, MessageSquare, LogOut } from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/blogs', label: 'Blog Posts', icon: FileText },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="var(--accent)" />
          <path d="M8 22V12L16 7L24 12V22L16 27L8 22Z" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
        <span>SpaceIn</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button className="sidebar-logout" onClick={() => signOut({ callbackUrl: '/admin/login' })}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>

      <style jsx>{`
        .admin-sidebar {
          width: 240px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 0;
          z-index: 100;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0 1.25rem;
          margin-bottom: 2rem;
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0 0.75rem;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .sidebar-item:hover {
          color: var(--text-primary);
          background: var(--glass-bg);
        }

        .sidebar-item--active {
          color: var(--accent);
          background: rgba(var(--accent-rgb), 0.08);
          border-left-color: var(--accent);
        }

        .sidebar-logout {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          margin: 0 0.75rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: none;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .sidebar-logout:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.15);
        }
      `}</style>
    </aside>
  );
}
