import Link from 'next/link';
import styles from './Footer.module.css';

const quickLinks = [
  { href: '/properties', label: 'Properties' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/chat', label: 'Chat with AI' },
];

const propertyTypes = [
  { href: '/properties?type=OFFICE', label: 'Office Spaces' },
  { href: '/properties?type=COWORKING', label: 'Coworking' },
  { href: '/properties?type=RETAIL', label: 'Retail' },
  { href: '/properties?type=WAREHOUSE', label: 'Warehouse' },
  { href: '/properties?type=SHOWROOM', label: 'Showroom' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {/* Brand Column */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="var(--accent)" />
                <path
                  d="M8 22V12L16 7L24 12V22L16 27L8 22Z"
                  stroke="#271902"
                  strokeWidth="2"
                  fill="none"
                />
                <path d="M16 7V27" stroke="#271902" strokeWidth="1.5" />
              </svg>
              <span className={styles.footerBrandName}>SpaceIn</span>
            </div>
            <p className={styles.footerTagline}>
              India&apos;s premium platform for commercial real estate.
              Handpicked spaces, verified listings, expert guidance.
            </p>
            {/* Social Links */}
            <div className={styles.footerSocial}>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.footerHeading}>Quick Links</h4>
            <ul className={styles.footerList}>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className={styles.footerHeading}>Property Types</h4>
            <ul className={styles.footerList}>
              {propertyTypes.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className={styles.footerHeading}>Contact Us</h4>
            <ul className={styles.footerList}>
              <li className={styles.footerContactItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +91 9XXXXXXXXX
              </li>
              <li className={styles.footerContactItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                hello@spacein.in
              </li>
              <li className={styles.footerContactItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Noida, Uttar Pradesh, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} SpaceIn. All rights reserved.</p>
          <p className={styles.footerBuilt}>Built for commercial real estate in India</p>
        </div>
      </div>
    </footer>
  );
}
