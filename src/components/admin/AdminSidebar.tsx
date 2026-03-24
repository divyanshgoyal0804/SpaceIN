import Link from 'next/link';
import { LayoutDashboard, Building2, FileText, MessageSquare, LogOut } from 'lucide-react';
import styles from './AdminSidebar.module.css';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/blogs', label: 'Blog Posts', icon: FileText },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
];

export default function AdminSidebar() {
  return (
    <aside className={styles.adminSidebar}>
      <div className={styles.sidebarLogo}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="var(--accent)" />
          <path d="M8 22V12L16 7L24 12V22L16 27L8 22Z" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
        <span>SpaceIn</span>
      </div>

      <nav className={styles.sidebarNav}>
        {navItems.map((item) => {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={styles.sidebarItem}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <a className={styles.sidebarLogout} href="/api/auth/signout?callbackUrl=/admin/login">
        <LogOut size={20} />
        <span>Logout</span>
      </a>
    </aside>
  );
}
