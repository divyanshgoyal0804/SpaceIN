import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isActive: true };

    // Handle explicit IDs override
    const ids = searchParams.get('ids');
    if (ids) {
      const idList = ids.split(',').filter(Boolean);
      where.id = { in: idList };
    }

    // Listing type (single or multi)
    const listing = searchParams.get('listing');
    if (listing) {
      const listingValues = listing.split(',');
      if (listingValues.length === 1) {
        where.listingType = listingValues[0];
      } else {
        where.listingType = { in: listingValues };
      }
    }

    // Property type (multi-select)
    const type = searchParams.get('type');
    if (type) {
      const typeValues = type.split(',');
      if (typeValues.length === 1) {
        where.type = typeValues[0];
      } else {
        where.type = { in: typeValues };
      }
    }

    // Rent range
    const minRent = searchParams.get('minRent');
    const maxRent = searchParams.get('maxRent');
    if (minRent || maxRent) {
      where.rentPerMonth = {};
      if (minRent) where.rentPerMonth.gte = parseFloat(minRent);
      if (maxRent) where.rentPerMonth.lte = parseFloat(maxRent);
    }

    // Sale price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Carpet area range
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');
    if (minArea || maxArea) {
      where.carpetArea = {};
      if (minArea) where.carpetArea.gte = parseFloat(minArea);
      if (maxArea) where.carpetArea.lte = parseFloat(maxArea);
    }

    // Super / Built-up area range
    const minSuperArea = searchParams.get('minSuperArea');
    const maxSuperArea = searchParams.get('maxSuperArea');
    if (minSuperArea || maxSuperArea) {
      where.superArea = {};
      if (minSuperArea) where.superArea.gte = parseFloat(minSuperArea);
      if (maxSuperArea) where.superArea.lte = parseFloat(maxSuperArea);
    }

    // Floor range
    const minFloor = searchParams.get('minFloor');
    const maxFloor = searchParams.get('maxFloor');
    if (minFloor || maxFloor) {
      where.floor = {};
      if (minFloor) where.floor.gte = parseInt(minFloor);
      if (maxFloor) where.floor.lte = parseInt(maxFloor);
    }

    // Furnished status (multi-select)
    const furnished = searchParams.get('furnished');
    if (furnished) {
      const furnishedValues = furnished.split(',');
      if (furnishedValues.length === 1) {
        where.furnished = furnishedValues[0];
      } else {
        where.furnished = { in: furnishedValues };
      }
    }

    // Facing (multi-select)
    const facing = searchParams.get('facing');
    if (facing) {
      const facingValues = facing.split(',');
      // Map URL values to DB values
      const facingMap: Record<string, string> = {
        NORTH: 'North',
        SOUTH: 'South',
        EAST: 'East',
        WEST: 'West',
        NORTH_EAST: 'North-East',
        NORTH_WEST: 'North-West',
        SOUTH_EAST: 'South-East',
        SOUTH_WEST: 'South-West',
      };
      const mappedValues = facingValues.map((v) => facingMap[v] || v);
      if (mappedValues.length === 1) {
        where.facing = mappedValues[0];
      } else {
        where.facing = { in: mappedValues };
      }
    }

    // Amenities — ALL selected amenities must be present
    const amenities = searchParams.get('amenities');
    if (amenities) {
      const list = amenities.split(',');
      where.amenities = { hasEvery: list };
    }

    // Parking
    const minParking = searchParams.get('minParking');
    if (minParking) where.parking = { gte: parseInt(minParking) };

    // Washrooms
    const minWashrooms = searchParams.get('minWashrooms');
    if (minWashrooms) where.washrooms = { gte: parseInt(minWashrooms) };

    // Possession
    const possession = searchParams.get('possession');
    if (possession === 'ready') {
      where.possession = { contains: 'ready', mode: 'insensitive' };
    } else if (possession === 'underconstruction') {
      where.possession = { not: { contains: 'ready', mode: 'insensitive' } };
    }

    // Location (multi-location OR search)
    const locations = searchParams.get('locations');
    if (locations) {
      const locList = locations.split(',');
      where.OR = locList.map((loc: string) => ({
        location: { contains: loc.trim(), mode: 'insensitive' },
      }));
    }

    // City
    const city = searchParams.get('city');
    if (city) where.city = city;

    // Featured
    if (searchParams.get('featured') === 'true') where.isFeatured = true;

    // Text search
    const search = searchParams.get('search');
    if (search) where.title = { contains: search, mode: 'insensitive' };

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
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

    return NextResponse.json({
      properties,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const property = await prisma.property.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        type: body.type,
        listingType: body.listingType,
        price: body.price || null,
        rentPerMonth: body.rentPerMonth || null,
        carpetArea: body.carpetArea,
        superArea: body.superArea || null,
        floor: body.floor || null,
        totalFloors: body.totalFloors || null,
        location: body.location,
        city: body.city || 'Noida',
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        amenities: body.amenities || [],
        furnished: body.furnished,
        possession: body.possession || null,
        facing: body.facing || null,
        parking: body.parking || null,
        washrooms: body.washrooms || null,
        mainImageUrl: body.mainImageUrl,
        videoUrl: body.videoUrl || null,
        isFeatured: body.isFeatured || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        images: body.images?.length
          ? {
              create: body.images.map(
                (img: { url: string; caption?: string; order?: number }, idx: number) => ({
                  url: img.url,
                  caption: img.caption || null,
                  order: img.order || idx,
                })
              ),
            }
          : undefined,
      },
      include: { images: true },
    });

    revalidatePath('/properties');
    revalidatePath(`/properties/${property.slug}`);
    revalidatePath('/chat');

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
