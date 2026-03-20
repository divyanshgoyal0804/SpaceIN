'use client';
import { useEffect, useState } from 'react';
import { Property } from '@/store/chatStore';
import styles from './chat.module.css';
import Link from 'next/link';
import Image from 'next/image';

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
              src={p.mainImageUrl || '/images/card-fallback.jpg'} 
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
              {p.rentPerMonth 
                ? `₹${p.rentPerMonth.toLocaleString('en-IN')}/month` 
                : p.price 
                  ? `₹${p.price.toLocaleString('en-IN')}` 
                  : 'Price on request'}
            </div>
            <div className={styles.mobilePropertyCardLink}>View Details →</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
