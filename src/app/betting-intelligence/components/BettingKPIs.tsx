import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import TodoMarker from '@/components/ui/TodoMarker';
import { TrendingUp, AlertTriangle, DollarSign, Percent, Activity } from 'lucide-react';

// TODO: Replace mock values with real betting market data from bettingService
export default function BettingKPIs() {
  return (
    <div className="space-y-3">
      <TodoMarker
        pageName="BettingIntelligence KPIs"
        description="Replace hardcoded values with live prop line feed data. Steam moves and CLV data come from sharp action tracker."
      />
      {/* 5 cards — hero (span 2) + 4 regular = grid-cols-4 row 1: hero+2, row 2: 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Hero — spans 2 cols on lg+ */}
        <div className="lg:col-span-2">
          <MetricCard
            label="Today's Slate EV+ Plays"
            value="14"
            trend="up"
            trendLabel="4 more than yesterday"
            subvalue="of 38 total props scanned"
            variant="positive"
            icon={<TrendingUp size={14} />}
            className="h-full"
          />
        </div>
        <MetricCard
          label="Steam Moves"
          value="3"
          trend="up"
          trendLabel="active right now"
          subvalue="line moved ≥ 0.5 in 15 min"
          variant="warning"
          icon={<AlertTriangle size={14} />}
        />
        <MetricCard
          label="Avg Hold %"
          value="4.7%"
          trend="neutral"
          trendLabel="typical 4–6%"
          subvalue="book margin"
          variant="default"
          icon={<Percent size={14} />}
        />
        <MetricCard
          label="Sharp vs Square"
          value="62% Sharp"
          trend="up"
          trendLabel="on Over slate"
          subvalue="sharp action indicator"
          variant="default"
          icon={<Activity size={14} />}
        />
        <MetricCard
          label="CLV Tracker"
          value="+2.3%"
          trend="up"
          trendLabel="closing line value avg"
          subvalue="last 7 days"
          variant="positive"
          icon={<DollarSign size={14} />}
        />
      </div>
    </div>
  );
}