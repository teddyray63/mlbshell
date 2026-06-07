'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import TodoMarker from '@/components/ui/TodoMarker';

const LineMovementChart = dynamic(() => import('@/charts/LineMovementChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={200} />,
});

// TODO: Replace mock game with real game selection from bettingService
const featuredGame = {
  id: 'game-001',
  away: 'NYY',
  home: 'BOS',
  time: '7:10 PM ET',
  total: 8.5,
  movement: '+1.0 since open',
  steamMove: true,
};

export default function BettingLineMovement() {
  return (
    <div className="space-y-3">
      <TodoMarker
        pageName="BettingIntelligence LineMovement"
        description="Pass real game ID to bettingService.fetchBettingLines() and feed result into LineMovementChart."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Chart — spans 2 cols */}
        <div className="card-surface p-4 lg:col-span-2">
          <SectionHeader
            title="Line Movement"
            subtitle={`${featuredGame.away} @ ${featuredGame.home} — Total ${featuredGame.total}`}
            actions={
              featuredGame.steamMove ? (
                <StatusBadge variant="warning" dot>
                  Steam Move
                </StatusBadge>
              ) : null
            }
            className="mb-3"
          />
          <LineMovementChart height={200} />
          <p className="text-xs text-muted-foreground mt-2 font-mono-data">
            Opening total: 7.5 → Current: {featuredGame.total} ({featuredGame.movement})
          </p>
        </div>

        {/* Game context panel */}
        <div className="card-surface p-4 flex flex-col gap-4">
          <SectionHeader title="Game Context" subtitle={featuredGame.time} />

          <div className="space-y-3 text-sm">
            {[
              { label: 'Away', value: featuredGame.away, badge: null },
              { label: 'Home', value: featuredGame.home, badge: null },
              { label: 'Total', value: String(featuredGame.total), badge: null },
              { label: 'Movement', value: featuredGame.movement, badge: 'warning' as const },
              { label: 'Sharp Action', value: '68% Over', badge: 'sharp' as const },
              { label: 'Public %', value: '54% Under', badge: 'square' as const },
            ].map((row) => (
              <div key={`ctx-${row.label}`} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                {row.badge ? (
                  <StatusBadge variant={row.badge}>{row.value}</StatusBadge>
                ) : (
                  <span className="font-mono-data text-xs font-semibold text-foreground">
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              TODO: Wire game selector to pull context dynamically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
