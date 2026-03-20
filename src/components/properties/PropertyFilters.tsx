'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X, SlidersHorizontal, Search } from 'lucide-react';
import { formatIndianPrice } from '@/lib/utils';

// ─── Constants ──────────────────────────────────────────────────────
const DEBOUNCE_MS = 400;

const PROPERTY_TYPES = [
  { value: 'OFFICE', label: 'Office' },
  { value: 'COWORKING', label: 'Coworking' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'SHOWROOM', label: 'Showroom' },
  { value: 'PLOT', label: 'Plot' },
];

const FURNISHED_OPTIONS = [
  { value: 'FURNISHED', label: 'Furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
  { value: 'BARE_SHELL', label: 'Bare Shell' },
];

const FACING_MAP: Record<string, string> = {
  NORTH: 'N',
  NORTH_EAST: 'NE',
  EAST: 'E',
  SOUTH_EAST: 'SE',
  SOUTH: 'S',
  SOUTH_WEST: 'SW',
  WEST: 'W',
  NORTH_WEST: 'NW',
};

const FACING_GRID = [
  ['NORTH_WEST', 'NORTH', 'NORTH_EAST'],
  ['WEST', null, 'EAST'],
  ['SOUTH_WEST', 'SOUTH', 'SOUTH_EAST'],
];

const FACING_LABELS: Record<string, string> = {
  NORTH: 'North',
  NORTH_EAST: 'North-East',
  EAST: 'East',
  SOUTH_EAST: 'South-East',
  SOUTH: 'South',
  SOUTH_WEST: 'South-West',
  WEST: 'West',
  NORTH_WEST: 'North-West',
};

const AMENITIES_LIST = [
  '24x7 Security', 'Power Backup',
  'Parking', 'High-Speed Internet',
  'CCTV', 'Cafeteria',
  'Conference Room', 'Reception',
  'Housekeeping', 'Fire Safety',
  'Lift', 'Air Conditioning',
  'Generator Backup', 'Loading/Unloading Bay',
  'Corner Plot', 'Main Road Facing',
];

const NOIDA_LOCATIONS = [
  ...Array.from({ length: 168 }, (_, i) => `Sector ${i + 1}`),
  'Noida Expressway', 'Greater Noida', 'Knowledge Park',
  'Film City', 'Electronic City', 'Sector 18 Market',
  'DLF Mall Road', 'Noida City Centre',
];

const RENT_PRESETS = [
  { label: 'Under ₹25K', min: undefined, max: 25000 },
  { label: '₹25K–50K', min: 25000, max: 50000 },
  { label: '₹50K–1L', min: 50000, max: 100000 },
  { label: 'Above ₹1L', min: 100000, max: undefined },
];

const SALE_PRESETS = [
  { label: 'Under ₹50L', min: undefined, max: 5000000 },
  { label: '₹50L–1Cr', min: 5000000, max: 10000000 },
  { label: '₹1Cr–5Cr', min: 10000000, max: 50000000 },
  { label: 'Above ₹5Cr', min: 50000000, max: undefined },
];

const AREA_PRESETS = [
  { label: 'Under 500', min: undefined, max: 500 },
  { label: '500–1000', min: 500, max: 1000 },
  { label: '1K–2.5K', min: 1000, max: 2500 },
  { label: '2.5K–5K', min: 2500, max: 5000 },
  { label: '5K+', min: 5000, max: undefined },
];

// ─── Helpers ────────────────────────────────────────────────────────
function parseIndianNumber(str: string): number | null {
  const cleaned = str.replace(/[₹,\s]/g, '');
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? null : n;
}

function formatDisplayValue(num: number | null): string {
  if (num === null || num === undefined) return '';
  return formatIndianPrice(num);
}

// ─── Hook: useDebounce ──────────────────────────────────────────────
function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Accordion Section ─────────────────────────────────────────────
function FilterSection({
  title,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="pf-section">
      <button
        className="pf-section__header"
        onClick={() => setOpen(!open)}
        type="button"
        aria-expanded={open}
      >
        <span className="pf-section__title">
          {title}
          {badge && <span className="pf-section__badge">{badge}</span>}
        </span>
        <ChevronDown
          size={16}
          className="pf-section__chevron"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
          }}
        />
      </button>
      <div
        className="pf-section__body"
        style={{
          maxHeight: open ? '1000px' : '0',
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 300ms ease, opacity 200ms ease',
        }}
      >
        <div className="pf-section__content">{children}</div>
      </div>
    </div>
  );
}

