/**
 * Noida sector adjacency map and location utilities.
 * Used by the candidate retriever to expand location searches
 * when the user's preferred sector has few results.
 */

/**
 * Maps each sector to its adjacent/nearby sectors.
 * This is a curated subset of Noida's most commercially active sectors.
 * Sectors not listed here are treated as having no known neighbors.
 */
const SECTOR_ADJACENCY: Record<string, string[]> = {
  // Central Noida (Commercial Hub)
  'Sector 18': ['Sector 16', 'Sector 17', 'Sector 15', 'Sector 19', 'Sector 20', 'Sector 16A'],
  'Sector 16': ['Sector 15', 'Sector 17', 'Sector 18', 'Sector 16A', 'Sector 16B'],
  'Sector 15': ['Sector 14', 'Sector 16', 'Sector 18', 'Sector 15A'],

  // IT/Business Corridor (Sectors 58-68)
  'Sector 58': ['Sector 59', 'Sector 57', 'Sector 63', 'Sector 62'],
  'Sector 59': ['Sector 58', 'Sector 60', 'Sector 63', 'Sector 62'],
  'Sector 60': ['Sector 59', 'Sector 61', 'Sector 63'],
  'Sector 61': ['Sector 60', 'Sector 62', 'Sector 63'],
  'Sector 62': ['Sector 61', 'Sector 63', 'Sector 58', 'Sector 59', 'Sector 64'],
  'Sector 63': ['Sector 62', 'Sector 64', 'Sector 58', 'Sector 59', 'Sector 60', 'Sector 61'],
  'Sector 64': ['Sector 63', 'Sector 65', 'Sector 62'],
  'Sector 65': ['Sector 64', 'Sector 66', 'Sector 63'],
  'Sector 66': ['Sector 65', 'Sector 67', 'Sector 68'],
  'Sector 67': ['Sector 66', 'Sector 68'],
  'Sector 68': ['Sector 66', 'Sector 67'],

  // Noida Expressway Corridor
  'Sector 94': ['Sector 95', 'Sector 93', 'Sector 96'],
  'Sector 95': ['Sector 94', 'Sector 96', 'Sector 93'],
  'Sector 96': ['Sector 95', 'Sector 97', 'Sector 94'],
  'Sector 97': ['Sector 96', 'Sector 98'],
  'Sector 98': ['Sector 97', 'Sector 99'],

  // Industrial / Warehousing Belt
  'Sector 1': ['Sector 2', 'Sector 3', 'Sector 4', 'Sector 5'],
  'Sector 2': ['Sector 1', 'Sector 3', 'Sector 4'],
  'Sector 3': ['Sector 2', 'Sector 4', 'Sector 1'],
  'Sector 4': ['Sector 3', 'Sector 5', 'Sector 2'],
  'Sector 5': ['Sector 4', 'Sector 6', 'Sector 1'],
  'Sector 6': ['Sector 5', 'Sector 7', 'Sector 8'],
  'Sector 7': ['Sector 6', 'Sector 8'],
  'Sector 8': ['Sector 7', 'Sector 9', 'Sector 6'],

  // Greater Noida (emerging commercial)
  'Sector 132': ['Sector 133', 'Sector 131', 'Sector 135'],
  'Sector 133': ['Sector 132', 'Sector 134', 'Sector 135'],
  'Sector 134': ['Sector 133', 'Sector 135'],
  'Sector 135': ['Sector 132', 'Sector 133', 'Sector 134', 'Sector 136'],
  'Sector 136': ['Sector 135', 'Sector 137'],
  'Sector 137': ['Sector 136', 'Sector 138', 'Sector 142'],
  'Sector 140': ['Sector 141', 'Sector 142', 'Sector 143'],
  'Sector 142': ['Sector 140', 'Sector 143', 'Sector 137'],
  'Sector 143': ['Sector 142', 'Sector 144', 'Sector 140'],
  'Sector 144': ['Sector 143', 'Sector 145'],

  // Named areas
  'Noida Expressway': ['Sector 94', 'Sector 95', 'Sector 96', 'Sector 97', 'Sector 98'],
  'Greater Noida': ['Sector 132', 'Sector 133', 'Sector 134', 'Sector 135', 'Knowledge Park'],
  'Knowledge Park': ['Greater Noida', 'Sector 132'],
  'Film City': ['Sector 16A', 'Sector 16B', 'Sector 18'],
  'Electronic City': ['Sector 62', 'Sector 63'],
};

/**
 * Get nearby sectors for a given location string.
 * Handles both "Sector XX" format and named areas.
 */
export function getNearbySectors(location: string): string[] {
  // Normalize input
  const normalized = location.trim();

  // Direct lookup
  if (SECTOR_ADJACENCY[normalized]) {
    return SECTOR_ADJACENCY[normalized];
  }

  // Try case-insensitive match
  const lowerInput = normalized.toLowerCase();
  for (const [key, neighbors] of Object.entries(SECTOR_ADJACENCY)) {
    if (key.toLowerCase() === lowerInput) {
      return neighbors;
    }
  }

  // Try partial match (e.g., "62" → "Sector 62")
  const sectorMatch = normalized.match(/(\d+)/);
  if (sectorMatch) {
    const sectorKey = `Sector ${sectorMatch[1]}`;
    if (SECTOR_ADJACENCY[sectorKey]) {
      return SECTOR_ADJACENCY[sectorKey];
    }
  }

  return [];
}

/**
 * Expand a list of user-preferred locations to include nearby sectors.
 * Returns deduped array with original locations first, then neighbors.
 */
export function expandLocations(locations: string[]): string[] {
  const expanded = new Set(locations);

  for (const loc of locations) {
    const nearby = getNearbySectors(loc);
    for (const n of nearby) {
      expanded.add(n);
    }
  }

  return Array.from(expanded);
}

/**
 * Extract sector number from a location string (e.g., "Sector 62, Noida" → 62).
 */
export function extractSectorNumber(location: string): number | null {
  const match = location.match(/Sector\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Compute a rough similarity score between two location strings.
 * Returns 0-100 where 100 = exact match.
 */
export function locationSimilarity(userLocation: string, propertyLocation: string): number {
  const userLower = userLocation.toLowerCase();
  const propLower = propertyLocation.toLowerCase();

  // Exact match
  if (propLower.includes(userLower) || userLower.includes(propLower)) {
    return 100;
  }

  // Adjacent sector
  const nearby = getNearbySectors(userLocation);
  for (const n of nearby) {
    if (propLower.includes(n.toLowerCase())) {
      return 75;
    }
  }

  // Same city
  if (propLower.includes('noida') && userLower.includes('noida')) {
    return 30;
  }

  return 10;
}
