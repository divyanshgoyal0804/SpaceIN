'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
import { NOIDA_LOCATIONS } from './filter-constants';

/**
 * Location search with typeahead and chip-based multi-select.
 */
export default function LocationSearch({
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
