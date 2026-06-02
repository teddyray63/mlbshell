'use client';

import React, { memo } from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { Crosshair, Zap, BarChart2, TrendingDown, Activity, Target } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import type { StatcastKPIs } from '@/services/statcastService';

interface AdvancedAnalyticsKPIsProps {
  kpis: StatcastKPIs | null;
  loading: boolean;
}

function fmt(val: number | null, decimals = 1, suffix = ''): string {
  if (val === null) return '—';
  return `${val.toFixed(decimals)}${suffix}`;
}

function fmtWoba(val: number | null): string {
  if (val === null) return '—';
  return `.${Math.round(val * 1000).toString().padStart(3, '0')}`;
}

const AdvancedAnalyticsKPIs = memo(function AdvancedAnalyticsKPIs({ kpis, loading }: AdvancedAnalyticsKPIsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={`kpi-skel-${i}`} />
        ))}
      </div>
    );
  }

  const exitVelo = kpis?.avgExitVelocity ?? null;
  const barrelPct = kpis?.barrelPct ?? null;
  const hardHit = kpis?.hardHitPct ?? null;
  const woba = kpis?.woba ?? null;
  const xwoba = kpis?.xwoba ?? null;
  const kPct = kpis?.kPct ?? null;

  // Trend helpers (compare to known MLB averages)
  const exitVeloTrend = exitVelo !== null ? (exitVelo >= 88.7 ? 'up' : 'down') : 'neutral';
  const barrelTrend = barrelPct !== null ? (barrelPct >= 8 ? 'up' : 'down') : 'neutral';
  const hardHitTrend = hardHit !== null ? (hardHit >= 38 ? 'up' : 'down') : 'neutral';
  const wobaTrend = woba !== null ? (woba >= 0.320 ? 'up' : 'down') : 'neutral';
  const xwobaTrend = xwoba !== null ? (xwoba >= 0.320 ? 'up' : 'down') : 'neutral';
  const kPctTrend = kPct !== null ? (kPct <= 22 ? 'up' : 'down') : 'neutral';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <MetricCard
        label="Avg Exit Velocity"
        value={fmt(exitVelo, 1, ' mph')}
        trend={exitVeloTrend as 'up' | 'down' | 'neutral'}
        trendLabel="league avg 88.7"
        subvalue="Statcast 2026"
        variant={exitVeloTrend === 'up' ? 'positive' : 'default'}
        icon={<Zap size={14} />}
      />
      <MetricCard
        label="Barrel %"
        value={fmt(barrelPct, 1, '%')}
        trend={barrelTrend as 'up' | 'down' | 'neutral'}
        trendLabel="elite ≥ 15%"
        subvalue="avg ~8%"
        variant="default"
        icon={<Crosshair size={14} />}
      />
      <MetricCard
        label="Hard Hit %"
        value={fmt(hardHit, 1, '%')}
        trend={hardHitTrend as 'up' | 'down' | 'neutral'}
        trendLabel="avg ~38%"
        subvalue="≥ 40% = elite"
        variant={hardHitTrend === 'up' ? 'positive' : 'default'}
        icon={<Target size={14} />}
      />
      <MetricCard
        label="wOBA"
        value={fmtWoba(woba)}
        trend={wobaTrend as 'up' | 'down' | 'neutral'}
        trendLabel="avg .320"
        subvalue="Statcast 2026"
        variant="default"
        icon={<BarChart2 size={14} />}
      />
      <MetricCard
        label="xwOBA"
        value={fmtWoba(xwoba)}
        trend={xwobaTrend as 'up' | 'down' | 'neutral'}
        trendLabel="expected wOBA"
        subvalue="avg .320"
        variant="default"
        icon={<Activity size={14} />}
      />
      <MetricCard
        label="K%"
        value={fmt(kPct, 1, '%')}
        trend={kPctTrend as 'up' | 'down' | 'neutral'}
        trendLabel={kPct !== null && kPct >= 25 ? 'high K% concern' : 'avg ~22%'}
        subvalue="strikeout rate"
        variant={kPct !== null && kPct >= 25 ? 'alert' : 'default'}
        icon={<TrendingDown size={14} />}
      />
    </div>
  );
});

export default AdvancedAnalyticsKPIs;