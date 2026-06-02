'use client';

import React, { useState } from 'react';
import { Search, Zap } from 'lucide-react';

// TODO: Replace static lists with real player search from analyticsService
const MOCK_PITCHERS = [
  { id: 'pitcher-001', name: 'Gerrit Cole',        team: 'NYY', hand: 'R', era: '3.12' },
  { id: 'pitcher-002', name: 'Spencer Strider',    team: 'ATL', hand: 'R', era: '2.87' },
  { id: 'pitcher-003', name: 'Kodai Senga',        team: 'NYM', hand: 'R', era: '3.41' },
  { id: 'pitcher-004', name: 'Logan Webb',         team: 'SF',  hand: 'R', era: '3.03' },
  { id: 'pitcher-005', name: 'Framber Valdez',     team: 'HOU', hand: 'L', era: '2.94' },
];

const MOCK_BATTERS = [
  { id: 'batter-001', name: 'Manny Ramirez Jr.',  team: 'LAD', hand: 'R', avg: '.301' },
  { id: 'batter-002', name: 'Rafael Ortega III',  team: 'ATL', hand: 'R', avg: '.312' },
  { id: 'batter-003', name: 'Elias Fontaine',     team: 'STL', hand: 'L', avg: '.307' },
  { id: 'batter-004', name: 'Jaime Castillo',     team: 'MIN', hand: 'R', avg: '.295' },
  { id: 'batter-005', name: 'Tomás Vidal',        team: 'SD',  hand: 'S', avg: '.289' },
];

export default function MatchupSelector() {
  const [pitcher, setPitcher] = useState(MOCK_PITCHERS?.[0]);
  const [batter,  setBatter]  = useState(MOCK_BATTERS?.[0]);

  return (
    <div className="card-surface p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        {/* Pitcher selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            Pitcher
          </label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={pitcher?.id}
              onChange={(e) => {
                const found = MOCK_PITCHERS?.find((p) => p?.id === e?.target?.value);
                if (found) setPitcher(found);
              }}
              className="w-full pl-8 pr-3 py-2.5 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
            >
              {MOCK_PITCHERS?.map((p) => (
                <option key={p?.id} value={p?.id}>
                  {p?.name} ({p?.team}) — {p?.hand}HP — ERA {p?.era}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono-data">{pitcher?.team}</span>
            <span>·</span>
            <span>{pitcher?.hand}HP</span>
            <span>·</span>
            <span className="font-mono-data">ERA {pitcher?.era}</span>
          </div>
        </div>

        {/* VS badge */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-info-subtle border border-primary/30 flex items-center justify-center">
            <Zap size={16} className="text-primary" />
          </div>
        </div>

        {/* Batter selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            Batter
          </label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={batter?.id}
              onChange={(e) => {
                const found = MOCK_BATTERS?.find((b) => b?.id === e?.target?.value);
                if (found) setBatter(found);
              }}
              className="w-full pl-8 pr-3 py-2.5 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
            >
              {MOCK_BATTERS?.map((b) => (
                <option key={b?.id} value={b?.id}>
                  {b?.name} ({b?.team}) — {b?.hand}HB — AVG {b?.avg}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono-data">{batter?.team}</span>
            <span>·</span>
            <span>{batter?.hand}HB</span>
            <span>·</span>
            <span className="font-mono-data">AVG {batter?.avg}</span>
          </div>
        </div>
      </div>
    </div>
  );
}