// ─── Range Input Group ──────────────────────────────────────────────
function RangeInputGroup({
  label,
  minKey,
  maxKey,
  minValue,
  maxValue,
  presets,
  onUpdate,
  prefix = '₹',
}: {
  label: string;
  minKey: string;
  maxKey: string;
  minValue: string | null;
  maxValue: string | null;
  presets: { label: string; min?: number; max?: number }[];
  onUpdate: (key: string, value: string) => void;
  prefix?: string;
}) {
  const [localMin, setLocalMin] = useState(minValue || '');
  const [localMax, setLocalMax] = useState(maxValue || '');

  const debouncedMin = useDebounce(localMin, DEBOUNCE_MS);
  const debouncedMax = useDebounce(localMax, DEBOUNCE_MS);

  // Sync external → local when URL params change
  useEffect(() => {
    setLocalMin(minValue || '');
  }, [minValue]);
  useEffect(() => {
    setLocalMax(maxValue || '');
  }, [maxValue]);

  // Push debounced values to URL
  useEffect(() => {
    const parsed = parseIndianNumber(debouncedMin);
    onUpdate(minKey, parsed !== null ? String(parsed) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin]);

  useEffect(() => {
    const parsed = parseIndianNumber(debouncedMax);
    onUpdate(maxKey, parsed !== null ? String(parsed) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMax]);

  const handlePreset = (preset: { min?: number; max?: number }) => {
    setLocalMin(preset.min !== undefined ? String(preset.min) : '');
    setLocalMax(preset.max !== undefined ? String(preset.max) : '');
    // Immediately update URL for presets
    onUpdate(minKey, preset.min !== undefined ? String(preset.min) : '');
    onUpdate(maxKey, preset.max !== undefined ? String(preset.max) : '');
  };

  return (
    <div className="pf-range-group">
      <span className="pf-range-label">{label}</span>
      <div className="pf-range-inputs">
        <div className="pf-input-with-prefix">
          <span className="pf-input-prefix">{prefix}</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Min"
            className="pf-input"
            value={localMin ? formatDisplayValue(parseIndianNumber(localMin)) : ''}
            onChange={(e) => setLocalMin(e.target.value)}
          />
        </div>
        <span className="pf-range-separator">–</span>
        <div className="pf-input-with-prefix">
          <span className="pf-input-prefix">{prefix}</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Max"
            className="pf-input"
            value={localMax ? formatDisplayValue(parseIndianNumber(localMax)) : ''}
            onChange={(e) => setLocalMax(e.target.value)}
          />
        </div>
      </div>
      <div className="pf-presets">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`pf-preset ${
              (p.min !== undefined && String(p.min) === minValue) &&
              (p.max !== undefined && String(p.max) === maxValue)
                ? 'pf-preset--active'
                : (p.min === undefined && !minValue && p.max !== undefined && String(p.max) === maxValue)
                ? 'pf-preset--active'
                : (p.max === undefined && !maxValue && p.min !== undefined && String(p.min) === minValue)
                ? 'pf-preset--active'
                : ''
            }`}
            onClick={() => handlePreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Location Search ────────────────────────────────────────────────
function LocationSearch({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (loc: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return NOIDA_LOCATIONS.filter(
      (loc) => loc.toLowerCase().includes(q) && !selected.includes(loc)
    ).slice(0, 15);
  }, [query, selected]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="pf-location" ref={containerRef}>
      {selected.length > 0 && (
        <div className="pf-location__chips">
          {selected.map((loc) => (
            <span key={loc} className="pf-location__chip">
              {loc}
              <button type="button" onClick={() => onToggle(loc)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="pf-location__search-wrap">
        <Search size={14} className="pf-location__search-icon" />
        <input
          type="text"
          placeholder="Search sector, area..."
          className="pf-input pf-location__input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
      </div>
      {showDropdown && filtered.length > 0 && (
        <div className="pf-location__dropdown">
          {filtered.map((loc) => (
            <button
              key={loc}
              type="button"
              className="pf-location__option"
              onClick={() => {
                onToggle(loc);
                setQuery('');
                setShowDropdown(false);
              }}
            >
              {loc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Active Filter Chips (exported for use above grid) ──────────────
export function ActiveFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const removeFilter = useCallback(
    (key: string, valueToRemove?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (valueToRemove) {
        const current = params.get(key);
        if (current) {
          const arr = current.split(',').filter((v) => v !== valueToRemove);
          if (arr.length > 0) {
            params.set(key, arr.join(','));
          } else {
            params.delete(key);
          }
        }
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.replace(`/properties?${params.toString()}`);
    },
    [router, searchParams]
  );

  const chips: { label: string; key: string; value?: string }[] = [];

  const listing = searchParams.get('listing');
  if (listing) {
    const map: Record<string, string> = { SALE: 'Sale', RENT: 'Rent', BOTH: 'Both' };
    chips.push({ label: map[listing] || listing, key: 'listing' });
  }

  const type = searchParams.get('type');
  if (type) {
    type.split(',').forEach((t) => {
      const map: Record<string, string> = {
        OFFICE: 'Office', COWORKING: 'Coworking', RETAIL: 'Retail',
        WAREHOUSE: 'Warehouse', SHOWROOM: 'Showroom', PLOT: 'Plot',
      };
      chips.push({ label: map[t] || t, key: 'type', value: t });
    });
  }

  const minRent = searchParams.get('minRent');
  const maxRent = searchParams.get('maxRent');
  if (minRent || maxRent) {
    const minStr = minRent ? `₹${formatIndianPrice(parseInt(minRent))}` : '';
    const maxStr = maxRent ? `₹${formatIndianPrice(parseInt(maxRent))}` : '';
    const label = minStr && maxStr ? `${minStr}–${maxStr}/mo` : minStr ? `${minStr}+/mo` : `Up to ${maxStr}/mo`;
    chips.push({ label, key: 'minRent' });
  }

  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice || maxPrice) {
    const minStr = minPrice ? `₹${formatIndianPrice(parseInt(minPrice))}` : '';
    const maxStr = maxPrice ? `₹${formatIndianPrice(parseInt(maxPrice))}` : '';
    const label = minStr && maxStr ? `${minStr}–${maxStr}` : minStr ? `${minStr}+` : `Up to ${maxStr}`;
    chips.push({ label, key: 'minPrice' });
  }

  const minArea = searchParams.get('minArea');
  const maxArea = searchParams.get('maxArea');
  if (minArea || maxArea) {
    const label = minArea && maxArea ? `${minArea}–${maxArea} sq ft` : minArea ? `${minArea}+ sq ft` : `Up to ${maxArea} sq ft`;
    chips.push({ label, key: 'minArea' });
  }

  const minSuperArea = searchParams.get('minSuperArea');
  const maxSuperArea = searchParams.get('maxSuperArea');
  if (minSuperArea || maxSuperArea) {
    const label = `Super: ${minSuperArea || '0'}–${maxSuperArea || '∞'} sq ft`;
    chips.push({ label, key: 'minSuperArea' });
  }

  const minFloor = searchParams.get('minFloor');
  const maxFloor = searchParams.get('maxFloor');
  if (minFloor || maxFloor) {
    const label = `Floor ${minFloor || '0'}–${maxFloor || 'Any'}`;
    chips.push({ label, key: 'minFloor' });
  }

  const furnished = searchParams.get('furnished');
  if (furnished) {
    const map: Record<string, string> = {
      FURNISHED: 'Furnished', SEMI_FURNISHED: 'Semi-Furnished', BARE_SHELL: 'Bare Shell',
    };
    furnished.split(',').forEach((f) => {
      chips.push({ label: map[f] || f, key: 'furnished', value: f });
    });
  }

  const facing = searchParams.get('facing');
  if (facing) {
    facing.split(',').forEach((f) => {
      chips.push({ label: FACING_LABELS[f] || f, key: 'facing', value: f });
    });
  }

  const amenities = searchParams.get('amenities');
  if (amenities) {
    amenities.split(',').forEach((a) => {
      chips.push({ label: a, key: 'amenities', value: a });
    });
  }

  const minParking = searchParams.get('minParking');
  if (minParking) chips.push({ label: `${minParking}+ Parking`, key: 'minParking' });

  const minWashrooms = searchParams.get('minWashrooms');
  if (minWashrooms) chips.push({ label: `${minWashrooms}+ Washrooms`, key: 'minWashrooms' });

  const possession = searchParams.get('possession');
  if (possession) {
    chips.push({ label: possession === 'ready' ? 'Ready to Move' : 'Under Construction', key: 'possession' });
  }

  const locations = searchParams.get('locations');
  if (locations) {
    locations.split(',').forEach((l) => {
      chips.push({ label: l, key: 'locations', value: l });
    });
  }

  const featured = searchParams.get('featured');
  if (featured === 'true') chips.push({ label: 'Featured Only', key: 'featured' });

  if (chips.length === 0) return null;

  return (
    <div className="active-chips-row">
      {chips.map((chip, i) => (
        <span key={`${chip.key}-${chip.value || ''}-${i}`} className="active-chip">
          {chip.label}
          <button
            type="button"
            className="active-chip__remove"
            onClick={() => {
              if (chip.key === 'minRent') {
                removeFilter('minRent');
                removeFilter('maxRent');
              } else if (chip.key === 'minPrice') {
                removeFilter('minPrice');
                removeFilter('maxPrice');
              } else if (chip.key === 'minArea') {
                removeFilter('minArea');
                removeFilter('maxArea');
              } else if (chip.key === 'minSuperArea') {
                removeFilter('minSuperArea');
                removeFilter('maxSuperArea');
              } else if (chip.key === 'minFloor') {
                removeFilter('minFloor');
                removeFilter('maxFloor');
              } else {
                removeFilter(chip.key, chip.value);
              }
            }}
          >
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Utility: active count ──────────────────────────────────────────
export function getActiveFilterCount(searchParams: URLSearchParams): number {
  const keys = [
    'listing', 'type', 'minRent', 'maxRent', 'minPrice', 'maxPrice',
    'minArea', 'maxArea', 'minSuperArea', 'maxSuperArea', 'minFloor', 'maxFloor',
    'furnished', 'facing', 'amenities', 'minParking', 'minWashrooms',
    'possession', 'locations', 'featured',
  ];
  let count = 0;
  keys.forEach((k) => {
    if (searchParams.get(k)) count++;
  });
  return count;
}

// ═══════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMobile, setShowMobile] = useState(false);

  // ─── URL update helper ─────────────────────────────────────────
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.replace(`/properties?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleMulti = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(key)?.split(',').filter(Boolean) || [];
      const idx = current.indexOf(value);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(value);
      }
      if (current.length > 0) {
        params.set(key, current.join(','));
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.replace(`/properties?${params.toString()}`);
    },
    [router, searchParams]
  );

  const resetFilters = useCallback(() => {
    router.replace('/properties');
  }, [router]);

  // ─── Derived values ───────────────────────────────────────────
  const listing = searchParams.get('listing') || '';
  const typeParam = searchParams.get('type');
  const selectedTypes = typeParam ? typeParam.split(',') : [];
  const furnishedParam = searchParams.get('furnished');
  const selectedFurnished = furnishedParam ? furnishedParam.split(',') : [];
  const facingParam = searchParams.get('facing');
  const selectedFacing = facingParam ? facingParam.split(',') : [];
  const amenitiesParam = searchParams.get('amenities');
  const selectedAmenities = amenitiesParam ? amenitiesParam.split(',') : [];
  const locationsParam = searchParams.get('locations');
  const selectedLocations = locationsParam ? locationsParam.split(',') : [];
  const possession = searchParams.get('possession') || '';
  const featured = searchParams.get('featured') === 'true';
  const minParking = searchParams.get('minParking') || '';
  const minWashrooms = searchParams.get('minWashrooms') || '';

  const activeCount = getActiveFilterCount(searchParams);

  // Pricing context
  const showRent = listing !== 'SALE';
  const showSale = listing === 'SALE' || listing === 'BOTH';

  // ─── Floor local state (debounced) ─────────────────────────────
  const [localMinFloor, setLocalMinFloor] = useState(searchParams.get('minFloor') || '');
  const [localMaxFloor, setLocalMaxFloor] = useState(searchParams.get('maxFloor') || '');
  const debouncedMinFloor = useDebounce(localMinFloor, DEBOUNCE_MS);
  const debouncedMaxFloor = useDebounce(localMaxFloor, DEBOUNCE_MS);

  useEffect(() => { setLocalMinFloor(searchParams.get('minFloor') || ''); }, [searchParams]);
  useEffect(() => { setLocalMaxFloor(searchParams.get('maxFloor') || ''); }, [searchParams]);
  useEffect(() => { updateFilter('minFloor', debouncedMinFloor); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [debouncedMinFloor]);
  useEffect(() => { updateFilter('maxFloor', debouncedMaxFloor); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [debouncedMaxFloor]);

  // ─── Render ─────────────────────────────────────────────────────
  const filterContent = (
    <div className="pf-inner">
      {/* ── Header ── */}
      <div className="pf-header">
        <div className="pf-header__left">
          <SlidersHorizontal size={16} />
          <span className="pf-header__title">Filters</span>
          {activeCount > 0 && (
            <span className="pf-header__count">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button type="button" className="pf-header__clear" onClick={resetFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* ── 1. Listing Type ── */}
      <FilterSection title="Listing Type" defaultOpen>
        <div className="pf-toggle-group pf-toggle-group--3">
          {(['SALE', 'RENT', 'BOTH'] as const).map((lt) => (
            <button
              key={lt}
              type="button"
              className={`pf-toggle ${listing === lt ? 'pf-toggle--active' : ''}`}
              onClick={() => updateFilter('listing', listing === lt ? '' : lt)}
            >
              {lt === 'BOTH' ? 'Both' : lt === 'SALE' ? 'Sale' : 'Rent'}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── 2. Property Type ── */}
      <FilterSection title="Property Type" defaultOpen>
        <div className="pf-chip-grid">
          {PROPERTY_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`pf-chip ${selectedTypes.includes(value) ? 'pf-chip--active' : ''}`}
              onClick={() => toggleMulti('type', value)}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── 3. Budget / Pricing ── */}
      <FilterSection title="Budget / Pricing" defaultOpen>
        {showRent && (
          <RangeInputGroup
            label="Monthly Rent (₹)"
            minKey="minRent"
            maxKey="maxRent"
            minValue={searchParams.get('minRent')}
            maxValue={searchParams.get('maxRent')}
            presets={RENT_PRESETS}
            onUpdate={updateFilter}
          />
        )}
        {showRent && showSale && <div className="pf-divider" />}
        {showSale && (
          <RangeInputGroup
            label="Sale Price (₹)"
            minKey="minPrice"
            maxKey="maxPrice"
            minValue={searchParams.get('minPrice')}
            maxValue={searchParams.get('maxPrice')}
            presets={SALE_PRESETS}
            onUpdate={updateFilter}
          />
        )}
      </FilterSection>

      {/* ── 4. Area ── */}
      <FilterSection title="Area" defaultOpen>
        <RangeInputGroup
          label="Carpet Area (sq ft)"
          minKey="minArea"
          maxKey="maxArea"
          minValue={searchParams.get('minArea')}
          maxValue={searchParams.get('maxArea')}
          presets={AREA_PRESETS}
          onUpdate={updateFilter}
          prefix=""
        />
        <div style={{ marginTop: '1rem' }}>
          <RangeInputGroup
            label="Super / Built-up Area (sq ft)"
            minKey="minSuperArea"
            maxKey="maxSuperArea"
            minValue={searchParams.get('minSuperArea')}
            maxValue={searchParams.get('maxSuperArea')}
            presets={[]}
            onUpdate={updateFilter}
            prefix=""
          />
        </div>
      </FilterSection>

      {/* ── 5. Floor ── */}
      <FilterSection title="Floor">
        <div className="pf-range-inputs">
          <input
            type="number"
            min={0}
            placeholder="Ground"
            className="pf-input"
            value={localMinFloor}
            onChange={(e) => setLocalMinFloor(e.target.value)}
          />
          <span className="pf-range-separator">–</span>
          <input
            type="number"
            placeholder="Any"
            className="pf-input"
            value={localMaxFloor}
            onChange={(e) => setLocalMaxFloor(e.target.value)}
          />
        </div>
        <span className="pf-helper">0 = Ground floor</span>
      </FilterSection>

      {/* ── 6. Furnished Status ── */}
      <FilterSection title="Furnished Status" defaultOpen>
        <div className="pf-toggle-group pf-toggle-group--3">
          {FURNISHED_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`pf-toggle ${selectedFurnished.includes(value) ? 'pf-toggle--active' : ''}`}
              onClick={() => toggleMulti('furnished', value)}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── 7. Facing ── */}
      <FilterSection title="Facing">
        <div className="pf-compass">
          {FACING_GRID.map((row, ri) => (
            <div key={ri} className="pf-compass__row">
              {row.map((dir, ci) => {
                if (!dir) {
                  return <div key={ci} className="pf-compass__center" />;
                }
                return (
                  <button
                    key={dir}
                    type="button"
                    className={`pf-compass__btn ${selectedFacing.includes(dir) ? 'pf-compass__btn--active' : ''}`}
                    onClick={() => toggleMulti('facing', dir)}
                  >
                    {FACING_MAP[dir]}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </FilterSection>

      {/* ── 8. Amenities ── */}
      <FilterSection
        title="Amenities"
        badge={selectedAmenities.length > 0 ? `${selectedAmenities.length} selected` : undefined}
      >
        <div className="pf-amenity-grid">
          {AMENITIES_LIST.map((amenity) => (
            <label key={amenity} className="pf-checkbox">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => toggleMulti('amenities', amenity)}
              />
              <span className="pf-checkbox__box" />
              <span className="pf-checkbox__label">{amenity}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* ── 9. Parking & Washrooms ── */}
      <FilterSection title="Parking & Washrooms">
        <span className="pf-range-label">Parking Slots</span>
        <div className="pf-pill-row">
          {['1', '2', '3', '4'].map((n) => (
            <button
              key={n}
              type="button"
              className={`pf-pill ${minParking === n ? 'pf-pill--active' : ''}`}
              onClick={() => updateFilter('minParking', minParking === n ? '' : n)}
            >
              {n}+
            </button>
          ))}
        </div>
        <span className="pf-range-label" style={{ marginTop: '0.75rem' }}>Washrooms</span>
        <div className="pf-pill-row">
          {['1', '2', '3', '4'].map((n) => (
            <button
              key={n}
              type="button"
              className={`pf-pill ${minWashrooms === n ? 'pf-pill--active' : ''}`}
              onClick={() => updateFilter('minWashrooms', minWashrooms === n ? '' : n)}
            >
              {n}+
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── 10. Possession ── */}
      <FilterSection title="Possession">
        <div className="pf-pill-row">
          <button
            type="button"
            className={`pf-pill pf-pill--wide ${possession === 'ready' ? 'pf-pill--active' : ''}`}
            onClick={() => updateFilter('possession', possession === 'ready' ? '' : 'ready')}
          >
            Ready to Move
          </button>
          <button
            type="button"
            className={`pf-pill pf-pill--wide ${possession === 'underconstruction' ? 'pf-pill--active' : ''}`}
            onClick={() => updateFilter('possession', possession === 'underconstruction' ? '' : 'underconstruction')}
          >
            Under Construction
          </button>
        </div>
      </FilterSection>

      {/* ── 11. Location ── */}
      <FilterSection title="Location in Noida" defaultOpen>
        <LocationSearch
          selected={selectedLocations}
          onToggle={(loc) => toggleMulti('locations', loc)}
        />
      </FilterSection>

      {/* ── 12. Featured Only ── */}
      <FilterSection title="Featured Only">
        <label className="pf-switch">
          <input
            type="checkbox"
            checked={featured}
            onChange={() => updateFilter('featured', featured ? '' : 'true')}
          />
          <span className="pf-switch__track" />
          <span className="pf-switch__text">Show Featured Properties Only</span>
        </label>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="pf-mobile-toggle"
        onClick={() => setShowMobile(true)}
        type="button"
      >
        <SlidersHorizontal size={18} />
        Filters
        {activeCount > 0 && <span className="pf-mobile-toggle__badge">{activeCount}</span>}
      </button>

      {/* Desktop sidebar */}
      <aside className="pf-sidebar">{filterContent}</aside>

      {/* Mobile overlay / bottom drawer */}
      {showMobile && (
        <div className="pf-overlay" onClick={() => setShowMobile(false)}>
          <div className="pf-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pf-drawer__handle" />
            <div className="pf-drawer__head">
              <h3>Filters</h3>
              <button type="button" onClick={() => setShowMobile(false)}>
                <X size={20} />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      {/* ─── All Styles ──────────────────────────────────────────────── */}
      <style>{`
        /* ====== SIDEBAR (Desktop) ====== */
        .pf-sidebar {
          width: 280px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
          height: calc(100vh - 80px);
          overflow-y: auto;
          border-right: 1px solid var(--border);
          padding-right: 1rem;
        }

        /* ====== INNER WRAPPER ====== */
        .pf-inner {
          display: flex;
          flex-direction: column;
        }

        /* ====== HEADER ====== */
        .pf-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0 1rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 0.25rem;
        }
        .pf-header__left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pf-header__title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .pf-header__count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 9999px;
          background: var(--accent);
          color: #000;
        }
        .pf-header__clear {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--accent);
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.2s;
        }
        .pf-header__clear:hover { opacity: 0.7; }

        /* ====== SECTION ====== */
        .pf-section {
          border-bottom: 1px solid var(--border);
        }
        .pf-section__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0.85rem 0;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          color: var(--text-secondary);
        }
        .pf-section__title {
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pf-section__badge {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 9999px;
          background: rgba(var(--accent-rgb), 0.15);
          color: var(--accent);
          text-transform: none;
          letter-spacing: 0;
        }
        .pf-section__chevron {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .pf-section__content {
          padding-bottom: 0.85rem;
        }

        /* ====== TOGGLE GROUP ====== */
        .pf-toggle-group {
          display: flex;
          gap: 0.35rem;
        }
        .pf-toggle-group--3 .pf-toggle {
          flex: 1;
        }
        .pf-toggle {
          padding: 0.5rem 0.35rem;
          font-size: 0.78rem;
          font-weight: 500;
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          background: var(--glass-bg);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          text-align: center;
          white-space: nowrap;
        }
        .pf-toggle:hover {
          background: var(--glass-hover);
          color: var(--text-secondary);
        }
        .pf-toggle--active {
          background: var(--accent) !important;
          color: #000 !important;
          border-color: var(--accent) !important;
          box-shadow: 0 2px 12px rgba(var(--accent-rgb), 0.3);
        }

        /* ====== CHIP GRID ====== */
        .pf-chip-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem;
        }
        .pf-chip {
          padding: 0.45rem 0.5rem;
          font-size: 0.78rem;
          font-weight: 500;
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          text-align: center;
        }
        .pf-chip:hover {
          background: var(--glass-hover);
          color: var(--text-secondary);
        }
        .pf-chip--active {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(var(--accent-rgb), 0.08);
        }

        /* ====== RANGE INPUTS ====== */
        .pf-range-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .pf-range-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 0.15rem;
        }
        .pf-range-inputs {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .pf-range-separator {
          color: var(--text-muted);
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .pf-input-with-prefix {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .pf-input-with-prefix:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1);
        }
        .pf-input-prefix {
          padding: 0 0 0 8px;
          font-size: 0.8rem;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .pf-input-with-prefix .pf-input {
          border: none;
          background: transparent;
          border-radius: 0;
        }
        .pf-input-with-prefix .pf-input:focus {
          box-shadow: none;
        }
        .pf-input {
          flex: 1;
          min-width: 0;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.82rem;
          font-family: inherit;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s;
        }
        .pf-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1);
        }
        .pf-input::placeholder {
          color: var(--text-muted);
        }

        /* ====== PRESETS ====== */
        .pf-presets {
          display: flex;
          gap: 0.3rem;
          flex-wrap: wrap;
        }
        .pf-preset {
          padding: 0.3rem 0.6rem;
          font-size: 0.7rem;
          font-weight: 500;
          border: 1px solid var(--glass-border);
          border-radius: 9999px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          white-space: nowrap;
        }
        .pf-preset:hover {
          background: var(--glass-hover);
          color: var(--text-secondary);
        }
        .pf-preset--active {
          background: rgba(var(--accent-rgb), 0.12);
          border-color: var(--accent);
          color: var(--accent);
        }

        /* ====== HELPER TEXT ====== */
        .pf-helper {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
          display: block;
        }

        /* ====== DIVIDER ====== */
        .pf-divider {
          height: 1px;
          background: var(--border);
          margin: 0.75rem 0;
        }

        /* ====== COMPASS GRID (Facing) ====== */
        .pf-compass {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: fit-content;
          margin: 0 auto;
        }
        .pf-compass__row {
          display: flex;
          gap: 4px;
        }
        .pf-compass__btn, .pf-compass__center {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }
        .pf-compass__center {
          background: transparent;
        }
        .pf-compass__btn {
          font-size: 0.78rem;
          font-weight: 600;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .pf-compass__btn:hover {
          background: var(--glass-hover);
          color: var(--text-secondary);
        }
        .pf-compass__btn--active {
          background: var(--accent) !important;
          color: #000 !important;
          border-color: var(--accent) !important;
        }

        /* ====== AMENITIES ====== */
        .pf-amenity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem;
        }
        .pf-checkbox {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .pf-checkbox input[type="checkbox"] {
          display: none;
        }
        .pf-checkbox__box {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          border: 1.5px solid var(--glass-border);
          border-radius: 4px;
          background: var(--glass-bg);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .pf-checkbox input:checked + .pf-checkbox__box {
          background: var(--accent);
          border-color: var(--accent);
        }
        .pf-checkbox input:checked + .pf-checkbox__box::after {
          content: '';
          width: 4px;
          height: 8px;
          border: solid #000;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          margin-top: -1px;
        }
        .pf-checkbox__label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        /* ====== PILL BUTTONS ====== */
        .pf-pill-row {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
        .pf-pill {
          padding: 0.4rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 500;
          border: 1px solid var(--glass-border);
          border-radius: 9999px;
          background: var(--glass-bg);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .pf-pill--wide {
          flex: 1;
          text-align: center;
        }
        .pf-pill:hover {
          background: var(--glass-hover);
          color: var(--text-secondary);
        }
        .pf-pill--active {
          background: rgba(var(--accent-rgb), 0.12);
          border-color: var(--accent);
          color: var(--accent);
        }

        /* ====== LOCATION SEARCH ====== */
        .pf-location {
          position: relative;
        }
        .pf-location__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          margin-bottom: 0.5rem;
        }
        .pf-location__chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.55rem;
          font-size: 0.72rem;
          font-weight: 500;
          border-radius: 9999px;
          background: rgba(var(--accent-rgb), 0.1);
          color: var(--accent);
          border: 1px solid rgba(var(--accent-rgb), 0.25);
        }
        .pf-location__chip button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: var(--accent);
          display: flex;
          opacity: 0.7;
        }
        .pf-location__chip button:hover { opacity: 1; }
        .pf-location__search-wrap {
          position: relative;
        }
        .pf-location__search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .pf-location__input {
          padding-left: 30px !important;
        }
        .pf-location__dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 50;
          max-height: 180px;
          overflow-y: auto;
          margin-top: 4px;
          border-radius: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          box-shadow: 0 8px 24px var(--shadow);
        }
        .pf-location__option {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.55rem 0.75rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .pf-location__option:hover {
          background: var(--glass-hover);
          color: var(--text-primary);
        }

        /* ====== TOGGLE SWITCH ====== */
        .pf-switch {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
        }
        .pf-switch input { display: none; }
        .pf-switch__track {
          width: 40px;
          height: 22px;
          border-radius: 9999px;
          background: var(--glass-border);
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .pf-switch__track::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--text-muted);
          transition: all 0.2s;
        }
        .pf-switch input:checked + .pf-switch__track {
          background: var(--accent);
        }
        .pf-switch input:checked + .pf-switch__track::after {
          transform: translateX(18px);
          background: #000;
        }
        .pf-switch__text {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        /* ====== MOBILE TOGGLE BUTTON ====== */
        .pf-mobile-toggle {
          display: none;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.15rem;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          background: var(--glass-bg);
          color: var(--text-primary);
          cursor: pointer;
          font-family: inherit;
          position: sticky;
          top: 80px;
          z-index: 20;
          backdrop-filter: blur(12px);
        }
        .pf-mobile-toggle__badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          font-size: 0.68rem;
          font-weight: 700;
          border-radius: 9999px;
          background: var(--accent);
          color: #000;
        }

        /* ====== MOBILE OVERLAY & DRAWER ====== */
        .pf-overlay {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: rgba(0, 0, 0, 0.6);
          animation: pfFadeIn 0.2s ease;
        }
        .pf-drawer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-primary);
          border-radius: 20px 20px 0 0;
          max-height: 85vh;
          overflow-y: auto;
          padding: 0.5rem 1.25rem 2rem;
          animation: pfSlideUp 0.3s ease;
        }
        .pf-drawer__handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: var(--text-muted);
          margin: 0.5rem auto 0.75rem;
        }
        .pf-drawer__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .pf-drawer__head h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .pf-drawer__head button {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 4px;
        }

        /* ====== ACTIVE FILTER CHIPS ROW ====== */
        .active-chips-row {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          padding-bottom: 0.75rem;
          margin-bottom: 0.5rem;
          scrollbar-width: none;
        }
        .active-chips-row::-webkit-scrollbar { display: none; }
        .active-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 9999px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .active-chip__remove {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: var(--accent);
          opacity: 0.7;
          transition: opacity 0.15s;
        }
        .active-chip__remove:hover { opacity: 1; }

        /* ====== ANIMATIONS ====== */
        @keyframes pfFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pfSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 768px) {
          .pf-sidebar { display: none; }
          .pf-mobile-toggle { display: flex; }
        }
      `}</style>
    </>
  );
}
