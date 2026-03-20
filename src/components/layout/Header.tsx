'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

const navLinks = [
  { href: '/properties', label: 'Properties' },
  { href: '/chat', label: 'AI Chat' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`header ${isScrolled ? 'header--scrolled' : ''}`}
      >
        <div className="header__inner">
          {/* Logo */}
          <Link href="/" className="header__logo">
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
            <span className="header__logo-text">SpaceIn</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header__nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`header__link ${
                  pathname === link.href ? 'header__link--active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="header__actions">
            <ThemeToggle />
            <button
              className="header__hamburger"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)}>
          <nav
            className="mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer__header">
              <span className="header__logo-text">SpaceIn</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="mobile-drawer__close"
              >
                <X size={24} />
              </button>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-drawer__link ${
                  pathname === link.href ? 'mobile-drawer__link--active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 0 1.5rem;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          transition: box-shadow 0.3s ease;
        }

        .header--scrolled {
          box-shadow: 0 4px 24px var(--shadow);
        }

        .header__inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        .header__logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .header__logo-text {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .header__nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header__link {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .header__link:hover {
          color: var(--text-primary);
          background: var(--glass-bg);
        }

        .header__link--active {
          color: var(--accent);
          background: rgba(163, 145, 113, 0.08);
        }

        .header__actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header__hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          color: var(--text-primary);
          cursor: pointer;
        }

        /* Mobile Drawer */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(0, 0, 0, 0.6);
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 300px;
          z-index: 9999;
          background: var(--bg-secondary);
          backdrop-filter: blur(24px);
          border-left: 1px solid var(--border);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mobile-drawer__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .mobile-drawer__close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          background: var(--glass-bg);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .mobile-drawer__link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 1rem;
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .mobile-drawer__link:hover {
          color: var(--text-primary);
          background: var(--glass-bg);
        }

        .mobile-drawer__link--active {
          color: var(--accent);
          background: rgba(163, 145, 113, 0.08);
        }

        @media (max-width: 768px) {
          .header__nav {
            display: none;
          }

          .header__hamburger {
            display: flex;
          }

          .mobile-overlay {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
