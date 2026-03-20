import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Maximize2 } from 'lucide-react';
import { formatPrice, propertyTypeLabels } from '@/lib/utils';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    slug: string;
    type: string;
    listingType: string;
    price: number | null;
    rentPerMonth: number | null;
    carpetArea: number;
    location: string;
    mainImageUrl: string;
    furnished: string;
  };
}

const badgeColorMap: Record<string, string> = {
  OFFICE: 'badge-office',
  COWORKING: 'badge-coworking',
  RETAIL: 'badge-retail',
  WAREHOUSE: 'badge-warehouse',
  SHOWROOM: 'badge-showroom',
  PLOT: 'badge-plot',
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const isRent = property.listingType === 'RENT' || property.listingType === 'BOTH';
  const displayPrice = isRent
    ? formatPrice(property.rentPerMonth, true)
    : formatPrice(property.price);

  return (
    <Link href={`/properties/${property.slug}`} className="property-card card">
      <div className="property-card__image-wrap">
        <Image
          src={property.mainImageUrl}
          alt={property.title}
          width={400}
          height={300}
          className="property-card__image"
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
        <span className={`property-card__badge badge ${badgeColorMap[property.type] || ''}`}>
          {propertyTypeLabels[property.type] || property.type}
        </span>
      </div>
      <div className="property-card__body">
        <h3 className="property-card__title">{property.title}</h3>
        <div className="property-card__location">
          <MapPin size={14} />
          <span>{property.location}</span>
        </div>
        <div className="property-card__meta">
          <div className="property-card__area">
            <Maximize2 size={14} />
            <span>{property.carpetArea.toLocaleString('en-IN')} sq ft</span>
          </div>
          <div className="property-card__price">{displayPrice}</div>
        </div>
        <div className="property-card__cta">
          <span className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            View Details
          </span>
        </div>
      </div>

      <style>{`
        .property-card {
          display: block;
          text-decoration: none;
          width: 100%;
        }

        .property-card__image-wrap {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
        }

        .property-card:hover .property-card__image {
          transform: scale(1.05);
        }

        .property-card__image {
          transition: transform 0.4s ease;
        }

        .property-card__badge {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          z-index: 2;
        }

        .property-card__body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .property-card__title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .property-card__location {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .property-card__meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.25rem;
        }

        .property-card__area {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .property-card__price {
          font-size: 1rem;
          font-weight: 700;
          color: var(--accent);
        }

        .property-card__cta {
          margin-top: 0.5rem;
        }
      `}</style>
    </Link>
  );
}
