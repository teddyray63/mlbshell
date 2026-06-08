'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, ArrowUpDown, LayoutGrid } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import StatCell from '@/components/ui/StatCell';
import SaveEdgeButton from '@/components/ui/SaveEdgeButton';
import PlayerLink from '@/components/ui/PlayerLink';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import { formatEV, formatAvg } from '@/utils/formatters';
import type { PropCalculation, WeatherCondition } from '../../../../shared/types';
import type { ConfidenceLevel } from '../../../../shared/constants';

type SortKey =
  | 'player'
  | 'prop'
  | 'line'
  | 'edge'
  | 'hitRate'
  | 'exitVelo'
  | 'barrelPct'
  | 'xwoba'
  | 'parkFactor'
  | 'windImpact'
  | 'confidence';
type SortDir = 'asc' | 'desc';

const CONFIDENCE_BADGE: Record<
  ConfidenceLevel,
  { variant: 'positive' | 'warning' | 'negative'; label: string }
> = {
  high: { variant: 'positive', label: 'High' },
  medium: { variant: 'warning', label: 'Med' },
  low: { variant: 'negative', label: 'Low' },
};

const WIND_IMPACT_BADGE: Record<
  WeatherCondition['windImpact'],
  { variant: 'positive' | 'negative' | 'neutral'; label: string }
> = {
  boost: { variant: 'positive', label: 'HR Boost' },
  suppress: { variant: 'negative', label: 'HR Suppress' },
  neutral: { variant: 'neutral', label: 'Neutral' },
};

const COLUMNS: { key: SortKey; label: string; align: 'left' | 'center' | 'right' }[] = [
  { key: 'player', label: 'Player', align: 'left' },
  { key: 'prop', label: 'Prop', align: 'left' },
  { key: 'line', label: 'Line', align: 'center' },
  { key: 'edge', label: 'Edge%', align: 'right' },
  { key: 'hitRate', label: 'Hit Rate', align: 'right' },
  { key: 'exitVelo', label: 'Exit Velo', align: 'right' },
  { key: 'barrelPct', label: 'Barrel%', align: 'right' },
  { key: 'xwoba', label: 'xwOBA', align: 'right' },
  { key: 'parkFactor', label: 'Park Factor', align: 'center' },
  { key: 'windImpact', label: 'Weather Impact', align: 'center' },
  { key: 'confidence', label: 'Confidence', align: 'center' },
];

function parkVariant(pf: number | undefined): 'positive' | 'negative' | 'neutral' {
  if (pf == null) return 'neutral';
  if (pf >= 103) return 'positive';
  if (pf <= 97) return 'negative';
  return 'neutral';
}

const CONF_ORDER: Record<ConfidenceLevel, number> = { high: 2, medium: 1, low: 0 };
const WIND_ORDER: Record<WeatherCondition['windImpact'], number> = {
  boost: 2,
  neutral: 1,
  suppress: 0,
};

