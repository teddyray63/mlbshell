'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import { RefreshCw } from 'lucide-react';

const LineMovementChart = dynamic(() => import('@/charts/LineMovementChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={200} />,
});

interface GameContext {
  id: string;
  away: string;
  home: string;
  time: string;
  total: number;
  movement: string;
  steamMove: boolean;
  sharpPct: string;
  publicPct: string;
}

export default function BettingLineMovement() {
  const [game, setGame] = useState<GameContext | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGame = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/games?date=${today}`);
      const json = await res.json();
      const games = json.games ?? [];
      if (games.length > 0) {
        const g = games[0];
        setGame({
          id: g.id,
          away: g.awayTeam,
          home: g.homeTeam,
          time: g.time,
          total: 8.5,
          movement: '+1.0 since open',
          steamMove: true,
          sharpPct: '68% Over',
          publicPct: '54% Under',
        });
      }
    } catch {
      // fallback
      setGame({
        id: 'game-001',
        away: 'NYY',
        home: 'BOS',
        time: '7:10 PM ET',
        total: 8.5,
        movement: '+1.0 since open',
        steamMove: true,
        sharpPct: '68% Over',
        publicPct: '54% Under',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGame(); }, [loadGame]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Chart — spans 2 cols */}
        <div className="card-surface p-4 lg:col-span-2">
          <SectionHeader
            title="Line Movement"
            subtitle={game ? `${game.away} @ ${game.home} — Total ${game.total}` : 'Loading…'}
            actions={
              game?.steamMove
                ? <StatusBadge variant="warning" dot>Steam Move</StatusBadge>
                : null
            }
            className="mb-3"
          />
          <LineMovementChart height={200} />
          {game && (
            <p className="text-xs text-muted-foreground mt-2 font-mono-data">
              Opening total: 7.5 → Current: {game.total} ({game.movement})
            </p>
          )}
        </div>

        {/* Game context panel */}
        <div className="card-surface p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <SectionHeader title="Game Context" subtitle={game?.time ?? '—'} />
            <button
              onClick={loadGame}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : game ? (
            <div className="space-y-3 text-sm">
              {[
                { label: 'Away',         value: game.away,       badge: null },
                { label: 'Home',         value: game.home,       badge: null },
                { label: 'Total',        value: String(game.total), badge: null },
                { label: 'Movement',     value: game.movement,   badge: 'warning' as const },
                { label: 'Sharp Action', value: game.sharpPct,   badge: 'sharp' as const },
                { label: 'Public %',     value: game.publicPct,  badge: 'square' as const },
              ].map((row) => (
                <div key={`ctx-${row.label}`} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  {row.badge
                    ? <StatusBadge variant={row.badge}>{row.value}</StatusBadge>
                    : <span className="font-mono-data text-xs font-semibold text-foreground">{row.value}</span>
                  }
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}