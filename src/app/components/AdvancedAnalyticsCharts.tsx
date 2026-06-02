'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '@/components/ui/SectionHeader';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import type { WobaTrendPoint, BattedBallPoint } from '@/services/statcastService';

const WobaAreaChart = dynamic(() => import('@/charts/WobaAreaChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={180} />,
});

const BarrelRateBarChart = dynamic(() => import('@/charts/BarrelRateBarChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={180} />,
});

interface AdvancedAnalyticsChartsProps {
  wobaTrend: WobaTrendPoint[];
  battedBall: BattedBallPoint[];
  loading: boolean;
}

export default function AdvancedAnalyticsCharts({
  wobaTrend,
  battedBall,
  loading,
}: AdvancedAnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* wOBA Trend */}
      <div className="card-surface p-4">
        <SectionHeader
          title="wOBA Trend"
          subtitle="Rolling weighted on-base average — Statcast 2026"
          className="mb-3"
        />
        {loading ? (
          <ChartSkeleton height={180} />
        ) : (
          <WobaAreaChart data={wobaTrend.length > 0 ? wobaTrend : undefined} height={180} />
        )}
      </div>

      {/* Batted Ball Profile */}
      <div className="card-surface p-4">
        <SectionHeader
          title="Batted Ball Profile"
          subtitle="Contact type distribution — derived from Statcast exit velocity & barrel data"
          className="mb-3"
        />
        {loading ? (
          <ChartSkeleton height={180} />
        ) : (
          <BarrelRateBarChart data={battedBall.length > 0 ? battedBall : undefined} height={180} />
        )}
      </div>
    </div>
  );
}