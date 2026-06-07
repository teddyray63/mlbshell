'use client';

import React, { useMemo, useState } from 'react';
import { Wind, Droplets, Thermometer, Gauge, CloudSun } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import EmptyState from '@/components/ui/EmptyState';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import type { WeatherCondition, ParkFactor } from '../../../../shared/types';

const IMPACT_BADGE: Record<
  WeatherCondition['windImpact'],
  { variant: 'positive' | 'negative' | 'neutral'; label: string }
> = {
  boost: { variant: 'positive', label: 'HR Boost' },
  suppress: { variant: 'negative', label: 'HR Suppress' },
  neutral: { variant: 'neutral', label: 'Neutral' },
};

type ImpactFilter = 'all' | 'boost' | 'suppress' | 'neutral';

export default function WeatherParkPage() {
  const { data, loading, error } = useApi<WeatherCondition[]>(() => apiClient.getAllWeather(), []);
  const [impact, setImpact] = useState<ImpactFilter>('all');

  const venues = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () => (impact === 'all' ? venues : venues.filter((v) => v.windImpact === impact)),
    [venues, impact]
  );

  // Pull Baseball Savant park-factor ratings for each venue once weather loads.
  const venueKey = venues.map((v) => v.venue).join('|');
  const parkApi = useApi<ParkFactor[]>(async () => {
    const results = await Promise.all(venues.map((v) => apiClient.getParkFactors(v.venue)));
    return results.filter((p): p is ParkFactor => p != null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueKey]);
  const parkMap = useMemo(() => {
    const m: Record<string, ParkFactor> = {};
    for (const p of parkApi.data ?? []) m[p.venue] = p;
    return m;
  }, [parkApi.data]);
  const currentYear = new Date().getFullYear();

  const filters: { key: ImpactFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'boost', label: 'HR Boost' },
    { key: 'suppress', label: 'HR Suppress' },
    { key: 'neutral', label: 'Neutral' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar
        title="Weather & Park"
        subtitle="Real-time weather conditions and park factor overlays"
      />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        <SectionHeader
          title="Venue Conditions"
          subtitle="Wind impact drives HR / Total Bases projection adjustments"
          actions={
            <span className="font-mono-data text-xs text-muted-foreground">
              {loading ? 'Loading…' : `${filtered.length} venues`}
            </span>
          }
        />

        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((f) => (
            <FilterChip
              key={f.key}
              label={f.label}
              active={impact === f.key}
              onClick={() => setImpact(f.key)}
            />
          ))}
        </div>

        {error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChartSkeleton key={`skel-${i}`} height={180} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CloudSun size={28} />}
            title="No venues match this filter"
            description="Try a different wind-impact filter."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => {
              const badge = IMPACT_BADGE[v.windImpact];
              return (
                <div key={v.id} className="card-surface flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{v.venue}</h3>
                      <p className="text-xs text-muted-foreground">{v.city}</p>
                    </div>
                    <StatusBadge variant={badge.variant}>{badge.label}</StatusBadge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Stat
                      icon={<Thermometer size={13} />}
                      label="Temp"
                      value={`${v.temp}°F`}
                      sub={`feels ${v.feelsLike}°`}
                    />
                    <Stat
                      icon={<Wind size={13} />}
                      label="Wind"
                      value={`${v.windSpeed} mph`}
                      sub={v.windDir}
                    />
                    <Stat
                      icon={<Droplets size={13} />}
                      label="Humidity"
                      value={`${v.humidity}%`}
                      sub={v.condition}
                    />
                    <Stat
                      icon={<Gauge size={13} />}
                      label="Park Factor"
                      value={v.parkFactor.toFixed(2)}
                      sub={`precip ${v.precipitation}%`}
                    />
                  </div>

                  {/* Baseball Savant park-factor ratings + last-3-season HR rates */}
                  {(() => {
                    const pf = parkMap[v.venue];
                    if (parkApi.loading) {
                      return <div className="h-12 animate-pulse rounded-md bg-muted/40" />;
                    }
                    if (!pf) return null;
                    return (
                      <div className="rounded-md border border-border/60 bg-muted/20 p-2.5">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Savant Park Factors
                          </span>
                          <span className="flex gap-1.5">
                            <StatusBadge
                              variant={
                                pf.hrFactor >= 103
                                  ? 'positive'
                                  : pf.hrFactor <= 97
                                    ? 'negative'
                                    : 'neutral'
                              }
                            >
                              HR {pf.hrFactor}
                            </StatusBadge>
                            <StatusBadge variant="neutral">Runs {pf.runsFactor}</StatusBadge>
                          </span>
                        </div>
                        <div className="flex items-end justify-between gap-1">
                          {pf.hrRateL3.map((rate, i) => {
                            const yr = currentYear - (pf.hrRateL3.length - 1 - i);
                            const max = Math.max(...pf.hrRateL3, 1);
                            return (
                              <div key={yr} className="flex flex-1 flex-col items-center gap-1">
                                <div className="flex h-10 w-full items-end">
                                  <div
                                    className="w-full rounded-t bg-primary/70"
                                    style={{ height: `${(rate / max) * 100}%` }}
                                  />
                                </div>
                                <span className="font-mono-data text-[10px] text-foreground">
                                  {rate.toFixed(2)}
                                </span>
                                <span className="text-[9px] text-muted-foreground">{yr}</span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="mt-1 text-center text-[9px] text-muted-foreground">
                          HR/game last 3 seasons
                        </p>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-muted/30 px-2.5 py-2">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-mono-data text-sm font-semibold text-foreground">{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  );
}
