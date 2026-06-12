/**
 * Property Ranking Engine.
 * 
 * Scores and ranks candidate properties before sending to the LLM.
 * Multi-dimensional scoring ensures the LLM receives already-ranked
 * candidates with match explanations, so it can focus on comparison
 * and consultant-style advice.
 */

import { ChatIntent } from './intent-extractor';
import { PropertyCandidate } from './candidate-retriever';
import { locationSimilarity } from './noida-locations';

/**
 * A ranked property with its score and match explanations.
 */
export interface RankedProperty extends PropertyCandidate {
  score: number;                  // 0-100 composite score
  matchReasons: string[];         // human-readable match explanations
  budgetNote: string | null;      // e.g., "₹2,000 above your budget"
}

// Scoring weights (must sum to 1.0)
const WEIGHTS = {
  budget: 0.25,
  location: 0.20,
  amenities: 0.12,
  quality: 0.13,
  type: 0.10,
  area: 0.08,
  workspace: 0.12,  // coworking/managed office relevance
};

const TOP_N = 10; // Send this many ranked candidates to the LLM

/**
 * Rank candidates against user intent. Returns top N with scores and explanations.
 */
export function rankCandidates(
  candidates: PropertyCandidate[],
  intent: ChatIntent,
  userPreferences?: {
    preferredLocations?: string[];
    preferredAmenities?: string[];
    preferredTypes?: string[];
  } | null,
): RankedProperty[] {
  if (candidates.length === 0) return [];

  const scored = candidates.map((property) => {
    const budgetScore = scoreBudget(property, intent);
    const locationScore = scoreLocation(property, intent, userPreferences?.preferredLocations);
    const amenitiesScore = scoreAmenities(property, intent, userPreferences?.preferredAmenities);
    const qualityScore = scoreQuality(property);
    const typeScore = scoreType(property, intent, userPreferences?.preferredTypes);
    const areaScore = scoreArea(property, intent);
    const workspaceScore = scoreWorkspace(property, intent);

    const compositeScore = Math.round(
      budgetScore.score * WEIGHTS.budget +
      locationScore * WEIGHTS.location +
      amenitiesScore.score * WEIGHTS.amenities +
      qualityScore * WEIGHTS.quality +
      typeScore * WEIGHTS.type +
      areaScore * WEIGHTS.area +
      workspaceScore.score * WEIGHTS.workspace
    );

    // Build match reasons
    const matchReasons: string[] = [];
    if (budgetScore.score >= 80) matchReasons.push('Within your budget');
    else if (budgetScore.score >= 50) matchReasons.push('Close to your budget');
    if (locationScore >= 80) matchReasons.push('In your preferred location');
    else if (locationScore >= 60) matchReasons.push('Near your preferred location');
    if (amenitiesScore.matchedCount > 0) {
      matchReasons.push(`Has ${amenitiesScore.matchedCount} of your desired amenities`);
    }
    if (property.isFeatured) matchReasons.push('Featured property');
    if (property.isExclusive) matchReasons.push('Exclusive listing');
    if (property.furnished === 'FURNISHED') matchReasons.push('Fully furnished');
    if (workspaceScore.note) matchReasons.push(workspaceScore.note);

    return {
      ...property,
      score: compositeScore,
      matchReasons,
      budgetNote: budgetScore.note,
    };
  });

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, TOP_N);
}

/**
 * Budget scoring (0-100).
 * Properties within budget get 100, slight overages get partial credit.
 */
function scoreBudget(
  property: PropertyCandidate,
  intent: ChatIntent,
): { score: number; note: string | null } {
  if (!intent.budgetMax) return { score: 50, note: null }; // No budget preference

  const propertyPrice = intent.listingType === 'SALE'
    ? property.price
    : property.rentPerMonth || property.price;

  if (!propertyPrice) return { score: 40, note: 'Price on request' };

  const ratio = propertyPrice / intent.budgetMax;

  if (ratio <= 1.0) {
    // Under budget — excellent
    return { score: 100, note: null };
  } else if (ratio <= 1.05) {
    // Up to 5% over — good
    const overAmount = propertyPrice - intent.budgetMax;
    return {
      score: 85,
      note: `₹${formatCompact(overAmount)} above your budget (${Math.round((ratio - 1) * 100)}% over)`,
    };
  } else if (ratio <= 1.15) {
    // 5-15% over — moderate
    const overAmount = propertyPrice - intent.budgetMax;
    return {
      score: 65,
      note: `₹${formatCompact(overAmount)} above your budget (${Math.round((ratio - 1) * 100)}% over), but offers additional value`,
    };
  } else if (ratio <= 1.30) {
    // 15-30% over — low but still included
    const overAmount = propertyPrice - intent.budgetMax;
    return {
      score: 35,
      note: `₹${formatCompact(overAmount)} above your budget — included as a premium alternative`,
    };
  } else {
    return {
      score: 10,
      note: `Significantly above budget — shown for comparison`,
    };
  }
}

