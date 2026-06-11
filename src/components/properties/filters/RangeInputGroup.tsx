'use client';

import { useEffect, useState } from 'react';
import { formatIndianPrice } from '@/lib/utils';

const DEBOUNCE_MS = 400;

function parseIndianNumber(str: string): number | null {
  const cleaned = str.replace(/[₹,\s]/g, '');
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? null : n;
}

function formatDisplayValue(num: number | null): string {
  if (num === null || num === undefined) return '';
  return formatIndianPrice(num);
}

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * Reusable range input group with min/max fields, presets, and debouncing.
 */
export default function RangeInputGroup({
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
