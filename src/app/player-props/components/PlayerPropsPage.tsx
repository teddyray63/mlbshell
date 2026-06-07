'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, ArrowUpDown, Activity } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import EmptyState from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import { formatEV, formatOdds } from '@/utils/formatters';
import type { PropCalculation } from '../../../../shared/types';
import type { ConfidenceLevel } from '../../../../shared/constants';

type SortKey = 'player' | 'prop' | 'line' | 'projectedValue' | 'edge' | 'hitRate' | 'ev';
type SortDir = 'asc' | 'desc';

const CONFIDENCE_BADGE: Record<
  ConfidenceLevel,
  { variant: 'positive' | 'warning' | 'negative'; label: string }
> = {
  high: { variant: 'positive', label: 'High' },
  medium: { variant: 'warning', label: 'Med' },
  low: { variant: 'negative', label: 'Low' },
};

const COLUMNS: { key: SortKey; label: string; align: 'left' | 'center' | 'right' }[] = [
  { key: 'player', label: 'Player', align: 'left' },
  { key: 'prop', label: 'Prop', align: 'left' },
  { key: 'line', label: 'Line', align: 'center' },
  { key: 'projectedValue', label: 'Proj', align: 'right' },
  { key: 'edge', label: 'Edge%', align: 'right' },
  { key: 'hitRate', label: 'Hit Rate', align: 'right' },
  { key: 'ev', label: 'EV', align: 'right' },
];

export default function PlayerPropsPage() {
  const router = useRouter();
  const { data, loading, error } = useApi<PropCalculation[]>(
    () => apiClient.getPropCalculations(),
    []
  );

  const [team, setTeam] = useState<string>('all');
  const [prop, setProp] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('edge');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const props = useMemo(() => data ?? [], [data]);

  const teams = useMemo(
    () => ['all', ...Array.from(new Set(props.map((p) => p.team).filter(Boolean) as string[]))],
    [props]
  );
  const propTypes = useMemo(
    () => ['all', ...Array.from(new Set(props.map((p) => p.statType)))],
    [props]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'player' || key === 'prop' ? 'asc' : 'desc');
    }
  };

  const filtered = useMemo(() => {
    return props.filter(
      (p) => (team === 'all' || p.team === team) && (prop === 'all' || p.statType === prop)
    );
  }, [props, team, prop]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
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
        case 'projectedValue':
          av = a.projectedValue;
          bv = b.projectedValue;
          break;
        case 'edge':
          av = a.edge;
          bv = b.edge;
          break;
        case 'hitRate':
          av = a.hitRate ?? 0;
          bv = b.hitRate ?? 0;
          break;
        case 'ev':
          av = a.ev ?? 0;
          bv = b.ev ?? 0;
          break;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Player Props" subtitle="Individual player prop lines and analysis" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        <SectionHeader
          title="Prop Board"
          subtitle="Edges computed from projection vs. line, sorted by edge%"
          actions={
            <span className="font-mono-data text-xs text-muted-foreground">
              {loading ? 'Loading…' : `${sorted.length} props`}
            </span>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-muted-foreground">Team</span>
            {teams.map((t) => (
              <FilterChip
                key={t}
                label={t === 'all' ? 'All' : t}
                active={team === t}
                onClick={() => setTeam(t)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-muted-foreground">Prop</span>
            {propTypes.map((t) => (
              <FilterChip
                key={t}
                label={t === 'all' ? 'All' : t}
                active={prop === t}
                onClick={() => setProp(t)}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {error}
          </div>
        )}

        <div className="card-surface overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`cursor-pointer select-none whitespace-nowrap px-3 py-2 font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground ${
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
                <th className="px-3 py-2 text-center font-semibold uppercase tracking-wider text-muted-foreground">
                  Conf
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={`skel-${i}`} cols={8} />
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={<Activity size={28} />}
                      title="No props match these filters"
                      description="Try clearing the team or prop filters."
                    />
                  </td>
                </tr>
              ) : (
                sorted.map((p) => {
                  const conf = CONFIDENCE_BADGE[p.confidence];
                  const edgeColor =
                    p.edge >= 5
                      ? 'text-positive font-bold'
                      : p.edge < 0
                        ? 'text-negative'
                        : 'text-muted-foreground';
                  const odds = p.direction === 'under' ? p.underOdds : p.overOdds;
                  return (
                    <tr
                      key={p.playerId}
                      onClick={() => router.push(`/prop-analyzer?player=${p.playerId}`)}
                      className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/20"
                    >
                      <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground">
                        {p.player}
                        <span className="ml-1.5 font-normal text-muted-foreground">{p.team}</span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {p.statType}
                        <span className="ml-1 text-[10px] uppercase text-muted-foreground/60">
                          {p.direction}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-mono-data">
                        {p.line} <span className="text-muted-foreground">{formatOdds(odds)}</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono-data">{p.projectedValue}</td>
                      <td className={`px-3 py-2 text-right font-mono-data ${edgeColor}`}>
                        {formatEV(p.edge)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono-data text-muted-foreground">
                        {p.hitRate != null ? `${Math.round(p.hitRate * 100)}%` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono-data text-muted-foreground">
                        {p.ev != null ? p.ev.toFixed(2) : '—'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <StatusBadge variant={conf.variant}>{conf.label}</StatusBadge>
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