/**
 * Location scoring (0-100).
 * Uses the sector adjacency map for proximity scoring.
 */
function scoreLocation(
  property: PropertyCandidate,
  intent: ChatIntent,
  userPreferredLocations?: string[],
): number {
  if (intent.locations.length === 0 && (!userPreferredLocations || userPreferredLocations.length === 0)) {
    return 50; // No location preference
  }

  const allPreferred = [
    ...intent.locations,
    ...(userPreferredLocations || []),
  ];

  // Find best match across all preferred locations
  let bestScore = 0;
  for (const preferred of allPreferred) {
    const similarity = locationSimilarity(preferred, property.location);
    bestScore = Math.max(bestScore, similarity);
  }

  return bestScore;
}

/**
 * Amenities scoring (0-100).
 * Boosting, not filtering — more matched amenities = higher score.
 */
function scoreAmenities(
  property: PropertyCandidate,
  intent: ChatIntent,
  userPreferredAmenities?: string[],
): { score: number; matchedCount: number } {
  const desired = [
    ...intent.amenities,
    ...(userPreferredAmenities || []),
  ];

  if (desired.length === 0) return { score: 50, matchedCount: 0 };

  const propertyAmenities = new Set(
    property.amenities.map((a) => a.toLowerCase())
  );

  let matched = 0;
  for (const amenity of desired) {
    if (propertyAmenities.has(amenity.toLowerCase())) {
      matched++;
    }
  }

  const uniqueDesired = new Set(desired.map((d) => d.toLowerCase())).size;
  const ratio = matched / uniqueDesired;

  return {
    score: Math.round(30 + ratio * 70), // 30 base + up to 70 from matches
    matchedCount: matched,
  };
}

/**
 * Property quality scoring (0-100).
 * Based on featured status, exclusive status, furnishing.
 */
function scoreQuality(property: PropertyCandidate): number {
  let score = 50; // Base

  if (property.isFeatured) score += 20;
  if (property.isExclusive) score += 15;
  if (property.furnished === 'FURNISHED') score += 10;
  else if (property.furnished === 'SEMI_FURNISHED') score += 5;

  // Bonus for having parking and washrooms
  if (property.parking && property.parking > 0) score += 3;
  if (property.washrooms && property.washrooms > 0) score += 2;

  return Math.min(score, 100);
}

/**
 * Property type match scoring (0-100).
 */
function scoreType(
  property: PropertyCandidate,
  intent: ChatIntent,
  userPreferredTypes?: string[],
): number {
  if (!intent.propertyType && (!userPreferredTypes || userPreferredTypes.length === 0)) {
    return 50;
  }

  const preferred = [
    ...(intent.propertyType || []),
    ...(userPreferredTypes || []),
  ];

  return preferred.includes(property.type) ? 100 : 20;
}

/**
 * Carpet area match scoring (0-100).
 */
function scoreArea(property: PropertyCandidate, intent: ChatIntent): number {
  if (!intent.carpetAreaMin && !intent.carpetAreaMax) return 50;

  const area = property.carpetArea;
  if (!area) return 30;

  if (intent.carpetAreaMin && intent.carpetAreaMax) {
    if (area >= intent.carpetAreaMin && area <= intent.carpetAreaMax) return 100;
    if (area >= intent.carpetAreaMin * 0.8 && area <= intent.carpetAreaMax * 1.2) return 70;
    return 30;
  }

  if (intent.carpetAreaMin) {
    return area >= intent.carpetAreaMin ? 100 : area >= intent.carpetAreaMin * 0.8 ? 70 : 30;
  }

  if (intent.carpetAreaMax) {
    return area <= intent.carpetAreaMax ? 100 : area <= intent.carpetAreaMax * 1.2 ? 70 : 30;
  }

  return 50;
}

