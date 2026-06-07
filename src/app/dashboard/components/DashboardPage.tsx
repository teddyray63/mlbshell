'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, CloudSun, Wind, ArrowRight } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import { formatEV } from '@/utils/formatters';
import type { Game, WeatherCondition, SavedEdge } from '../../../../shared/types';

const STATUS_BADGE: Record<Game['status'], 'positive' | 'neutral' | 'info'> = {
  live: 'positive',
  final: 'neutral',
  scheduled: 'info',
  postponed: 'neutral',
};

export default function DashboardPage() {
  const router = useRouter();
  const games = useApi<Game[]>(() => apiClient.getGames(), []);
  const weather = useApi<WeatherCondition[]>(() => apiClient.getAllWeather(), []);
  const edges = useApi<SavedEdge[]>(() => apiClient.getSavedEdges(), []);

  const alerts = useMemo(
    () => (weather.data ?? []).filter((w) => w.windImpact !== 'neutral'),
    [weather.data]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Dashboard" subtitle="MLB analytics overview — today's slate & key metrics" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-5 px-6 py-5">
        {/* Weather alert strip */}
        <div className="card-surface p-4">
          <SectionHeader
            title="Weather Alerts"
            subtitle="Venues where wind impacts HR / Total Bases"
            actions={
              <button
                onClick={() => router.push('/weather-park')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View all <ArrowRight size={12} />
              </button>
            }
          />
          {weather.loading ? (
            <ChartSkeleton height={56} />
          ) : alerts.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">No significant wind impacts today.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-1.5 text-xs"
                >
                  <Wind size={13} className="text-muted-foreground" />
                  <span className="font-medium text-foreground">{a.venue}</span>
                  <StatusBadge variant={a.windImpact === 'boost' ? 'positive' : 'negative'}>
                    {a.windImpact === 'boost' ? 'HR Boost' : 'HR Suppress'}
                  </StatusBadge>
                  <span className="text-muted-foreground">
                    {a.windSpeed} mph {a.windDir}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Saved edges widget */}
          <div className="card-surface p-4">
            <SectionHeader
              title="Saved Edges"
              subtitle="Your bookmarked prop edges"
              actions={
                <button
                  onClick={() => router.push('/saved-edges')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Manage <ArrowRight size={12} />
                </button>
              }
            />
            {edges.loading ? (
              <ChartSkeleton height={120} />
            ) : (edges.data ?? []).length === 0 ? (
              <EmptyState
                icon={<Bookmark size={24} />}
                title="No saved edges yet"
                description="Save an edge from the prop board to track it here."
              />
            ) : (
              <ul className="mt-3 divide-y divide-border/60">
                {(edges.data ?? []).slice(0, 6).map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <span className="font-medium text-foreground">{e.player}</span>
                      <span className="ml-1.5 text-muted-foreground">
                        {e.prop} {e.direction} {e.line}
                      </span>
                    </div>
                    <span
                      className={`font-mono-data font-semibold ${
                        e.edge >= 0 ? 'text-positive' : 'text-negative'
                      }`}
                    >
                      {formatEV(e.edge)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Today's games */}
          <div className="card-surface p-4">
            <SectionHeader title="Today's Games" subtitle="Schedule & status" />
            {games.loading ? (
              <ChartSkeleton height={120} />
            ) : (games.data ?? []).length === 0 ? (
              <EmptyState icon={<CloudSun size={24} />} title="No games scheduled" />
            ) : (
              <ul className="mt-3 divide-y divide-border/60">
                {(games.data ?? []).map((g) => (
                  <li key={g.id} className="flex items-center justify-between py-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-data text-muted-foreground">{g.gameTime}</span>
                      <span className="font-medium text-foreground">
                        {g.awayTeam} @ {g.homeTeam}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{g.venue}</span>
                      <StatusBadge variant={STATUS_BADGE[g.status]}>{g.status}</StatusBadge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
