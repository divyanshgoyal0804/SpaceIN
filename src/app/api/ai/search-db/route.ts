import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const filters = await req.json();
    const { bhk, max_price, location, near_metro, intent } = filters;

    const maxPriceVal = max_price ? Number(max_price) : null;
    const locationVal = location ? `%${location}%` : null;
    const nearMetroVal = near_metro || false;
    const intentVal = intent || null;

    const results = await prisma.$queryRaw<any[]>`
      SELECT *,
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
  } catch (error: any) {
    console.error('Database Search Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
