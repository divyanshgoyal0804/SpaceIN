import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function hasUnknownVideoArgError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Unknown argument `videoUrl`');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try finding by id first, then by slug
    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        images: { orderBy: { order: 'asc' } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (typeof body.isExclusive === 'string') {
      body.isExclusive = body.isExclusive === 'true';
    }

    // HIGH-6: Whitelist allowed fields to prevent mass assignment
    const { images } = body;
    const ALLOWED_KEYS = [
      'title', 'slug', 'description', 'type', 'listingType',
      'price', 'rentPerMonth', 'carpetArea', 'superArea',
      'floor', 'totalFloors', 'location', 'city',
      'latitude', 'longitude', 'amenities', 'furnished',
      'possession', 'facing', 'parking', 'washrooms',
      'mainImageUrl', 'videoUrl', 'isFeatured', 'isExclusive', 'isActive',
    ];
    const propertyData: Record<string, unknown> = {};
    for (const key of ALLOWED_KEYS) {
      if (body[key] !== undefined) {
        propertyData[key] = body[key];
      }
    }

    let property;
    try {
      property = await prisma.property.update({
        where: { id },
        data: propertyData,
        include: { images: true },
      });
    } catch (error) {
      // Backward compatibility for databases/clients that don't yet have videoUrl.
      if (!hasUnknownVideoArgError(error)) {
        throw error;
      }

      const { videoUrl: _ignored, ...propertyDataWithoutVideo } = propertyData as Record<string, unknown>;
      property = await prisma.property.update({
        where: { id },
        data: propertyDataWithoutVideo,
        include: { images: true },
      });
    }

    // Update images if provided
    if (images) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
      if (images.length > 0) {
        await prisma.propertyImage.createMany({
          data: images.map(
            (img: { url: string; caption?: string; order?: number }, idx: number) => ({
              propertyId: id,
              url: img.url,
              caption: img.caption || null,
              order: img.order || idx,
            })
          ),
        });
      }
    }

    const updated = await prisma.property.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    });

    if (updated) {
      revalidatePath('/properties');
      revalidatePath(`/properties/${updated.slug}`);
      revalidatePath('/chat');
      revalidatePath('/');
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Soft delete
    await prisma.property.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/properties');
    revalidatePath('/chat');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
