'use client';

import React, { useState, useCallback } from 'react';
import Topbar from '@/components/Topbar';
import MatchupSelector from './MatchupSelector';
import MatchupSplitPanel from './MatchupSplitPanel';
import MatchupWeatherStrip from './MatchupWeatherStrip';

export interface Pitcher {
  id: string;
  name: string;
  team: string;
  hand: string;
  era: string;
  fip?: string;
  whip?: string;
  k9?: string;
  bb9?: string;
  swStrPct?: string;
  gbPct?: string;
  hrPer9?: string;
}

export interface Batter {
  id: string;
  name: string;
  team: string;
  hand: string;
  avg: string;
  obp?: string;
  slg?: string;
  woba?: string;
  kPct?: string;
  bbPct?: string;
  iso?: string;
  barrelPct?: string;
}

export default function MatchupEnginePage() {
  const [pitcher, setPitcher] = useState<Pitcher | null>(null);
  const [batter, setBatter] = useState<Batter | null>(null);

  const handlePitcherChange = useCallback((p: Pitcher) => setPitcher(p), []);
  const handleBatterChange = useCallback((b: Batter) => setBatter(b), []);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Matchup Engine"
        subtitle="Pitcher vs. batter analysis with park and weather context"
      />
      <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-5">
        <MatchupSelector
          onPitcherChange={handlePitcherChange}
          onBatterChange={handleBatterChange}
        />
        <MatchupSplitPanel pitcher={pitcher} batter={batter} />
        <MatchupWeatherStrip venueId="yankee-stadium" />
      </div>
    </div>
  );
}