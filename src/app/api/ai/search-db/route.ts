import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimiter, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod/v4';

const limiter = createRateLimiter('ai-search-db', { maxRequests: 30, windowMs: 60_000 });

// HIGH-1 + HIGH-2: Validate input types with Zod
const SearchFiltersSchema = z.object({
  bhk: z.number().int().nullable().optional(),
  max_price: z.number().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  near_metro: z.boolean().nullable().optional(),
  intent: z.enum(['investment', 'self_use']).nullable().optional(),
});

export async function POST(req: NextRequest) {
  // CRIT-5: Rate limiting
  const ip = getClientIp(req);
  const rateCheck = limiter.check(ip);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Validate input
    const parseResult = SearchFiltersSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid search filters' }, { status: 400 });
    }

    const filters = parseResult.data;
    const maxPriceVal = filters.max_price ? Number(filters.max_price) : null;
    const locationVal = filters.location ? `%${filters.location}%` : null;
    const nearMetroVal = filters.near_metro || false;
    const intentVal = filters.intent || null;

    // HIGH-1: Replace SELECT * with explicit column list to avoid leaking sensitive data
    const results = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT
        id, title, slug, type, "listingType", price, "rentPerMonth",
        "carpetArea", "superArea", floor, "totalFloors", location, city,
        amenities, furnished, possession, facing, parking, washrooms,
        "mainImageUrl", "isFeatured", "isExclusive",
      (
        (CASE WHEN ${nearMetroVal}::boolean AND ('Metro' = ANY(amenities) OR location ILIKE '%Metro%') THEN 10 ELSE 0 END) +
        (CASE WHEN ${maxPriceVal}::numeric IS NOT NULL AND (price < ${maxPriceVal}::numeric * 0.9 OR "rentPerMonth" < ${maxPriceVal}::numeric * 0.9) THEN 10 ELSE 5 END) +
        (CASE WHEN ${intentVal}::text = 'investment' AND "listingType" = 'SALE' THEN 10 ELSE 
              CASE WHEN ${intentVal}::text = 'self_use' AND "listingType" = 'RENT' THEN 10 ELSE 5 END
         END)
      ) as score
      FROM "Property"
      WHERE "isActive" = true
      AND (${maxPriceVal}::numeric IS NULL OR price <= ${maxPriceVal}::numeric OR "rentPerMonth" <= ${maxPriceVal}::numeric)
      AND (${locationVal}::text IS NULL OR city ILIKE ${locationVal} OR location ILIKE ${locationVal})
      ORDER BY score DESC
      LIMIT 20;
    `;

    return NextResponse.json({ properties: results });
  } catch (error: unknown) {
    // HIGH-8: Don't leak internal error messages
    console.error('Database Search Error:', error);
    return NextResponse.json({ error: 'An error occurred while searching properties.' }, { status: 500 });
  }
}
