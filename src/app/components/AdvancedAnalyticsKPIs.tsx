import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { Crosshair, Zap, BarChart2, TrendingDown } from 'lucide-react';
import TodoMarker from '@/components/ui/TodoMarker';

// TODO: Replace mock values with real data from analyticsService.fetchAdvancedStats()
export default function AdvancedAnalyticsKPIs() {
  return (
    <div className="space-y-3">
      <TodoMarker
        pageName="AdvancedAnalytics KPIs"
        description="Replace hardcoded values below with real stat fetches. Each card maps to a specific MLB Statcast metric."
      />
      {/* Grid: 4 cards — 4-col single row on lg+, 2×2 on md, 1-col on sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Avg Exit Velocity"
          value="91.4 mph"
          trend="up"
          trendLabel="+1.2 vs last 7"
          subvalue="league avg 88.7"
          variant="positive"
          icon={<Zap size={14} />}
        />
        <MetricCard
          label="Barrel Rate"
          value="10.8%"
          trend="up"
          trendLabel="+0.4% vs last 7"
          subvalue="elite ≥ 15%"
          variant="default"
          icon={<Crosshair size={14} />}
        />
        <MetricCard
          label="wOBA (season)"
          value=".348"
          trend="neutral"
          trendLabel="flat vs last 7"
          subvalue="avg .320"
          variant="default"
          icon={<BarChart2 size={14} />}
        />
        <MetricCard
          label="K% (last 7)"
          value="27.3%"
          trend="down"
          trendLabel="+4.1% vs season"
          subvalue="high K% = concern"
          variant="alert"
          icon={<TrendingDown size={14} />}
        />
      </div>
    </div>
  );
}
