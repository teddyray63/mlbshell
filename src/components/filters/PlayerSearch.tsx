'use client';

/**
 * PlayerSearch.tsx — Reusable player search/filter component
 * Searches all active MLB players by name, team, or position.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { searchPlayers, type MLBPlayer } from '@/data/mlbPlayers';

interface PlayerSearchProps {
  value: string;
  onChange: (value: string) => void;
  onPlayerSelect?: (player: MLBPlayer) => void;
  placeholder?: string;
  className?: string;
  showDropdown?: boolean;
  filterType?: 'all' | 'batter' | 'pitcher';
}

export default function PlayerSearch({
  value,
  onChange,
  onPlayerSelect,
  placeholder = 'Search player or team…',
  className = '',
  showDropdown = true,
  filterType = 'all',
}: PlayerSearchProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<MLBPlayer[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDropdown) return;
    if (value.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    const found = searchPlayers(value, 12).filter(
      (p) => filterType === 'all' || p.type === filterType || p.type === 'two-way'
    );
    setResults(found);
    setOpen(found.length > 0);
  }, [value, showDropdown, filterType]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback(
    (player: MLBPlayer) => {
      onChange(player.name);
      onPlayerSelect?.(player);
      setOpen(false);
    },
    [onChange, onPlayerSelect]
  );

  const handleClear = useCallback(() => {
    onChange('');
    setOpen(false);
  }, [onChange]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.trim() && setOpen(results.length > 0)}
        placeholder={placeholder}
        className="w-full pl-8 pr-8 py-2 rounded-md bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md bg-card border border-border shadow-lg max-h-56 overflow-y-auto">
          {results.map((player) => (
            <button
              key={player.id}
              onClick={() => handleSelect(player)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between gap-2"
            >
              <span className="font-medium text-foreground truncate">{player.name}</span>
              <span className="text-xs text-muted-foreground font-mono-data flex-shrink-0">
                {player.team} · {player.position}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
