import { notFound } from 'next/navigation';
import PropertyForm from '@/components/admin/PropertyForm';
import { prisma } from '@/lib/prisma';

async function getProperty(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' } } },
  });
}

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Edit Property</h1>
      <PropertyForm
        isEdit
        propertyId={property.id}
        initialData={{
          title: property.title,
          slug: property.slug,
          description: property.description,
          type: property.type,
          listingType: property.listingType,
          price: property.price?.toString() ?? '',
          rentPerMonth: property.rentPerMonth?.toString() ?? '',
          carpetArea: property.carpetArea.toString(),
          superArea: property.superArea?.toString() ?? '',
          floor: property.floor?.toString() ?? '',
          totalFloors: property.totalFloors?.toString() ?? '',
          location: property.location,
          city: property.city,
          latitude: property.latitude?.toString() ?? '',
          longitude: property.longitude?.toString() ?? '',
          amenities: property.amenities,
          furnished: property.furnished,
          possession: property.possession ?? 'Ready to Move',
          facing: property.facing ?? '',
          parking: property.parking?.toString() ?? '',
          washrooms: property.washrooms?.toString() ?? '',
          mainImageUrl: property.mainImageUrl,
          images: property.images.map((img) => img.url),
          videoUrl: property.videoUrl ?? '',
          isFeatured: property.isFeatured,
          isActive: property.isActive,
        }}
      />
    </div>
  );
}