/**
 * Workspace style scoring (0-100).
 * Boosts properties that match the user's workspace preference
 * (coworking, managed office, traditional lease).
 * Also scores seat capacity when user specifies seat count.
 */
function scoreWorkspace(
  property: PropertyCandidate,
  intent: ChatIntent,
): { score: number; note: string | null } {
  if (!intent.workspaceStyle && !intent.seatCount) {
    return { score: 50, note: null };
  }

  let score = 50;
  let note: string | null = null;

  // Workspace style matching
  if (intent.workspaceStyle) {
    switch (intent.workspaceStyle) {
      case 'coworking':
        if (property.type === 'COWORKING') {
          score += 40;
          note = 'Coworking space — matches your preference';
        } else if (property.type === 'OFFICE' && property.furnished === 'FURNISHED') {
          score += 20;
          note = 'Furnished office — could work as managed workspace';
        }
        break;
      case 'managed_office':
        if (property.type === 'OFFICE' && property.furnished === 'FURNISHED') {
          score += 40;
          note = 'Furnished office — suitable for managed/serviced setup';
        } else if (property.type === 'COWORKING') {
          score += 25;
          note = 'Coworking space — private cabins available';
        }
        break;
      case 'traditional_lease':
        if (property.type === 'OFFICE' && (property.furnished === 'BARE_SHELL' || property.furnished === 'SEMI_FURNISHED')) {
          score += 40;
          note = 'Traditional lease space';
        } else if (property.type === 'OFFICE') {
          score += 20;
        }
        break;
      case 'virtual_office':
        // Virtual offices are rare in property listings; just don't penalize
        score += 10;
        break;
    }
  }

  // Seat capacity estimation from carpet area
  // Rule of thumb: ~70-100 sq ft per seat in coworking/managed office
  if (intent.seatCount && property.carpetArea) {
    const estimatedSeats = Math.floor(property.carpetArea / 80);
    const seatRatio = estimatedSeats / intent.seatCount;

    if (seatRatio >= 0.8 && seatRatio <= 1.5) {
      score += 10; // Good fit
      if (!note) note = `Can accommodate ~${estimatedSeats} seats`;
    } else if (seatRatio >= 0.5) {
      score += 5;
    }
  }

  return { score: Math.min(score, 100), note };
}

function formatCompact(amount: number): string {
  if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(1)} Cr`;
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)} Lakh`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString('en-IN');
}

/**
 * Format ranked properties for the LLM system prompt.
 * Produces a compact, informative summary that helps the LLM
 * give consultant-style recommendations.
 */
export function formatRankedForPrompt(ranked: RankedProperty[]): string {
  if (ranked.length === 0) return 'No candidate properties were found for this query.';

  return ranked
    .map((p, i) => {
      const price = p.rentPerMonth
        ? `₹${p.rentPerMonth.toLocaleString('en-IN')}/month`
        : p.price
          ? `₹${p.price.toLocaleString('en-IN')}`
          : 'Price on request';

      // Estimate seat capacity for office/coworking properties
      const estimatedSeats = (p.type === 'COWORKING' || p.type === 'OFFICE') && p.carpetArea
        ? `~${Math.floor(p.carpetArea / 80)} seats capacity`
        : null;

      const details = [
        `${p.type}`,
        `${p.listingType}`,
        price,
        `${p.carpetArea} sq ft`,
        estimatedSeats,
        p.location,
        p.furnished,
        p.amenities.length > 0 ? `Amenities: ${p.amenities.slice(0, 5).join(', ')}` : null,
        p.isFeatured ? '⭐ FEATURED' : null,
        p.isExclusive ? '🔒 EXCLUSIVE' : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const reasons = p.matchReasons.length > 0
        ? `Match reasons: ${p.matchReasons.join('; ')}`
        : '';

      const budgetNote = p.budgetNote ? `Budget note: ${p.budgetNote}` : '';

      return `#${i + 1} [ID:${p.id}] ${p.title} (Score: ${p.score}/100)
${details}
${reasons}
${budgetNote}`.trim();
    })
    .join('\n\n');
}
