'use client';

import React, { useState, useMemo, memo, useCallback } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart2 } from 'lucide-react';
import type { StatcastPlayer } from '@/services/statcastService';

interface AdvancedAnalyticsTableProps {
  players: StatcastPlayer[];
  loading: boolean;
}

type SortKey = keyof StatcastPlayer;

const SortIcon = memo(function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: 'asc' | 'desc' }) {
  if (col !== sortKey) return <ArrowUpDown size={12} className="text-muted-foreground/40" />;
  return dir === 'asc'
    ? <ArrowUp size={12} className="text-primary" />
    : <ArrowDown size={12} className="text-primary" />;
});

function fmtStat(val: number | null, decimals = 3, prefix = ''): string {
  if (val === null) return '—';
  return `${prefix}${val.toFixed(decimals)}`;
}

function fmtWoba(val: number | null): string {
  if (val === null) return '—';
  return `.${Math.round(val * 1000).toString().padStart(3, '0')}`;
}

const cols: { key: SortKey; label: string; align?: string }[] = [
  { key: 'name',            label: 'Player' },
  { key: 'team',            label: 'Team',   align: 'center' },
  { key: 'position',        label: 'Pos',    align: 'center' },
  { key: 'pa',              label: 'PA',     align: 'right' },
  { key: 'avg',             label: 'AVG',    align: 'right' },
  { key: 'obp',             label: 'OBP',    align: 'right' },
  { key: 'slg',             label: 'SLG',    align: 'right' },
  { key: 'woba',            label: 'wOBA',   align: 'right' },
  { key: 'xwoba',           label: 'xwOBA',  align: 'right' },
  { key: 'exitVelocityAvg', label: 'EV',     align: 'right' },
  { key: 'barrelRate',      label: 'Brl%',   align: 'right' },
  { key: 'hardHitPct',      label: 'HH%',    align: 'right' },
  { key: 'kPct',            label: 'K%',     align: 'right' },
  { key: 'bbPct',           label: 'BB%',    align: 'right' },
];

const ROWS_PER_PAGE = 25;

const AdvancedAnalyticsTable = memo(function AdvancedAnalyticsTable({ players, loading }: AdvancedAnalyticsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('woba');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('desc');
      return key;
    });
    setPage(1);
  }, []);

  const sorted = useMemo(() => {
    return [...players].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      const n = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? n : -n;
    });
  }, [players, sortKey, sortDir]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE)), [sorted.length]);
  const paginated = useMemo(
    () => sorted.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
    [sorted, page]
  );

  return (
    <div className="card-surface overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <SectionHeader
          title="Player Stat Table"
          subtitle="Live Statcast metrics — click column header to sort"
        />
        {!loading && players.length > 0 && (
          <span className="text-xs text-muted-foreground font-mono-data">
            {players.length} players · Live
          </span>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {cols.map((col) => (
                <th
                  key={`th-${col.key}`}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none whitespace-nowrap hover:text-foreground transition-colors
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} sortKey={sortKey} dir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <TableRowSkeleton key={`skel-row-${i}`} cols={cols.length} />
                ))
              : paginated.length === 0
              ? (
                <tr>
                  <td colSpan={cols.length}>
                    <EmptyState
                      icon={<BarChart2 size={32} />}
                      title="No players found"
                      description="Statcast data could not be loaded or no players match the current filters."
                    />
                  </td>
                </tr>
              )
              : paginated.map((player, rowIdx) => {
                  const isHighBarrel = (player.barrelRate ?? 0) >= 12;
                  const isHighK = (player.kPct ?? 0) >= 28;
                  const isEliteEV = (player.exitVelocityAvg ?? 0) >= 92;
                  const wobaVal = player.woba ?? 0;
                  return (
                    <tr
                      key={player.id || `row-${rowIdx}`}
                      className={`border-b border-border/50 hover:bg-muted/30 transition-colors duration-100 ${rowIdx % 2 === 0 ? '' : 'bg-muted/10'}`}
                    >
                      <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                        {player.name}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="font-mono-data text-xs text-muted-foreground">{player.team}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="font-mono-data text-xs text-muted-foreground">{player.position}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right stat-cell text-muted-foreground">{player.pa}</td>
                      <td className="px-3 py-2.5 text-right stat-cell">{fmtWoba(player.avg)}</td>
                      <td className="px-3 py-2.5 text-right stat-cell">{fmtWoba(player.obp)}</td>
                      <td className="px-3 py-2.5 text-right stat-cell">{fmtWoba(player.slg)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`stat-cell font-semibold ${wobaVal >= 0.360 ? 'text-positive' : wobaVal <= 0.310 ? 'text-negative' : 'text-foreground'}`}>
                          {fmtWoba(player.woba)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`stat-cell ${player.xwoba !== null && player.woba !== null && player.xwoba > player.woba ? 'text-positive' : 'text-foreground'}`}>
                          {fmtWoba(player.xwoba)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`stat-cell ${isEliteEV ? 'text-positive font-semibold' : 'text-foreground'}`}>
                          {fmtStat(player.exitVelocityAvg, 1)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`stat-cell font-semibold ${isHighBarrel ? 'text-positive' : 'text-foreground'}`}>
                          {fmtStat(player.barrelRate, 1, '')}
                          {player.barrelRate !== null ? '%' : ''}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right stat-cell">
                        {fmtStat(player.hardHitPct, 1)}
                        {player.hardHitPct !== null ? '%' : ''}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`stat-cell ${isHighK ? 'text-negative font-semibold' : 'text-foreground'}`}>
                          {fmtStat(player.kPct, 1)}
                          {player.kPct !== null ? '%' : ''}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right stat-cell text-muted-foreground">
                        {fmtStat(player.bbPct, 1)}
                        {player.bbPct !== null ? '%' : ''}
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono-data">
          {loading ? '…' : `${players.length} players`}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={`page-${p}`}
              onClick={() => setPage(p)}
              className={`w-7 h-7 rounded font-mono-data text-xs transition-colors ${p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {p}
            </button>
          ))}
          {totalPages > 5 && <span className="px-1">…</span>}
        </div>
        <span className="font-mono-data">
          {loading ? '' : `Page ${page} of ${totalPages}`}
        </span>
      </div>
    </div>
  );
});

export default AdvancedAnalyticsTable;