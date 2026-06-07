'use client';

import React, { useMemo } from 'react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import MetricCard from '@/components/ui/MetricCard';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import BarrelRateBarChart from '@/charts/BarrelRateBarChart';
import LineMovementChart from '@/charts/LineMovementChart';
import PitcherRadarChart from '@/charts/PitcherRadarChart';
import WobaAreaChart from '@/charts/WobaAreaChart';
import type { AnalyticsData } from '../../../../shared/types';

export default function VisualAnalyticsPage() {
  const { data, loading, error } = useApi<AnalyticsData>(() => apiClient.getAnalytics(), []);

  const radarData = useMemo(
    () => (data?.pitcherRadar ?? []).map((r) => ({ stat: r.metric, value: r.value })),
    [data]
  );

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
          <ChartCard title="wOBA Trend" subtitle="Rolling weighted on-base average">
            {loading ? <ChartSkeleton height={220} /> : <WobaAreaChart data={data?.wobaTrend} />}
          </ChartCard>

          <ChartCard title="Batted Ball Profile" subtitle="Distribution of contact types">
            {loading ? (
              <ChartSkeleton height={220} />
            ) : (
              <BarrelRateBarChart data={data?.barrelRate} />
            )}
          </ChartCard>

          <ChartCard title="Line Movement" subtitle="Over/Under total across the day">
            {loading ? (
              <ChartSkeleton height={220} />
            ) : (
              <LineMovementChart data={data?.lineMovement} />
            )}
          </ChartCard>

          <ChartCard title="Pitcher Profile" subtitle="Percentile radar across key metrics">
            {loading ? <ChartSkeleton height={220} /> : <PitcherRadarChart data={radarData} />}
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
