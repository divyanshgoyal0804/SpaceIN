import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/store/chatStore';
import styles from './chat.module.css';

interface Props {
  property: Property;
}

export default function PropertyResultCard({ property }: Props) {
  const imageUrl = property.mainImageUrl || '/images/card-fallback.jpg'; // Adjust fallback
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
        <div className={styles.cardPrice}>{price}</div>
        <Link href={detailHref} className={styles.viewBtn}>View Details →</Link>
      </div>
    </div>
  );
}
