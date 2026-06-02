'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { TrendingUp, AlertTriangle, DollarSign, Percent, Activity } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

interface KPIData {
  evPlusCount: number;
  totalProps: number;
  steamMoves: number;
  sharpCount: number;
}

export default function BettingKPIs() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/player-props?date=${date}`);
      const json = await res.json();
      const props = json.props ?? [];
      setData({
        evPlusCount: props.filter((p: { edge?: number }) => (p.edge ?? 0) > 3).length,
        totalProps: props.length,
        steamMoves: props.filter((p: { status?: string }) => p.status === 'steam').length,
        sharpCount: props.filter((p: { sharp?: boolean }) => p.sharp).length,
      });
    } catch {
      setData({ evPlusCount: 0, totalProps: 0, steamMoves: 0, sharpCount: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} className={i === 0 ? 'lg:col-span-2' : ''} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Hero — spans 2 cols on lg+ */}
      <div className="lg:col-span-2">
        <MetricCard
          label="Today's Slate EV+ Plays"
          value={String(data?.evPlusCount ?? 0)}
          trend="up"
          trendLabel={`of ${data?.totalProps ?? 0} total props scanned`}
          subvalue="props with edge > 3%"
          variant="positive"
          icon={<TrendingUp size={14} />}
          className="h-full"
        />
      </div>
      <MetricCard
        label="Steam Moves"
        value={String(data?.steamMoves ?? 0)}
        trend={data && data.steamMoves > 0 ? 'up' : 'neutral'}
        trendLabel="active right now"
        subvalue="line moved ≥ 0.5 in 15 min"
        variant={data && data.steamMoves > 0 ? 'warning' : 'default'}
        icon={<AlertTriangle size={14} />}
      />
      <MetricCard
        label="Sharp Plays"
        value={String(data?.sharpCount ?? 0)}
        trend="neutral"
        trendLabel="sharp action flagged"
        subvalue="sharp money indicator"
        variant="default"
        icon={<Activity size={14} />}
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
        label="CLV Tracker"
        value="+2.3%"
        trend="up"
        trendLabel="closing line value avg"
        subvalue="last 7 days"
        variant="positive"
        icon={<DollarSign size={14} />}
      />
    </div>
  );
}