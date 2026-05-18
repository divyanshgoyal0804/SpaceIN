import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/store/chatStore';
import styles from './chat.module.css';
import { resolvePropertyImageUrl } from '@/lib/image-url';

interface Props {
  property: Property;
}

export default function PropertyResultCard({ property }: Props) {
  const imageUrl = resolvePropertyImageUrl(property.mainImageUrl);
  const detailHref = `/properties/${property.slug || property.id}`;
  const area = property.carpetArea ? `${property.carpetArea} sq ft` : '';
  const price = property.rentPerMonth 
    ? `₹${property.rentPerMonth.toLocaleString('en-IN')}/month` 
    : property.price 
      ? `₹${property.price.toLocaleString('en-IN')}` 
      : 'Price on request';

  return (
    <div className={styles.propertyCard}>
      <div className={styles.cardImageContainer}>
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className={styles.cardImage}
          unoptimized // in case next config doesn't allow external domains or standard local path
        />
        <div className={styles.typeBadge}>{property.listingType}</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{property.title}</div>
        <div className={styles.cardMeta}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {property.location}
          {area && (
            <>
              <span style={{margin:'0 4px', opacity: 0.5}}>•</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
              {area}
            </>
          )}
        </div>
        <div className={styles.cardPrice}>
          <a href="tel:+91880879701" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Call Us
          </a>
        </div>
        <Link href={detailHref} className={styles.viewBtn}>View Details →</Link>
      </div>
    </div>
  );
}
