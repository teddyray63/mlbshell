'use client';

/**
 * GameFilter.tsx — Reusable game filter component
 * Allows selecting a specific game from today's slate.
 */

import React from 'react';
import type { MLBGame } from '@/data/mlbGames';

interface GameFilterProps {
  games: MLBGame[];
  value: string; // game id, '' = All
  onChange: (gameId: string) => void;
  loading?: boolean;
  className?: string;
  showLabel?: boolean;
}

export default function GameFilter({
  games,
  value,
  onChange,
  loading = false,
  className = '',
  showLabel = false,
}: GameFilterProps) {
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && <span className="text-xs text-muted-foreground">Game:</span>}
        <div className="h-9 w-48 bg-muted rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && <span className="text-xs text-muted-foreground whitespace-nowrap">Game:</span>}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">All Games</option>
        {games.map((g) => (
          <option key={g.id} value={g.id}>
            {g.awayTeam} @ {g.homeTeam}
            {g.status === 'live' ? ' 🔴' : g.status === 'final' ? ' ✓' : ` · ${g.time}`}
          </option>
        ))}
      </select>
    </div>
  );
}
