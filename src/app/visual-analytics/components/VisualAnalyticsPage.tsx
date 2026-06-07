'use client';

import React, { useMemo } from 'react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import MetricCard from '@/components/ui/MetricCard';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient, { type StatLeaderEntry } from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import BarrelRateBarChart from '@/charts/BarrelRateBarChart';
import LineMovementChart from '@/charts/LineMovementChart';
import PitcherRadarChart from '@/charts/PitcherRadarChart';
import WobaAreaChart from '@/charts/WobaAreaChart';
import ExitVeloDistributionChart from '@/charts/ExitVeloDistributionChart';
import type { AnalyticsData, MatchupGame } from '../../../../shared/types';

function short(name: string): string {
  const parts = name.split(',');
  return parts.length > 1 ? parts[0].trim() : name.split(' ').slice(-1)[0];
}

export default function VisualAnalyticsPage() {
  const { data, loading, error } = useApi<AnalyticsData>(() => apiClient.getAnalytics(), []);
  const barrel = useApi<StatLeaderEntry[]>(() => apiClient.getStatcastLeaderboard('barrel'), []);
  const exitVelo = useApi<StatLeaderEntry[]>(
    () => apiClient.getStatcastLeaderboard('exitVelo'),
    []
  );
  const xwoba = useApi<StatLeaderEntry[]>(() => apiClient.getStatcastLeaderboard('xwoba'), []);
  const games = useApi(() => apiClient.getGames(), []);
  const firstGameId = games.data?.[0]?.id ?? '';
  const matchup = useApi<MatchupGame | null>(
    () => (firstGameId ? apiClient.getMatchup(firstGameId) : Promise.resolve(null)),
    [firstGameId]
  );

  // Real Statcast barrel% per hitter (chart expects fraction).
  const barrelData = useMemo(
    () => (barrel.data ?? []).slice(0, 8).map((d) => ({ name: short(d.name), pct: d.value / 100 })),
    [barrel.data]
  );

  // Real xwOBA leaderboard plotted as the wOBA series.
  const wobaData = useMemo(
    () => (xwoba.data ?? []).slice(0, 8).map((d) => ({ date: short(d.name), woba: d.value })),
    [xwoba.data]
  );

  const exitVeloData = useMemo(
    () => (exitVelo.data ?? []).slice(0, 8).map((d) => ({ name: short(d.name), value: d.value })),
    [exitVelo.data]
  );

  // Real pitcher splits → radar, scaled to 0-100 percentiles.
  const radarData = useMemo(() => {
    const season = matchup.data?.pitchers?.[0]?.splits?.find((s) => s.split === 'Season');
    if (!season) {
      return (data?.pitcherRadar ?? []).map((r) => ({ stat: r.metric, value: r.value }));
    }
    const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
    return [
      { stat: 'K%', value: clamp(((season.kPct ?? 22) / 35) * 100) },
      { stat: 'WHIFF%', value: clamp(((season.whiffPct ?? 25) / 40) * 100) },
      { stat: 'SWSTR%', value: clamp(((season.swstrPct ?? 11) / 18) * 100) },
      { stat: 'PUTAWAY%', value: clamp(((season.putawayPct ?? 18) / 30) * 100) },
      { stat: 'BB% (inv)', value: clamp(100 - ((season.bbPct ?? 8) / 15) * 100) },
      { stat: 'HR/9 (inv)', value: clamp(100 - ((season.hr9 ?? 1.1) / 2) * 100) },
    ];
  }, [matchup.data, data]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Visual Analytics" subtitle="Charts, trends, and visual breakdowns" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-5 px-6 py-5">
        {error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {error}
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ChartSkeleton key={`kpi-${i}`} height={92} />
              ))
            : (data?.cards ?? []).map((c) => (
                <MetricCard
                  key={c.id}
                  label={c.label}
                  value={c.value}
                  trend={c.trend}
                  trendLabel={c.change}
                />
              ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard title="xwOBA Leaders" subtitle="Expected wOBA — real Statcast leaders">
            {xwoba.loading ? <ChartSkeleton height={220} /> : <WobaAreaChart data={wobaData} />}
          </ChartCard>

          <ChartCard title="Barrel% Leaders" subtitle="Barrels per batted-ball event (Statcast)">
            {barrel.loading ? (
              <ChartSkeleton height={220} />
            ) : (
              <BarrelRateBarChart data={barrelData} />
            )}
          </ChartCard>

          <ChartCard title="Exit Velocity Distribution" subtitle="Average EV by hitter (Statcast)">
            {exitVelo.loading ? (
              <ChartSkeleton height={220} />
            ) : (
              <ExitVeloDistributionChart data={exitVeloData} />
            )}
          </ChartCard>

          <ChartCard
            title="Pitcher Profile"
            subtitle={
              matchup.data?.pitchers?.[0]?.name
                ? `${matchup.data.pitchers[0].name} — season percentiles`
                : 'Percentile radar across key metrics'
            }
          >
            {matchup.loading ? (
              <ChartSkeleton height={220} />
            ) : (
              <PitcherRadarChart data={radarData} />
            )}
          </ChartCard>

          <ChartCard title="Line Movement" subtitle="Over/Under total across the day">
            {loading ? (
              <ChartSkeleton height={220} />
            ) : (
              <LineMovementChart data={data?.lineMovement} />
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-surface p-4">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="mt-3">{children}</div>
    </div>
  );
}
