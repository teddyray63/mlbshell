'use client';

/**
 * TeamFilter.tsx — Reusable team filter component
 * Filters by MLB team abbreviation.
 */

import React from 'react';
import { getAllTeams, MLB_TEAM_FULL_NAMES } from '@/data/mlbPlayers';

interface TeamFilterProps {
  value: string; // '' = All
  onChange: (team: string) => void;
  className?: string;
  showLabel?: boolean;
  variant?: 'tabs' | 'select';
}

const TEAMS = ['All', ...getAllTeams()];

export default function TeamFilter({
  value,
  onChange,
  className = '',
  showLabel = false,
  variant = 'select',
}: TeamFilterProps) {
  if (variant === 'tabs') {
    // Compact tab-style for small sets
    const COMMON_TEAMS = ['All', 'NYY', 'LAD', 'ATL', 'HOU', 'PHI', 'BOS', 'BAL', 'TEX', 'SD', 'SF'];
    return (
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        {showLabel && <span className="text-xs text-muted-foreground self-center mr-1">Team:</span>}
        {COMMON_TEAMS.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t === 'All' ? '' : t)}
            className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
              (t === 'All' && !value) || value === t
                ? 'bg-primary text-primary-foreground border-primary' :'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && <span className="text-xs text-muted-foreground whitespace-nowrap">Team:</span>}
      <select
        value={value || 'All'}
        onChange={(e) => onChange(e.target.value === 'All' ? '' : e.target.value)}
        className="px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="All">All Teams</option>
        {getAllTeams().map((t) => (
          <option key={t} value={t}>
            {t} — {MLB_TEAM_FULL_NAMES[t]}
          </option>
        ))}
      </select>
    </div>
  );
}
