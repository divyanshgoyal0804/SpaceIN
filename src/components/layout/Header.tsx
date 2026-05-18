'use client';

import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/ui/ThemeToggle';
import styles from './Header.module.css';

const navLinks = [
  { href: '/chat', label: 'AI Chat' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  return (
    <div className={styles.headerShell}>
      <div className={styles.headerHoverZone} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Logo */}
          <Link href="/" className={styles.headerLogo}>
            <Image src="/images/logo.webp" alt="Sharkspace Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
            <span className={styles.headerLogoText}>Sharkspace</span>
          </Link>

          <nav className={styles.headerNav}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.headerLink}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <ThemeToggle />
          </div>
        </div>
      </header>
    </div>
  );
}
