'use client';

import Link from 'next/link';
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
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--accent)" />
              <path
                d="M8 22V12L16 7L24 12V22L16 27L8 22Z"
                stroke="#271902"
                strokeWidth="2"
                fill="none"
              />
              <path d="M16 7V27" stroke="#271902" strokeWidth="1.5" />
              <path d="M8 12L24 22" stroke="#271902" strokeWidth="1.5" />
              <path d="M24 12L8 22" stroke="#271902" strokeWidth="1.5" />
            </svg>
            <span className={styles.headerLogoText}>SpaceIn</span>
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
