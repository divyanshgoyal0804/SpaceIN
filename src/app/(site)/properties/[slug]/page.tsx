import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, Maximize2, Building2, Car, Bath, Compass, Calendar, CheckCircle2 } from 'lucide-react';
import { formatPrice, propertyTypeLabels, furnishedTypeLabels, listingTypeLabels } from '@/lib/utils';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyGallery from '@/components/properties/PropertyGallery';
import InquiryForm from '@/components/properties/InquiryForm';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { resolvePropertyImageUrl } from '@/lib/image-url';

export const dynamic = 'force-dynamic';

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
  videoUrl: string | null;
  images: { id: string; url: string; caption: string | null; order: number }[];
  isFeatured: boolean;
}

function getEmbedVideoUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');

    if (host === 'youtube.com' || host === 'youtu.be') {
      const id = host === 'youtu.be'
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get('v');
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}`;
    }

    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (!id) return null;
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }

  return null;
}

async function getProperty(slug: string): Promise<PropertyData | null> {
  const property = await prisma.property.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      isActive: true,
    },
    include: { images: { orderBy: { order: 'asc' } } },
  });

  if (!property) return null;
  return JSON.parse(JSON.stringify(property));
}

async function getSimilarProperties(type: string, excludeId: string) {
  const properties = await prisma.property.findMany({
    where: {
      type: type as any,
      id: { not: excludeId },
      isActive: true,
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  return JSON.parse(JSON.stringify(properties));
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
      images: [{ url: resolvePropertyImageUrl(property.mainImageUrl) }],
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
  const mainImageUrl = resolvePropertyImageUrl(property.mainImageUrl);
  const allImages = [
    { url: mainImageUrl, caption: 'Main Image' },
    ...property.images.map((img) => ({
      ...img,
      url: resolvePropertyImageUrl(img.url),
    })),
  ];

  return (
    <div className="detail-page">
      {/* Image Gallery */}
      <PropertyGallery images={allImages} />

      <div className="detail-layout">
        {/* Left: Details */}
        <div className="detail-info">
          <div className="detail-header">
            <span className={`badge badge-${property.type.toLowerCase()}`}>
              {propertyTypeLabels[property.type]}
            </span>
            <span className="badge" style={{ background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)' }}>
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

          {/* Property Video */}
          {property.videoUrl && (
            <div className="video-section">
              <h3>Property Walkthrough</h3>
              {getEmbedVideoUrl(property.videoUrl) ? (
                <iframe
                  src={getEmbedVideoUrl(property.videoUrl)!}
                  title={`${property.title} walkthrough`}
                  className="detail-video detail-video-embed"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  preload="metadata"
                  playsInline
                  crossOrigin="anonymous"
                  className="detail-video"
                >
                  <source src={property.videoUrl} />
                  Your browser does not support the video tag.
                </video>
              )}
              <a
                href={property.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-video-link"
              >
                Open video in new tab ↗
              </a>
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
          padding-top: 72px;
          min-height: 100vh;
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

        .video-section {
          margin-bottom: 2rem;
        }

        .video-section h3 {
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
        }

        .detail-video {
          width: 100%;
          max-width: 860px;
          aspect-ratio: 16 / 9;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: #000;
          display: block;
        }

        .detail-video-embed {
          border: none;
        }

        .detail-video-link {
          display: inline-block;
          margin-top: 0.6rem;
          font-size: 0.85rem;
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 2px;
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
