'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import EmptyState from '@/components/ui/EmptyState';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import { formatGameTime } from '@/utils/formatters';
import type { Game } from '../../../../shared/types';

type Tab = 'upcoming' | 'live' | 'final';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function GamesPage() {
  const router = useRouter();
  const [date, setDate] = useState(todayStr());
  const [tab, setTab] = useState<Tab>('upcoming');
  const { data, loading, error, reload } = useApi<Game[]>(() => apiClient.getGames(date), [date]);

  // Auto-refresh every 60s during game hours (1pm–11pm ET ≈ broad window).
  React.useEffect(() => {
    const id = setInterval(reload, 60_000);
    return () => clearInterval(id);
  }, [reload]);

  const games = useMemo(() => data ?? [], [data]);

  const counts = useMemo(
    () => ({
      upcoming: games.filter((g) => g.status === 'scheduled' || g.status === 'postponed').length,
      live: games.filter((g) => g.status === 'live').length,
      final: games.filter((g) => g.status === 'final').length,
    }),
    [games]
  );

  const filtered = useMemo(() => {
    if (tab === 'live') return games.filter((g) => g.status === 'live');
    if (tab === 'final') return games.filter((g) => g.status === 'final');
    return games.filter((g) => g.status === 'scheduled' || g.status === 'postponed');
  }, [games, tab]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Games" subtitle="Today's MLB slate — click any game for the full breakdown" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        {error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {error}
          </div>
        )}

        <div className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterChip
              label={`Upcoming (${counts.upcoming})`}
              active={tab === 'upcoming'}
              onClick={() => setTab('upcoming')}
            />
            <FilterChip
              label={`Live (${counts.live})`}
              active={tab === 'live'}
              onClick={() => setTab('live')}
            />
            <FilterChip
              label={`Final (${counts.final})`}
              active={tab === 'final'}
              onClick={() => setTab('final')}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChartSkeleton key={`g-skel-${i}`} height={120} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar size={32} />}
            title="No games"
            description={`No ${tab} games on ${date}.`}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((g) => (
              <button
                key={g.id}
                onClick={() => router.push(`/games/${g.id}`)}
                className="card-surface flex flex-col gap-3 p-4 text-left transition-colors hover:border-primary/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {g.venue}
                  </span>
                  {g.status === 'live' ? (
                    <StatusBadge variant="negative" dot>
                      {g.inning || 'Live'}
                    </StatusBadge>
                  ) : g.status === 'final' ? (
                    <StatusBadge variant="neutral">Final</StatusBadge>
                  ) : (
                    <StatusBadge variant="info">{formatGameTime(g.gameTime)}</StatusBadge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">{g.awayTeam}</div>
                    <div className="text-sm font-semibold text-foreground">{g.homeTeam}</div>
                  </div>
                  {(g.status === 'live' || g.status === 'final') && (
                    <div className="space-y-1 text-right font-mono-data text-lg font-bold text-foreground">
                      <div>{g.awayScore ?? 0}</div>
                      <div>{g.homeScore ?? 0}</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
                  <span>
                    {g.awayTeam} @ {g.homeTeam}
                  </span>
                  {g.overUnder != null && (
                    <span className="font-mono-data">O/U {g.overUnder.toFixed(1)}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
