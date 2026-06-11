/**
 * Barrel export for filter sub-components.
 * 3.5: These were extracted from the monolithic PropertyFilters.tsx (52KB).
 * 
 * Components can be imported individually for tree-shaking:
 *   import FilterSection from '@/components/properties/filters/FilterSection';
 * 
 * Or from this barrel:
 *   import { FilterSection, RangeInputGroup, LocationSearch } from '@/components/properties/filters';
 */

export { default as FilterSection } from './FilterSection';
export { default as RangeInputGroup } from './RangeInputGroup';
export { default as LocationSearch } from './LocationSearch';
export * from './filter-constants';
