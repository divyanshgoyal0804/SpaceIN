'use client';

import { useThemeStore } from '@/store/themeStore';
import { Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [rotation, setRotation] = useState(0);

  function handleClick() {
    setRotation((prev) => prev + 360);
    toggleTheme();
  }

  return (
    <button
      onClick={handleClick}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div
        className="theme-toggle-icon"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {theme === 'dark' ? (
          <Sun size={18} strokeWidth={2} />
        ) : (
          <Moon size={18} strokeWidth={2} />
        )}
      </div>

      <style jsx>{`
        .theme-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-primary);
        }

        .theme-toggle:hover {
          border-color: var(--border-hover, var(--text-muted));
          color: var(--accent);
        }

        .theme-toggle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </button>
  );
}