export default function PropCheatsheetPage() {
  const router = useRouter();
  const props = useApi<PropCalculation[]>(() => apiClient.getPropCalculations(), []);
  const weather = useApi<WeatherCondition[]>(() => apiClient.getAllWeather(), []);

  const [sortKey, setSortKey] = useState<SortKey>('edge');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    apiClient
      .getSavedEdges()
      .then((edges) => {
        if (active) setSavedIds(new Set(edges.map((e) => e.propId)));
      })
      .catch(() => {
        /* not logged in / no edges */
      });
    return () => {
      active = false;
    };
  }, []);

  const loading = props.loading || weather.loading;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const weatherMap = useMemo(() => {
    const map: Record<string, WeatherCondition['windImpact']> = {};
    for (const wx of weather.data ?? []) map[wx.gameId] = wx.windImpact;
    return map;
  }, [weather.data]);

  const rows = useMemo(() => props.data ?? [], [props.data]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'player' || key === 'prop' ? 'asc' : 'desc');
    }
  };

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortKey) {
        case 'player':
          av = a.player ?? '';
          bv = b.player ?? '';
          break;
        case 'prop':
          av = a.statType;
          bv = b.statType;
          break;
        case 'line':
          av = a.line ?? 0;
          bv = b.line ?? 0;
          break;
        case 'edge':
          av = a.edge;
          bv = b.edge;
          break;
        case 'hitRate':
          av = a.hitRate ?? 0;
          bv = b.hitRate ?? 0;
          break;
        case 'exitVelo':
          av = a.exitVelo ?? 0;
          bv = b.exitVelo ?? 0;
          break;
        case 'barrelPct':
          av = a.barrelPct ?? 0;
          bv = b.barrelPct ?? 0;
          break;
        case 'xwoba':
          av = a.xwoba ?? 0;
          bv = b.xwoba ?? 0;
          break;
        case 'parkFactor':
          av = a.parkFactor ?? 0;
          bv = b.parkFactor ?? 0;
          break;
        case 'windImpact':
          av = WIND_ORDER[weatherMap[a.gameId ?? ''] ?? 'neutral'];
          bv = WIND_ORDER[weatherMap[b.gameId ?? ''] ?? 'neutral'];
          break;
        case 'confidence':
          av = CONF_ORDER[a.confidence];
          bv = CONF_ORDER[b.confidence];
          break;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [rows, sortKey, sortDir, weatherMap]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Prop Cheatsheet" subtitle="Quick-reference prop summary for today's slate" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        <SectionHeader
          title="Today's Prop Cheatsheet"
          subtitle={today}
          actions={
            <span className="font-mono-data text-xs text-muted-foreground">
              {loading ? 'Loading…' : `${sorted.length} props`}
            </span>
          }
        />

        {props.error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {props.error}
          </div>
        )}

        <div className="card-surface overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`cursor-pointer select-none whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp size={10} className="text-primary" />
                        ) : (
                          <ArrowDown size={10} className="text-primary" />
                        )
                      ) : (
                        <ArrowUpDown size={10} className="text-muted-foreground/40" />
                      )}
                    </span>
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-semibold uppercase tracking-wider text-muted-foreground">
                  Save
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={`skel-${i}`} cols={COLUMNS.length + 1} />
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1}>
                    <EmptyState
                      icon={<LayoutGrid size={28} />}
                      title="No props available for today's slate."
                    />
                  </td>
                </tr>
              ) : (
                sorted.map((p) => {
                  const windImpact = weatherMap[p.gameId ?? ''] ?? 'neutral';
                  const windBadge = WIND_IMPACT_BADGE[windImpact];
                  const confBadge = CONFIDENCE_BADGE[p.confidence];
                  const edgeColor =
                    p.edge >= 5
                      ? 'text-positive font-bold'
                      : p.edge < 0
                        ? 'text-negative'
                        : 'text-muted-foreground';

                  return (
                    <tr
                      key={p.playerId}
                      onClick={() => router.push(`/players/${p.mlbId ?? p.playerId}`)}
                      className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/20"
                    >
                      <td className="whitespace-nowrap px-2 py-2 font-medium text-foreground">
                        <PlayerLink playerId={p.mlbId ?? p.playerId} name={p.player ?? ''} />
                        <span className="ml-1.5 font-normal text-muted-foreground">{p.team}</span>
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {p.statType}
                        <span className="ml-1 text-[10px] uppercase text-muted-foreground/60">
                          {p.direction}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center font-mono-data">{p.line}</td>
                      <td className={`px-2 py-2 text-right font-mono-data ${edgeColor}`}>
                        {formatEV(p.edge)}
                      </td>
                      <td className="px-2 py-2 text-right font-mono-data text-muted-foreground">
                        {p.hitRate != null ? `${Math.round(p.hitRate * 100)}%` : '—'}
                      </td>
                      <StatCell
                        stat="exitVelo"
                        value={p.exitVelo}
                        type="batter"
                        format={(v) => (v == null ? '—' : v.toFixed(1))}
                      />
                      <StatCell
                        stat="barrelPct"
                        value={p.barrelPct}
                        type="batter"
                        format={(v) => (v == null ? '—' : `${v.toFixed(1)}%`)}
                      />
                      <StatCell stat="xwoba" value={p.xwoba} type="batter" format={formatAvg} />
                      <td className="px-2 py-2 text-center">
                        <StatusBadge variant={parkVariant(p.parkFactor)}>
                          {p.parkFactor != null ? `PF ${p.parkFactor}` : '—'}
                        </StatusBadge>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <StatusBadge variant={windBadge.variant}>{windBadge.label}</StatusBadge>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <StatusBadge variant={confBadge.variant}>{confBadge.label}</StatusBadge>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <SaveEdgeButton
                          edge={{
                            propId: `${p.playerId}:${p.statType}`,
                            player: p.player ?? '',
                            prop: p.statType,
                            line: p.line ?? 0,
                            direction: p.direction ?? 'over',
                            edge: p.edge,
                            confidence: p.confidence,
                          }}
                          initiallySaved={savedIds.has(`${p.playerId}:${p.statType}`)}
                          onSaved={(id) => setSavedIds((s) => new Set(s).add(id))}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {!loading && sorted.length > 0 && (
            <div className="flex items-center justify-between border-t border-border px-3 py-2.5 text-xs text-muted-foreground">
              <span className="font-mono-data">
                {sorted.length} props — sorted by {sortKey} {sortDir}
              </span>
              <span>Click any row to open in Prop Analyzer</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
