'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, TrendingUp, Target, CloudSun, Sigma } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import MetricCard from '@/components/ui/MetricCard';
import EmptyState from '@/components/ui/EmptyState';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import { formatEV, formatOdds } from '@/utils/formatters';
import type { PropCalculation } from '../../../../shared/types';
import type { ConfidenceLevel } from '../../../../shared/constants';

const CONFIDENCE_BADGE: Record<
  ConfidenceLevel,
  { variant: 'positive' | 'warning' | 'negative'; label: string }
> = {
  high: { variant: 'positive', label: 'High Confidence' },
  medium: { variant: 'warning', label: 'Medium Confidence' },
  low: { variant: 'negative', label: 'Low Confidence' },
};

export default function PropAnalyzerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerId = searchParams.get('player');

  const { data, loading, error } = useApi<PropCalculation[]>(
    () => apiClient.getPropCalculations(),
    []
  );

  const calcs = useMemo(() => data ?? [], [data]);
  const selected = useMemo(
    () => calcs.find((c) => c.playerId === playerId) ?? calcs[0] ?? null,
    [calcs, playerId]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Prop Analyzer" subtitle="Single-player deep dive with full model breakdown" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-5 px-6 py-5">
        {error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {error}
          </div>
        )}

        {/* Player selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Player</span>
          <select
            value={selected?.playerId ?? ''}
            onChange={(e) => router.push(`/prop-analyzer?player=${e.target.value}`)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground"
          >
            {calcs.map((c) => (
              <option key={c.playerId} value={c.playerId}>
                {c.player} — {c.statType}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <ChartSkeleton height={320} />
        ) : !selected ? (
          <EmptyState
            icon={<Activity size={28} />}
            title="No prop selected"
            description="No prop calculations are available right now."
          />
        ) : (
          <AnalyzerBody calc={selected} />
        )}
      </div>
    </div>
  );
}

function AnalyzerBody({ calc }: { calc: PropCalculation }) {
  const conf = CONFIDENCE_BADGE[calc.confidence];
  const odds = calc.direction === 'under' ? calc.underOdds : calc.overOdds;
  const log = calc.gameLog ?? [];
  const last10 = log.slice(-10).reverse();

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="card-surface flex flex-wrap items-start justify-between gap-3 p-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">{calc.player}</h2>
          <p className="text-sm text-muted-foreground">
            {calc.team} {calc.opponent ? `vs ${calc.opponent}` : ''} · {calc.statType}{' '}
            <span className="uppercase">{calc.direction}</span> {calc.line}{' '}
            <span className="text-muted-foreground">{formatOdds(odds)}</span>
          </p>
        </div>
        <StatusBadge variant={conf.variant}>{conf.label}</StatusBadge>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          label="Edge%"
          value={formatEV(calc.edge)}
          variant={calc.edge >= 5 ? 'positive' : calc.edge < 0 ? 'alert' : 'default'}
          icon={<TrendingUp size={13} />}
        />
        <MetricCard label="Projection" value={calc.projectedValue} icon={<Target size={13} />} />
        <MetricCard label="Line" value={calc.line ?? '—'} />
        <MetricCard
          label="Hit Rate"
          value={calc.hitRate != null ? `${Math.round(calc.hitRate * 100)}%` : '—'}
        />
        <MetricCard
          label="Expected Value"
          value={calc.ev != null ? calc.ev.toFixed(2) : '—'}
          icon={<Sigma size={13} />}
        />
        <MetricCard label="Sample Size" value={calc.sampleSize} />
      </div>

      {/* Model breakdown */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card-surface p-4">
          <SectionHeader title="Model Breakdown" subtitle={`Model ${calc.modelVersion}`} />
          <dl className="mt-3 divide-y divide-border/60 text-xs">
            <Row label="Historical average" value={calc.historicalAvg.toFixed(2)} />
            <Row
              label="Weighted avg (recent 2×)"
              value={calc.weightedAvg != null ? calc.weightedAvg.toFixed(2) : '—'}
            />
            <Row
              label="Park / weather adjustment"
              value={calc.parkAdjustment != null ? `×${calc.parkAdjustment.toFixed(2)}` : '×1.00'}
              hint={<CloudSun size={12} />}
            />
            <Row label="Projection (final)" value={String(calc.projectedValue)} />
            <Row label="Edge vs line" value={formatEV(calc.edge)} />
            <Row label="Expected value" value={calc.ev != null ? calc.ev.toFixed(2) : '—'} />
          </dl>
        </div>

        {/* Game log */}
        <div className="card-surface p-4">
          <SectionHeader title="Last 10 Game Log" subtitle={`${calc.statType} vs line`} />
          {last10.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">No game log available.</p>
          ) : (
            <table className="mt-3 w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-2 py-1.5 text-left font-semibold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-2 py-1.5 text-left font-semibold uppercase tracking-wider">
                    Opp
                  </th>
                  <th className="px-2 py-1.5 text-right font-semibold uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-2 py-1.5 text-right font-semibold uppercase tracking-wider">
                    Line
                  </th>
                  <th className="px-2 py-1.5 text-center font-semibold uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {last10.map((g, i) => (
                  <tr key={`${g.date}-${i}`} className="border-b border-border/40">
                    <td className="px-2 py-1.5 font-mono-data text-muted-foreground">{g.date}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">{g.opponent}</td>
                    <td className="px-2 py-1.5 text-right font-mono-data text-foreground">
                      {g.value}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                      {g.line ?? '—'}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {g.hit == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <StatusBadge variant={g.hit ? 'positive' : 'negative'}>
                          {g.hit ? 'Over' : 'Under'}
                        </StatusBadge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        {hint}
        {label}
      </dt>
      <dd className="font-mono-data font-semibold text-foreground">{value}</dd>
    </div>
  );
}
