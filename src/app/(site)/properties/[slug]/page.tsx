import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, Maximize2, Building2, Car, Bath, Compass, Calendar, CheckCircle2 } from 'lucide-react';
import { formatPrice, propertyTypeLabels, furnishedTypeLabels, listingTypeLabels } from '@/lib/utils';
import PropertyCard from '@/components/properties/PropertyCard';
import type { Metadata } from 'next';

interface PropertyData {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  listingType: string;
  price: number | null;
  rentPerMonth: number | null;
  carpetArea: number;
  superArea: number | null;
  floor: number | null;
  totalFloors: number | null;
  location: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  furnished: string;
  possession: string | null;
  facing: string | null;
  parking: number | null;
  washrooms: number | null;
  mainImageUrl: string;
  images: { id: string; url: string; caption: string | null; order: number }[];
  isFeatured: boolean;
}

async function getProperty(slug: string): Promise<PropertyData | null> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/properties/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function getSimilarProperties(type: string, excludeId: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/properties?type=${type}&limit=4`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.properties || []).filter((p: { id: string }) => p.id !== excludeId).slice(0, 4);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: 'Property Not Found' };

  return {
    title: property.title,
    description: `${property.title} — ${propertyTypeLabels[property.type]} in ${property.location}. ${property.carpetArea} sq ft. ${formatPrice(property.rentPerMonth || property.price, !!property.rentPerMonth)}`,
    openGraph: {
      title: property.title,
      description: `${propertyTypeLabels[property.type]} in ${property.location}`,
      images: [{ url: property.mainImageUrl }],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  const similar = await getSimilarProperties(property.type, property.id);
  const allImages = [
    { url: property.mainImageUrl, caption: 'Main Image' },
    ...property.images,
  ];

  return (
    <div className="detail-page">
      {/* Image Gallery */}
      <div className="gallery">
        <div className="gallery-main">
          <Image
            src={property.mainImageUrl}
            alt={property.title}
            width={800}
            height={500}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            priority
          />
        </div>
        {allImages.length > 1 && (
          <div className="gallery-thumbs">
            {allImages.slice(1, 5).map((img, i) => (
              <div key={i} className="gallery-thumb">
                <Image
                  src={img.url}
                  alt={img.caption || `Image ${i + 1}`}
                  width={200}
                  height={150}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="detail-layout">
        {/* Left: Details */}
        <div className="detail-info">
          <div className="detail-header">
            <span className={`badge badge-${property.type.toLowerCase()}`}>
              {propertyTypeLabels[property.type]}
            </span>
            <span className="badge" style={{ background: 'rgba(1,114,150,0.1)', color: 'var(--accent)' }}>
              {listingTypeLabels[property.listingType]}
            </span>
          </div>

          <h1 className="detail-title">{property.title}</h1>

          <div className="detail-location">
            <MapPin size={16} />
            {property.location}, {property.city}
          </div>

          {/* Price bar */}
          <div className="price-bar glass-card">
            {property.rentPerMonth && (
              <div className="price-item">
                <span className="price-label">Rent</span>
                <span className="price-value">{formatPrice(property.rentPerMonth, true)}</span>
              </div>
            )}
            {property.price && (
              <div className="price-item">
                <span className="price-label">Sale Price</span>
                <span className="price-value">{formatPrice(property.price)}</span>
              </div>
            )}
          </div>

          {/* Info grid */}
          <div className="info-grid">
            <div className="info-pill">
              <Maximize2 size={16} />
              <span>Carpet: {property.carpetArea.toLocaleString('en-IN')} sq ft</span>
            </div>
            {property.superArea && (
              <div className="info-pill">
                <Building2 size={16} />
                <span>Super: {property.superArea.toLocaleString('en-IN')} sq ft</span>
              </div>
            )}
            <div className="info-pill">
              <CheckCircle2 size={16} />
              <span>{furnishedTypeLabels[property.furnished]}</span>
            </div>
            {property.floor !== null && (
              <div className="info-pill">
                <Building2 size={16} />
                <span>Floor {property.floor}{property.totalFloors ? ` of ${property.totalFloors}` : ''}</span>
              </div>
            )}
            {property.facing && (
              <div className="info-pill">
                <Compass size={16} />
                <span>{property.facing} Facing</span>
              </div>
            )}
            {property.parking !== null && property.parking > 0 && (
              <div className="info-pill">
                <Car size={16} />
                <span>{property.parking} Parking</span>
              </div>
            )}
            {property.washrooms !== null && property.washrooms > 0 && (
              <div className="info-pill">
                <Bath size={16} />
                <span>{property.washrooms} Washrooms</span>
              </div>
            )}
            {property.possession && (
              <div className="info-pill">
                <Calendar size={16} />
                <span>{property.possession}</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div className="amenities-section">
              <h3>Amenities</h3>
              <div className="amenities-grid">
                {property.amenities.map((a, i) => (
                  <div key={i} className="amenity-tag">
                    <CheckCircle2 size={14} color="var(--accent)" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="description-section">
            <h3>Description</h3>
            <p>{property.description}</p>
          </div>
        </div>

        {/* Right: Inquiry Form */}
        <InquiryForm propertyId={property.id} propertyTitle={property.title} />
      </div>

      {/* Similar Properties */}
      {similar.length > 0 && (
        <div className="similar-section page-container">
          <h2>Similar Properties</h2>
          <div className="similar-grid">
            {similar.map((p: PropertyData) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .detail-page {
          padding-top: 64px;
          min-height: 100vh;
        }

        .gallery {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 0.5rem;
        }

        .gallery-main {
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 16/10;
        }

        .gallery-thumbs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .gallery-thumb {
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 4/3;
        }

        .detail-layout {
          display: flex;
          gap: 2rem;
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        .detail-info {
          flex: 1;
          min-width: 0;
        }

        .detail-header {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .detail-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .detail-location {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .price-bar {
          display: flex;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .price-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .price-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .price-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--accent);
        }

        .info-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .info-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .amenities-section {
          margin-bottom: 2rem;
        }

        .amenities-section h3 {
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .amenities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.6rem;
        }

        .amenity-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .description-section h3 {
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
        }

        .description-section p {
          line-height: 1.8;
        }

        .similar-section {
          padding: 3rem 1.5rem 4rem;
        }

        .similar-section h2 {
          margin-bottom: 1.5rem;
        }

        .similar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          overflow-x: auto;
        }

        @media (max-width: 768px) {
          .gallery {
            grid-template-columns: 1fr;
          }

          .gallery-thumbs {
            grid-template-columns: repeat(4, 1fr);
          }

          .detail-layout {
            flex-direction: column;
          }

          .detail-title {
            font-size: 1.5rem;
          }

          .price-value {
            font-size: 1.5rem;
          }

          .similar-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

// Client component for the inquiry form
function InquiryForm({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  return (
    <div className="inquiry-sidebar">
      <div className="inquiry-card glass-card">
        <h3 style={{ marginBottom: '0.25rem' }}>Interested in this property?</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          {propertyTitle}
        </p>
        <form
          action={`/api/inquiries`}
          method="POST"
          onSubmit={async (e) => {
            e.preventDefault();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <input type="hidden" name="propertyId" value={propertyId} />
          <input type="text" name="name" placeholder="Your Name" className="input-field" required />
          <input type="email" name="email" placeholder="Email Address" className="input-field" required />
          <input type="tel" name="phone" placeholder="Phone Number" className="input-field" required />
          <textarea
            name="message"
            placeholder="Your message..."
            className="input-field"
            rows={3}
            style={{ resize: 'vertical' }}
          />
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Send Inquiry
          </button>
        </form>
      </div>

      <style>{`
        .inquiry-sidebar {
          width: 360px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
          height: fit-content;
        }

        @media (max-width: 768px) {
          .inquiry-sidebar {
            width: 100%;
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
