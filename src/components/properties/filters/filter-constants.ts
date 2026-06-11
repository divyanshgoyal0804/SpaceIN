/**
 * Shared constants for property filter components.
 * Extracted from PropertyFilters.tsx to be reusable across filter sub-components.
 */

export const PROPERTY_TYPES = [
  { value: 'OFFICE', label: 'Office' },
  { value: 'COWORKING', label: 'Coworking' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'SHOWROOM', label: 'Showroom' },
  { value: 'PLOT', label: 'Plot' },
];

export const FURNISHED_OPTIONS = [
  { value: 'FURNISHED', label: 'Furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
  { value: 'BARE_SHELL', label: 'Bare Shell' },
];

export const FACING_MAP: Record<string, string> = {
  NORTH: 'N',
  NORTH_EAST: 'NE',
  EAST: 'E',
  SOUTH_EAST: 'SE',
  SOUTH: 'S',
  SOUTH_WEST: 'SW',
  WEST: 'W',
  NORTH_WEST: 'NW',
};

export const FACING_GRID = [
  ['NORTH_WEST', 'NORTH', 'NORTH_EAST'],
  ['WEST', null, 'EAST'],
  ['SOUTH_WEST', 'SOUTH', 'SOUTH_EAST'],
];

export const FACING_LABELS: Record<string, string> = {
  NORTH: 'North',
  NORTH_EAST: 'North-East',
  EAST: 'East',
  SOUTH_EAST: 'South-East',
  SOUTH: 'South',
  SOUTH_WEST: 'South-West',
  WEST: 'West',
  NORTH_WEST: 'North-West',
};

export const AMENITIES_LIST = [
  '24x7 Security', 'Power Backup',
  'Parking', 'High-Speed Internet',
  'CCTV', 'Cafeteria',
  'Conference Room', 'Reception',
  'Housekeeping', 'Fire Safety',
  'Lift', 'Air Conditioning',
  'Generator Backup', 'Loading/Unloading Bay',
  'Corner Plot', 'Main Road Facing',
];

export const NOIDA_LOCATIONS = [
  ...Array.from({ length: 168 }, (_, i) => `Sector ${i + 1}`),
  'Noida Expressway', 'Greater Noida', 'Knowledge Park',
  'Film City', 'Electronic City', 'Sector 18 Market',
  'DLF Mall Road', 'Noida City Centre',
];

export const RENT_PRESETS = [
  { label: 'Under ₹25K', min: undefined, max: 25000 },
  { label: '₹25K–50K', min: 25000, max: 50000 },
  { label: '₹50K–1L', min: 50000, max: 100000 },
  { label: 'Above ₹1L', min: 100000, max: undefined },
];

export const SALE_PRESETS = [
  { label: 'Under ₹50L', min: undefined, max: 5000000 },
  { label: '₹50L–1Cr', min: 5000000, max: 10000000 },
  { label: '₹1Cr–5Cr', min: 10000000, max: 50000000 },
  { label: 'Above ₹5Cr', min: 50000000, max: undefined },
];

export const AREA_PRESETS = [
  { label: 'Under 500', min: undefined, max: 500 },
  { label: '500–1000', min: 500, max: 1000 },
  { label: '1K–2.5K', min: 1000, max: 2500 },
  { label: '2.5K–5K', min: 2500, max: 5000 },
  { label: '5K+', min: 5000, max: undefined },
];
