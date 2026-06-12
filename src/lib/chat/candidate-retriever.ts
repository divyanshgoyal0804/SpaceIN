/**
 * Candidate Retriever with Adaptive Search.
 * 
 * Replaces hard SQL filters with soft-constraint Prisma queries.
 * Implements progressive expansion when results are sparse.
 * Always returns a meaningful candidate set — never "no properties found."
 */

import { prisma } from '@/lib/prisma';
import { ChatIntent } from './intent-extractor';
import { expandLocations } from './noida-locations';

export interface PropertyCandidate {
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
  amenities: string[];
  furnished: string;
  possession: string | null;
  facing: string | null;
  parking: number | null;
  washrooms: number | null;
  mainImageUrl: string;
  isFeatured: boolean;
  isExclusive: boolean;
}

// Budget tolerance multipliers by flexibility level
const BUDGET_TOLERANCE: Record<string, number> = {
  strict: 1.05,     // +5%
  moderate: 1.15,   // +15%
  flexible: 1.25,   // +25%
};

const MIN_CANDIDATES = 5;
const TARGET_CANDIDATES = 30;
const MAX_CANDIDATES = 50;

/**
 * Retrieve candidate properties using soft constraints from the extracted intent.
 * Implements adaptive search — progressively loosens constraints if results are sparse.
 */
export async function retrieveCandidates(
  intent: ChatIntent,
): Promise<PropertyCandidate[]> {
  // Phase 1: Try with all soft constraints
  let candidates = await queryWithConstraints(intent, 'initial');

  if (candidates.length >= MIN_CANDIDATES) {
    return candidates.slice(0, MAX_CANDIDATES);
  }

  // Phase 2: Expand budget tolerance
  candidates = await queryWithConstraints(intent, 'expanded-budget');
  if (candidates.length >= MIN_CANDIDATES) {
    return candidates.slice(0, MAX_CANDIDATES);
  }

  // Phase 3: Expand location + budget
  candidates = await queryWithConstraints(intent, 'expanded-location');
  if (candidates.length >= MIN_CANDIDATES) {
    return candidates.slice(0, MAX_CANDIDATES);
  }

  // Phase 4: Remove location constraint entirely, keep type + budget
  candidates = await queryWithConstraints(intent, 'no-location');
  if (candidates.length >= MIN_CANDIDATES) {
    return candidates.slice(0, MAX_CANDIDATES);
  }

  // Phase 5: Fallback — just get active properties sorted by quality
  candidates = await queryWithConstraints(intent, 'fallback');
  return candidates.slice(0, MAX_CANDIDATES);
}

type ExpansionLevel = 'initial' | 'expanded-budget' | 'expanded-location' | 'no-location' | 'fallback';

async function queryWithConstraints(
  intent: ChatIntent,
  level: ExpansionLevel,
): Promise<PropertyCandidate[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isActive: true };

  // Property type — always a hard constraint (if specified)
  if (intent.propertyType && intent.propertyType.length > 0) {
    where.type = intent.propertyType.length === 1
      ? intent.propertyType[0]
      : { in: intent.propertyType };
  }

  // Listing type — hard constraint
  if (intent.listingType && intent.listingType !== 'BOTH') {
    where.listingType = intent.listingType;
  }

  // Budget — soft constraint with tolerance
  if (level !== 'fallback') {
    const budgetMax = intent.budgetMax;
    if (budgetMax) {
      const toleranceMultiplier = level === 'expanded-budget' || level === 'expanded-location' || level === 'no-location'
        ? 1.30 // +30% for expanded search
        : BUDGET_TOLERANCE[intent.budgetFlexibility] || 1.15;
      const expandedMax = Math.round(budgetMax * toleranceMultiplier);

      // Apply to the appropriate price field based on listing type
      if (intent.listingType === 'SALE') {
        where.price = { lte: expandedMax };
        if (intent.budgetMin) {
          where.price.gte = Math.round(intent.budgetMin * 0.8); // -20% floor
        }
      } else {
        // Default to rent
        where.OR = [
          { rentPerMonth: { lte: expandedMax, ...(intent.budgetMin ? { gte: Math.round(intent.budgetMin * 0.8) } : {}) } },
          { price: { lte: expandedMax, ...(intent.budgetMin ? { gte: Math.round(intent.budgetMin * 0.8) } : {}) } },
        ];
      }
    }
  }

  // Location — soft constraint with expansion
  if (level !== 'no-location' && level !== 'fallback' && intent.locations.length > 0) {
    const searchLocations = level === 'expanded-location' || level === 'expanded-budget'
      ? expandLocations(intent.locations) // include adjacent sectors
      : intent.locations;

    // Use OR with ILIKE for flexible matching
    // Don't overwrite existing OR (from budget)
    const locationConditions = searchLocations.map((loc) => ({
      location: { contains: loc, mode: 'insensitive' as const },
    }));

    if (where.OR) {
      // Combine budget OR with location: budget conditions must pair with location
      const budgetOr = where.OR;
      delete where.OR;
      where.AND = [
        { OR: budgetOr },
        { OR: locationConditions },
      ];
    } else {
      where.OR = locationConditions;
    }
  }

  // Carpet area — soft constraint
  if (level !== 'fallback' && (intent.carpetAreaMin || intent.carpetAreaMax)) {
    where.carpetArea = {};
    if (intent.carpetAreaMin) where.carpetArea.gte = intent.carpetAreaMin * 0.8;
    if (intent.carpetAreaMax) where.carpetArea.lte = intent.carpetAreaMax * 1.2;
  }

  // Furnished — soft constraint (drop at expanded levels)
  if (level === 'initial' && intent.furnished) {
    where.furnished = intent.furnished;
  }

  const take = level === 'fallback' ? MIN_CANDIDATES * 2 : TARGET_CANDIDATES;

  const properties = await prisma.property.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      type: true,
      listingType: true,
      price: true,
      rentPerMonth: true,
      carpetArea: true,
      superArea: true,
      floor: true,
      totalFloors: true,
      location: true,
      city: true,
      amenities: true,
      furnished: true,
      possession: true,
      facing: true,
      parking: true,
      washrooms: true,
      mainImageUrl: true,
      isFeatured: true,
      isExclusive: true,
    },
    orderBy: [
      { isFeatured: 'desc' },
      { isExclusive: 'desc' },
      { createdAt: 'desc' },
    ],
    take,
  });

  return properties as PropertyCandidate[];
}
