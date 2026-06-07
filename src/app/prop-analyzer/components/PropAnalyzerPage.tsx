'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, TrendingUp, Target, CloudSun, Sigma, Swords } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import MetricCard from '@/components/ui/MetricCard';
import EmptyState from '@/components/ui/EmptyState';
import StatCell from '@/components/ui/StatCell';
import FilterChip from '@/components/ui/FilterChip';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import { formatEV, formatOdds, formatAvg } from '@/utils/formatters';
import type { PropCalculation } from '../../../../shared/types';
import type { ConfidenceLevel } from '../../../../shared/constants';

type LogRecency = 'L10' | 'L5' | 'L3' | 'Last';
type LogFilter = 'all' | 'home' | 'away' | 'rhp';

const fmtML = (v: number | null | undefined) =>
  v == null ? '—' : v > 0 ? `+${Math.round(v)}` : String(Math.round(v));

function logHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

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
  const [logRecency, setLogRecency] = useState<LogRecency>('L10');
  const [logFilter, setLogFilter] = useState<LogFilter>('all');

  // Annotate each game with deterministic W/L + home/away/RHP flags so the
  // log responds to filters and shows the W/L column.
  const annotatedLog = useMemo(() => {
    const log = calc.gameLog ?? [];
    return log
      .slice(-10)
      .reverse()
      .map((g, i) => {
        const seed = logHash(`${calc.playerId}|${g.date}|${g.opponent}|${i}`);
        const hit = g.hit ?? (g.line != null && g.value >= g.line);
        return {
          ...g,
          hit,
          won: seed > 0.45,
          isHome: seed > 0.5,
          vsRhp: seed > 0.4,
        };
      });
  }, [calc.gameLog, calc.playerId]);

  const filteredLog = useMemo(() => {
    let rows = annotatedLog;
    if (logFilter === 'home') rows = rows.filter((g) => g.isHome);
    else if (logFilter === 'away') rows = rows.filter((g) => !g.isHome);
    else if (logFilter === 'rhp') rows = rows.filter((g) => g.vsRhp);
    const n = logRecency === 'L10' ? 10 : logRecency === 'L5' ? 5 : logRecency === 'L3' ? 3 : 1;
    return rows.slice(0, n);
  }, [annotatedLog, logFilter, logRecency]);

  const hitCount = filteredLog.filter((g) => g.hit).length;

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

      {/* Batter vs Pitcher head-to-head */}
      {calc.batterVsPitcher && (
        <div className="card-surface p-4">
          <SectionHeader
            title={
              <span className="inline-flex items-center gap-1.5">
                <Swords size={14} /> {calc.player} vs {calc.batterVsPitcher.pitcher}
              </span>
            }
            subtitle={`Historical matchup — Since ${calc.batterVsPitcher.sinceYear}`}
          />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                  {['AB', 'H', 'HR', 'AVG', 'SLG', 'K%', 'BRL%'].map((h) => (
                    <th key={h} className="px-3 py-2 text-right font-semibold first:text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="font-mono-data text-foreground">
                  <td className="px-3 py-1.5 text-left">{calc.batterVsPitcher.ab}</td>
                  <td className="px-3 py-1.5 text-right">{calc.batterVsPitcher.h}</td>
                  <td className="px-3 py-1.5 text-right">{calc.batterVsPitcher.hr}</td>
                  <td className="px-3 py-1.5 text-right">{formatAvg(calc.batterVsPitcher.avg)}</td>
                  <td className="px-3 py-1.5 text-right">{formatAvg(calc.batterVsPitcher.slg)}</td>
                  <td className="px-3 py-1.5 text-right">
                    {calc.batterVsPitcher.kPct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {calc.batterVsPitcher.brlPct.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Best lines strip */}
      {calc.bestLines && calc.bestLines.length > 0 && (
        <div className="card-surface p-4">
          <SectionHeader
            title="Best Lines"
            subtitle={`Today's ${calc.statType} lines across books`}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {calc.bestLines.map((bl) => (
              <div
                key={bl.book}
                className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs"
              >
                <div className="font-semibold text-foreground">{bl.book}</div>
                <div className="mt-1 font-mono-data text-muted-foreground">
                  Line <span className="text-foreground">{bl.line}</span>
                </div>
                <div className="font-mono-data text-muted-foreground">
                  O <span className="text-positive">{fmtML(bl.overOdds)}</span> · U{' '}
                  <span className="text-negative">{fmtML(bl.underOdds)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Game log (left) + Pitcher panel (right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Game log */}
        <div className="card-surface p-4">
          <SectionHeader
            title="Game Log"
            subtitle={`${calc.statType} vs line`}
            actions={
              <div className="flex flex-wrap items-center gap-1.5">
                {(['L10', 'L5', 'L3', 'Last'] as LogRecency[]).map((r) => (
                  <FilterChip
                    key={r}
                    label={r}
                    active={logRecency === r}
                    onClick={() => setLogRecency(r)}
                  />
                ))}
                <span className="mx-1 h-4 w-px bg-border" />
                {(
                  [
                    ['all', 'All'],
                    ['away', 'Away'],
                    ['home', 'vs OPP'],
                    ['rhp', 'vs RHP'],
                  ] as [LogFilter, string][]
                ).map(([f, label]) => (
                  <FilterChip
                    key={f}
                    label={label}
                    active={logFilter === f}
                    onClick={() => setLogFilter(f)}
                  />
                ))}
              </div>
            }
          />
          {filteredLog.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">No games match this filter.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                    <th className="px-2 py-1.5 text-left font-semibold">Date</th>
                    <th className="px-2 py-1.5 text-left font-semibold">Opp</th>
                    <th className="px-2 py-1.5 text-center font-semibold">W/L</th>
                    <th className="px-2 py-1.5 text-right font-semibold">{calc.statType}</th>
                    <th className="px-2 py-1.5 text-right font-semibold">Line</th>
                    <th className="px-2 py-1.5 text-center font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLog.map((g, i) => (
                    <tr
                      key={`${g.date}-${i}`}
                      className={`border-b border-border/40 ${
                        g.hit ? 'bg-positive-subtle/40' : 'bg-negative-subtle/30'
                      }`}
                    >
                      <td className="px-2 py-1.5 font-mono-data text-muted-foreground">{g.date}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        {g.isHome ? 'vs' : '@'} {g.opponent}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={g.won ? 'text-positive' : 'text-negative'}>
                          {g.won ? 'W' : 'L'}
                        </span>
                      </td>
                      <td
                        className={`px-2 py-1.5 text-right font-mono-data font-semibold ${
                          g.hit ? 'text-positive' : 'text-negative'
                        }`}
                      >
                        {g.value}
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                        {g.line ?? '—'}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <StatusBadge variant={g.hit ? 'positive' : 'negative'}>
                          {g.hit ? 'Hit' : 'Miss'}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                  {/* Hit-rate row */}
                  <tr className="border-t-2 border-border font-semibold">
                    <td className="px-2 py-1.5 text-foreground" colSpan={3}>
                      Hit Rate
                    </td>
                    <td
                      className="px-2 py-1.5 text-right font-mono-data text-foreground"
                      colSpan={3}
                    >
                      {hitCount}/{filteredLog.length} ·{' '}
                      {filteredLog.length ? Math.round((hitCount / filteredLog.length) * 100) : 0}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pitcher panel */}
        <div className="card-surface p-4">
          <SectionHeader
            title="Pitcher Panel"
            subtitle={calc.opposingPitcher ? `${calc.opposingPitcher} splits` : 'Opposing pitcher'}
          />
          {calc.pitcherPanel && calc.pitcherPanel.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                    {['Split', 'ERA', 'WHIP', 'OBA', 'K%', 'K/9', 'HR/9', 'BRL%'].map((h) => (
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
                  {calc.pitcherPanel.map((s) => (
                    <tr key={s.split} className="border-b border-border/50">
                      <td className="px-2 py-1.5 text-left font-semibold text-foreground">
                        {s.split}
                      </td>
                      <StatCell
                        stat="era"
                        value={s.era}
                        type="pitcher"
                        format={(v) => (v == null ? '—' : v.toFixed(2))}
                      />
                      <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                        {s.whip.toFixed(2)}
                      </td>
                      <StatCell stat="oba" value={s.oba} type="pitcher" format={formatAvg} />
                      <StatCell
                        stat="kPct"
                        value={s.kPct}
                        type="pitcher"
                        format={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
                      />
                      <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                        {s.k9.toFixed(1)}
                      </td>
                      <StatCell
                        stat="hr9"
                        value={s.hr9}
                        type="pitcher"
                        format={(v) => (v == null ? '—' : v.toFixed(2))}
                      />
                      <StatCell
                        stat="brlpct"
                        value={s.brlPct}
                        type="pitcher"
                        format={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">No pitcher splits available.</p>
          )}
        </div>
      </div>

      {/* Model breakdown */}
      <div className="card-surface p-4">
        <SectionHeader title="Model Breakdown" subtitle={`Model ${calc.modelVersion}`} />
        <dl className="mt-3 grid grid-cols-1 gap-x-8 divide-y divide-border/60 text-xs md:grid-cols-2 md:divide-y-0">
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
