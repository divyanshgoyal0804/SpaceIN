import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Building2, FileText, MessageSquare, LogOut, Quote } from 'lucide-react';
import styles from './AdminSidebar.module.css';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/blogs', label: 'Blog Posts', icon: FileText },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
];

export default function AdminSidebar() {
  return (
    <div className={styles.sidebarShell}>
      <div className={styles.sidebarHoverZone} aria-hidden="true" />
      <aside className={styles.adminSidebar}>
        <div className={styles.sidebarLogo}>
          <Image src="/images/logo.webp" alt="Sharkspace Logo" width={28} height={28} style={{ objectFit: 'contain' }} />
          <span>Sharkspace</span>
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
    </div>
  );
}
