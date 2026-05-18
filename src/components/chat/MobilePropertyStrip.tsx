'use client';
import { useEffect, useState } from 'react';
import { Property } from '@/store/chatStore';
import styles from './chat.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { resolvePropertyImageUrl } from '@/lib/image-url';

export default function MobilePropertyStrip({ propertyIds }: { propertyIds: string[] }) {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (!propertyIds.length) return;
    fetch(`/api/properties?ids=${propertyIds.join(',')}`)
      .then(r => r.json())
      .then(data => setProperties(data.properties || data.data || []));
  }, [propertyIds]); // Fix dependency array to be the array itself to avoid exhaustive-deps issues or just use proper deps

  if (!properties || !properties.length) return null;

  return (
    <div className={styles.mobilePropertyStrip}>
      {properties.map(p => (
        <Link key={p.id} href={`/properties/${p.slug}`} className={styles.mobilePropertyCard}>
          <div className={styles.mobilePropertyCardImageCont}>
            <Image 
              src={resolvePropertyImageUrl(p.mainImageUrl)} 
              alt={p.title} 
              fill
              className={styles.mobilePropertyCardImage}
              unoptimized
            />
            <div className={styles.mobilePropertyCardBadge}>{p.listingType}</div>
          </div>
          <div className={styles.mobilePropertyCardBody}>
            <div className={styles.mobilePropertyCardTitle}>{p.title}</div>
            <div className={styles.mobilePropertyCardLocation}>{p.location}</div>
            <div className={styles.mobilePropertyCardPrice}>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = 'tel:+91880879701'; }} 
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'inherit', fontWeight: 'inherit' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Call Us
              </button>
            </div>
            <div className={styles.mobilePropertyCardLink}>View Details →</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
