'use client';

import { useState, useEffect } from 'react';
import styles from './CoverageTestimonials.module.css';

const coverageAreas = [
  { title: 'Sector 16 / 18', desc: 'CBD · METRO · F&B' },
  { title: 'Sector 62 / 63', desc: 'IT CORRIDOR' },
  { title: 'Sector 125 – 132', desc: 'NOIDA EXPRESSWAY' },
  { title: 'Sector 142 / 144', desc: 'TECH HUB' },
  { title: 'Greater Noida West', desc: 'BPO & BACK-OFFICE' },
  { title: 'Film City, Sector 16A', desc: 'MEDIA & BROADCAST' },
  { title: 'Sector 80 – 90', desc: 'INDUSTRIAL / WAREHOUSING' },
  { title: 'Knowledge Park', desc: 'GREATER NOIDA' },
];

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
}

interface CoverageTestimonialsProps {
  testimonials: Testimonial[];
}

export default function CoverageTestimonials({ testimonials }: CoverageTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'Entered' | 'Exiting'>('Entered');

  // Desktop shows 2 at a time
  const itemsToShow = 2;

  useEffect(() => {
    if (!testimonials || testimonials.length <= itemsToShow) return;

    const intervalId = setInterval(() => {
      // Start fade out
      setFadeState('Exiting');

      // After fade out completes, change index and fade back in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + itemsToShow >= testimonials.length ? 0 : prev + itemsToShow));
        setFadeState('Entered');
      }, 500); // 500ms matches CSS transition time
    }, 5000); // 5 seconds rotate

    return () => clearInterval(intervalId);
  }, [testimonials]);

  if (!testimonials) return null;

  const currentTestimonials = testimonials.slice(currentIndex, currentIndex + itemsToShow);

  // If we don't have enough to fill the array due to odd length, wrap around or just show the last few.
  // slice alone is fine if it yields fewer items at the end, but wrapping around is better visually.
  const displayItems = [...currentTestimonials];
  if (displayItems.length < itemsToShow && testimonials.length >= itemsToShow) {
    const needed = itemsToShow - displayItems.length;
    displayItems.push(...testimonials.slice(0, needed));
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Coverage Header */}
        <div className={styles.topSection}>
          <div>
            <div className={styles.eyebrow}>04 COVERAGE</div>
            <h2 className={styles.title}>
              Every <span className={styles.titleAccent}>micro-market</span><br />
              of Noida.
            </h2>
          </div>
          <p className={styles.description}>
            Live presence across 30+ commercial sectors. We know each landlord, building grade, and going rate — so you don't overpay or wait.
          </p>
        </div>

        {/* Coverage Grid */}
        <div className={styles.coverageGrid}>
          {coverageAreas.map((area) => (
            <div key={area.title} className={styles.coverageCard}>
              <h3 className={styles.coverageTitle}>{area.title}</h3>
              <p className={styles.coverageDesc}>{area.desc}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className={styles.testimonialsContainer}>
            <div className={`${styles.testimonialsGrid} ${fadeState === 'Exiting' ? styles.fadeExiting : styles.fadeEntered}`}>
              {displayItems.map((t) => (
                <div key={t.id} className={styles.testimonialCard}>
                  <div className={styles.quoteIcon}>"</div>
                  <p className={styles.quoteText}>{t.quote}</p>
                  <div className={styles.authorContainer}>
                    <div className={styles.authorLine}></div>
                    <div className={styles.authorInfo}>
                      <span className={styles.authorName}>{t.name}</span>
                      {t.role || t.company ? (
                        <span className={styles.authorRole}>
                          {[t.role, t.company].filter(Boolean).join(', ')}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
