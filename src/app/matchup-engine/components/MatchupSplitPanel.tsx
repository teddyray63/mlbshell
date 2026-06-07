'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import TodoMarker from '@/components/ui/TodoMarker';

const PitcherRadarChart = dynamic(() => import('@/charts/PitcherRadarChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={220} />,
});

// TODO: Replace with real matchup result from analyticsService.fetchMatchup()
const mockPitcher = {
  name: 'Gerrit Cole',
  team: 'NYY',
  hand: 'R',
  era: 3.12,
  fip: 2.98,
  whip: 1.08,
  k9: 11.4,
  bb9: 2.1,
  swStrPct: 14.2,
  gbPct: 38.1,
  hrPer9: 0.9,
};

const mockBatter = {
  name: 'Manny Ramirez Jr.',
  team: 'LAD',
  hand: 'R',
  avgVsRHP: '.288',
  obpVsRHP: '.361',
  slgVsRHP: '.498',
  wobaVsRHP: '.368',
  kPctVsRHP: 24.1,
  bbPctVsRHP: 11.3,
  isoVsRHP: '.210',
  barrelPct: 13.1,
};

const mockAdvantage = {
  score: 62,
  direction: 'pitcher' as const,
  label: 'Pitcher Advantage',
};

const pitcherStats = [
  { label: 'ERA', value: mockPitcher.era.toFixed(2) },
  { label: 'FIP', value: mockPitcher.fip.toFixed(2) },
  { label: 'WHIP', value: mockPitcher.whip.toFixed(2) },
  { label: 'K/9', value: mockPitcher.k9.toFixed(1) },
  { label: 'BB/9', value: mockPitcher.bb9.toFixed(1) },
  { label: 'SwStr%', value: `${mockPitcher.swStrPct}%` },
  { label: 'GB%', value: `${mockPitcher.gbPct}%` },
  { label: 'HR/9', value: mockPitcher.hrPer9.toFixed(1) },
];

const batterStats = [
  { label: 'AVG vs RHP', value: mockBatter.avgVsRHP },
  { label: 'OBP vs RHP', value: mockBatter.obpVsRHP },
  { label: 'SLG vs RHP', value: mockBatter.slgVsRHP },
  { label: 'wOBA vs RHP', value: mockBatter.wobaVsRHP },
  { label: 'K% vs RHP', value: `${mockBatter.kPctVsRHP}%` },
  { label: 'BB% vs RHP', value: `${mockBatter.bbPctVsRHP}%` },
  { label: 'ISO vs RHP', value: mockBatter.isoVsRHP },
  { label: 'Barrel%', value: `${mockBatter.barrelPct}%` },
];

export default function MatchupSplitPanel() {
  return (
    <div className="space-y-3">
      <TodoMarker
        pageName="MatchupEngine SplitPanel"
        description="Replace mockPitcher and mockBatter with real data from analyticsService.fetchMatchup(). Advantage score should come from your matchup scoring algorithm."
      />

      {/* Advantage banner */}
      <div className="card-surface p-3 flex items-center justify-between border-l-2 border-primary">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Matchup Score
          </span>
          <span className="font-mono-data text-2xl font-bold text-primary">
            {mockAdvantage.score}
          </span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant="info">{mockAdvantage.label}</StatusBadge>
          <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${mockAdvantage.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Split panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-3">
        {/* Pitcher panel */}
        <div className="card-surface p-4">
          <SectionHeader
            title={mockPitcher.name}
            subtitle={`${mockPitcher.team} · ${mockPitcher.hand}HP · Starting Pitcher`}
            actions={<StatusBadge variant="info">{mockPitcher.hand}HP</StatusBadge>}
            className="mb-4"
          />
          <PitcherRadarChart height={220} />
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {pitcherStats.map((s) => (
              <div
                key={`ps-${s.label}`}
                className="flex items-center justify-between border-b border-border/50 pb-1.5"
              >
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="font-mono-data text-xs font-semibold text-foreground">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Batter panel */}
        <div className="card-surface p-4">
          <SectionHeader
            title={mockBatter.name}
            subtitle={`${mockBatter.team} · ${mockBatter.hand}HB · Platoon splits vs RHP`}
            actions={<StatusBadge variant="warning">{mockBatter.hand}HB</StatusBadge>}
            className="mb-4"
          />

          {/* Spray chart placeholder */}
          <div className="rounded-md bg-muted border border-border/50 flex items-center justify-center h-[220px] mb-4">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-muted-foreground/20 mx-auto mb-2 flex items-center justify-center">
                <span className="text-muted-foreground text-xs">◎</span>
              </div>
              <p className="text-xs text-muted-foreground">Spray chart placeholder</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                TODO: Render real spray chart here
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {batterStats.map((s) => (
              <div
                key={`bs-${s.label}`}
                className="flex items-center justify-between border-b border-border/50 pb-1.5"
              >
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="font-mono-data text-xs font-semibold text-foreground">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
