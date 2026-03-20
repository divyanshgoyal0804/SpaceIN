/**
 * Format a number in Indian notation (e.g., 1,20,000)
 */
export function formatIndianPrice(num: number): string {
  const str = Math.round(num).toString();
  if (str.length <= 3) return str;

  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
}

/**
 * Format price with ₹ symbol and /month suffix for rent
 */
export function formatPrice(price: number | null | undefined, isRent: boolean = false): string {
  if (!price) return 'Price on Request';
  const formatted = formatIndianPrice(price);
  return `₹${formatted}${isRent ? '/month' : ''}`;
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

/**
 * Calculate estimated read time from word count
 */
export function calculateReadTime(content: string): number {
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(wordCount / 200);
}

/**
 * Truncate text to a given length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * cn utility for merging class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Property type display names
 */
export const propertyTypeLabels: Record<string, string> = {
  OFFICE: 'Office',
  COWORKING: 'Coworking',
  RETAIL: 'Retail',
  WAREHOUSE: 'Warehouse',
  SHOWROOM: 'Showroom',
  PLOT: 'Plot',
};

/**
 * Furnished type display names
 */
export const furnishedTypeLabels: Record<string, string> = {
  FURNISHED: 'Furnished',
  SEMI_FURNISHED: 'Semi-Furnished',
  BARE_SHELL: 'Bare Shell',
};

/**
 * Listing type display names
 */
export const listingTypeLabels: Record<string, string> = {
  SALE: 'For Sale',
  RENT: 'For Rent',
  BOTH: 'Sale & Rent',
};

/**
 * All amenities list
 */
export const allAmenities = [
  '24x7 Security',
  'Power Backup',
  'Parking',
  'High-Speed Internet',
  'CCTV',
  'Cafeteria',
  'Conference Room',
  'Reception',
  'Housekeeping',
  'Fire Safety',
  'Lift',
  'Air Conditioning',
  'Generator Backup',
  'Loading/Unloading Bay',
  'Corner Plot',
  'Main Road Facing',
];

/**
 * All facing directions
 */
export const facingDirections = [
  'North',
  'South',
  'East',
  'West',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
];
