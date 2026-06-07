'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import SectionHeader from '@/components/ui/SectionHeader';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import TodoMarker from '@/components/ui/TodoMarker';

const WobaAreaChart = dynamic(() => import('@/charts/WobaAreaChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={180} />,
});

const BarrelRateBarChart = dynamic(() => import('@/charts/BarrelRateBarChart'), {
  ssr: false,
  loading: () => <ChartSkeleton height={180} />,
});

// TODO: Pass real chart data from analyticsService into chart components
export default function AdvancedAnalyticsCharts() {
  return (
    <div className="space-y-3">
      <TodoMarker
        pageName="AdvancedAnalytics Charts"
        description="Connect real time-series data to WobaAreaChart and batted-ball profile data to BarrelRateBarChart."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-3">
        {/* wOBA Trend */}
        <div className="card-surface p-4">
          <SectionHeader
            title="wOBA Trend"
            subtitle="Rolling 7-day weighted on-base average"
            className="mb-3"
          />
          <WobaAreaChart height={180} />
        </div>

        {/* Batted Ball Profile */}
        <div className="card-surface p-4">
          <SectionHeader
            title="Batted Ball Profile"
            subtitle="Distribution of contact types — current filter"
            className="mb-3"
          />
          <BarrelRateBarChart height={180} />
        </div>
      </div>
    </div>
  );
}
