'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, TrendingUp, Target, CloudSun, Sigma } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import MetricCard from '@/components/ui/MetricCard';
import EmptyState from '@/components/ui/EmptyState';
import StatCell from '@/components/ui/StatCell';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import { formatEV, formatOdds, formatAvg } from '@/utils/formatters';
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">{calc.player}</h2>
            {calc.position && <StatusBadge variant="neutral">{calc.position}</StatusBadge>}
            {calc.handedness && <StatusBadge variant="info">{calc.handedness}HB</StatusBadge>}
          </div>
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

      {/* Statcast stat breakdown */}
      {calc.splitRows && calc.splitRows.length > 0 && (
        <div className="card-surface p-4">
          <SectionHeader
            title="Stat Breakdown"
            subtitle="Statcast splits — color coded vs league"
          />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                  {[
                    'Split',
                    'AVG',
                    'wOBA',
                    'xwOBA',
                    'SLG',
                    'Exit Velo',
                    'Barrel%',
                    'Hard Hit%',
                    'Launch Angle',
                    'K%',
                    'BB%',
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-2 py-2 font-semibold ${h === 'Split' ? 'text-left' : 'text-right'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calc.splitRows.map((s) => (
                  <tr key={s.split} className="border-b border-border/50">
                    <td className="px-2 py-1.5 font-semibold text-foreground text-left">
                      {s.split}
                    </td>
                    <StatCell stat="avg" value={s.avg} type="batter" format={formatAvg} />
                    <StatCell stat="woba" value={s.woba} type="batter" format={formatAvg} />
                    <StatCell stat="xwoba" value={s.xwoba} type="batter" format={formatAvg} />
                    <StatCell stat="slg" value={s.slg} type="batter" format={formatAvg} />
                    <StatCell
                      stat="exitVelo"
                      value={s.exitVelo}
                      type="batter"
                      format={(v) => (v == null ? '—' : v.toFixed(1))}
                    />
                    <StatCell
                      stat="barrelPct"
                      value={s.barrelPct}
                      type="batter"
                      format={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
                    />
                    <StatCell
                      stat="hardHitPct"
                      value={s.hardHitPct}
                      type="batter"
                      format={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
                    />
                    <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                      {s.launchAngle == null ? '—' : `${s.launchAngle.toFixed(1)}°`}
                    </td>
                    <StatCell
                      stat="kPct"
                      value={s.kPct}
                      type="batter"
                      format={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
                    />
                    <StatCell
                      stat="bbPct"
                      value={s.bbPct}
                      type="batter"
                      format={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pitch vulnerability */}
      {calc.pitchVulnerability && calc.pitchVulnerability.length > 0 && (
        <div className="card-surface p-4">
          <SectionHeader title="Pitch Vulnerability" subtitle="Whiff% and wOBA by pitch type" />
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {calc.pitchVulnerability.map((p) => (
              <div key={p.pitchType} className="rounded-md border border-border bg-muted/20 p-3">
                <div className="text-xs font-semibold text-foreground">{p.pitchType}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Whiff{' '}
                  <span className="font-mono-data text-foreground">{p.whiffPct.toFixed(1)}%</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  wOBA <span className="font-mono-data text-foreground">{formatAvg(p.woba)}</span>
                </div>
                <div className="mt-2">
                  <StatusBadge
                    variant={
                      p.verdict === 'succeeds'
                        ? 'positive'
                        : p.verdict === 'struggles'
                          ? 'negative'
                          : 'neutral'
                    }
                  >
                    {p.verdict === 'succeeds'
                      ? 'Succeeds'
                      : p.verdict === 'struggles'
                        ? 'Struggles'
                        : 'Neutral'}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <tr
                    key={`${g.date}-${i}`}
                    className={`border-b border-border/40 ${g.hit ? 'bg-positive-subtle/40' : ''}`}
                  >
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
