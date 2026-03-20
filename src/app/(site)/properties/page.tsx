import { Suspense } from 'react';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyFilters from '@/components/properties/PropertyFilters';
import { ActiveFilterChips } from '@/components/properties/PropertyFilters';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Properties',
  description: 'Browse premium commercial spaces in Noida — offices, coworking, retail, warehouses, showrooms, and plots.',
};

interface PropertyData {
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
}

async function getProperties(searchParams: Record<string, string>) {
  const where: any = { isActive: true };

  // Apply filters same as the API route
  const type = searchParams.type;
  if (type) {
    const typeValues = type.split(',');
    where.type = typeValues.length === 1 ? typeValues[0] : { in: typeValues };
  }

  const listing = searchParams.listing;
  if (listing) {
    const listingValues = listing.split(',');
    where.listingType = listingValues.length === 1 ? listingValues[0] : { in: listingValues };
  }

  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties: JSON.parse(JSON.stringify(properties)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

function PropertyListingContent({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  return (
    <Suspense fallback={<PropertiesLoading />}>
      <PropertyListingAsync searchParams={searchParams} />
    </Suspense>
  );
}

async function PropertyListingAsync({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const data = await getProperties(searchParams);
  const properties: PropertyData[] = data.properties || [];
  const total: number = data.total || 0;

  return (
    <>
      {/* Result count */}
      <div className="results-summary">
        <span className="results-summary__count">
          {total} {total === 1 ? 'property' : 'properties'} found
        </span>
      </div>

      {properties.length === 0 ? (
        <div className="empty-state">
          <h3>No properties found</h3>
          <p>Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <>
          <div className="property-grid">
            {properties.map((property: PropertyData) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          {data.page < data.totalPages && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <a
                href={`/properties?${new URLSearchParams({ ...searchParams, page: String(data.page + 1) }).toString()}`}
                className="btn-secondary"
              >
                Load More
              </a>
            </div>
          )}
        </>
      )}
    </>
  );
}

function PropertiesLoading() {
  return (
    <div className="property-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card" style={{ overflow: 'hidden' }}>
          <div className="skeleton" style={{ height: '200px' }} />
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: '20px', width: '80%' }} />
            <div className="skeleton" style={{ height: '14px', width: '60%' }} />
            <div className="skeleton" style={{ height: '16px', width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="properties-page">
      <div className="properties-header">
        <h1>Commercial Spaces</h1>
        <p>Discover verified commercial properties in Noida</p>
      </div>
      <div className="properties-layout">
        <Suspense fallback={null}>
          <PropertyFilters />
        </Suspense>
        <div className="properties-content">
          {/* Active filter chips */}
          <Suspense fallback={null}>
            <ActiveFilterChips />
          </Suspense>
          <PropertyListingContent searchParams={resolvedParams} />
        </div>
      </div>

      <style>{`
        .properties-page {
          padding-top: 64px;
          min-height: 100vh;
        }

        .properties-header {
          text-align: center;
          padding: 3rem 1.5rem 2rem;
        }

        .properties-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .properties-header p {
          color: var(--text-secondary);
        }

        .properties-layout {
          display: flex;
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem 4rem;
        }

        .properties-content {
          flex: 1;
          min-width: 0;
        }

        .results-summary {
          margin-bottom: 1rem;
        }

        .results-summary__count {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .property-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-muted);
        }

        .empty-state h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        @media (max-width: 1200px) {
          .property-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .properties-layout {
            flex-direction: column;
          }
          .property-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .property-grid {
            grid-template-columns: 1fr;
          }

          .properties-header h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}
