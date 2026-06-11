'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Collapsible filter section with accordion behavior.
 */
export default function FilterSection({
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
