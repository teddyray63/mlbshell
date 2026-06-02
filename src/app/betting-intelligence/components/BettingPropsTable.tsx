'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

interface PropLine {
  id: string;
  player: string;
  team: string;
  opponent: string;
  prop: string;
  line: number | string;
  overOdds: number | string;
  underOdds: number | string;
  ev: number;
  sharp: boolean;
  consensus: number;
  status: string;
  projection?: number;
  hitRate?: number;
}

type FilterStatus = 'all' | 'steam' | 'value' | 'fade' | 'neutral';

const statusBadge: Record<string, { variant: 'warning' | 'positive' | 'negative' | 'neutral'; label: string }> = {
  steam:   { variant: 'warning',  label: 'Steam'   },
  value:   { variant: 'positive', label: 'Value'   },
  fade:    { variant: 'negative', label: 'Fade'    },
  neutral: { variant: 'neutral',  label: 'Neutral' },
};

const ROWS_PER_PAGE = 10;

interface BettingPropsTableProps {
  playerFilter?: string;
  teamFilter?: string;
  gameFilter?: string;
}

export default function BettingPropsTable({ playerFilter = '', teamFilter = '', gameFilter = '' }: BettingPropsTableProps) {
  const [props, setProps] = useState<PropLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortKey, setSortKey] = useState<'ev' | 'consensus'>('ev');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const date = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/player-props?date=${date}`);
      const json = await res.json();
      // Map API response to PropLine shape
      const mapped: PropLine[] = (json.props ?? []).map((p: Record<string, unknown>) => ({
        id: String(p.id),
        player: String(p.player),
        team: String(p.team),
        opponent: String(p.opponent ?? ''),
        prop: String(p.prop),
        line: p.line as number,
        overOdds: p.overOdds as number,
        underOdds: p.underOdds as number,
        ev: Number(p.edge ?? 0),
        sharp: Boolean(p.sharp),
        consensus: Number(p.consensus ?? 50),
        status: String(p.status ?? 'neutral'),
        projection: p.projection as number | undefined,
        hitRate: p.hitRate as number | undefined,
      }));
      setProps(mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load props');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSort = (key: 'ev' | 'consensus') => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  const filtered = props
    .filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (playerFilter && !p.player.toLowerCase().includes(playerFilter.toLowerCase())) return false;
      if (teamFilter && p.team !== teamFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDir === 'asc' ? diff : -diff;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <div className="card-surface overflow-hidden">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Today's Prop Lines"
            subtitle="Opening vs. current line — EV% and sharp consensus"
          />
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'steam', 'value', 'fade', 'neutral'] as FilterStatus[]).map((f) => (
            <button
              key={`filter-${f}`}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 capitalize
                ${filter === f
                  ? 'bg-info-subtle text-primary border-primary/40' :'bg-muted text-muted-foreground border-border hover:border-primary/30'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-negative/10 border-b border-negative/30 text-xs text-negative flex items-center gap-2">
          <span>Failed to load props: {error}</span>
          <button onClick={loadData} className="underline">Retry</button>
        </div>
      )}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                { key: 'player',    label: 'Player',    align: 'left',   sortable: false },
                { key: 'team',      label: 'Team',      align: 'center', sortable: false },
                { key: 'prop',      label: 'Prop',      align: 'left',   sortable: false },
                { key: 'line',      label: 'Line',      align: 'center', sortable: false },
                { key: 'ev',        label: 'EV%',       align: 'right',  sortable: true  },
                { key: 'sharp',     label: 'Sharp',     align: 'center', sortable: false },
                { key: 'consensus', label: 'Consensus', align: 'right',  sortable: true  },
                { key: 'status',    label: 'Signal',    align: 'center', sortable: false },
              ].map((col) => (
                <th
                  key={`bth-${col.key}`}
                  onClick={col.sortable ? () => handleSort(col.key as 'ev' | 'consensus') : undefined}
                  aria-sort={col.sortable && sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                    ${col.sortable ? 'cursor-pointer hover:text-foreground transition-colors' : ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === 'asc' ? <ArrowUp size={11} className="text-primary" /> : <ArrowDown size={11} className="text-primary" />
                        : <ArrowUpDown size={11} className="text-muted-foreground/40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={`bskel-${i}`} cols={8} />
                ))
              : paginated.length === 0
              ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={<TrendingUp size={32} />}
                      title="No prop lines match this filter"
                      description="Try switching to 'all' or check back when today's slate is posted."
                    />
                  </td>
                </tr>
              )
              : paginated.map((prop, rowIdx) => {
                  const evPositive = prop.ev >= 3;
                  const evNegative = prop.ev <= -2;
                  return (
                    <tr
                      key={prop.id}
                      className={`border-b border-border/50 hover:bg-muted/30 transition-colors duration-100 ${rowIdx % 2 === 0 ? '' : 'bg-muted/10'}`}
                    >
                      <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{prop.player}</td>
                      <td className="px-3 py-2.5 text-center font-mono-data text-xs text-muted-foreground">{prop.team}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{prop.prop}</td>
                      <td className="px-3 py-2.5 text-center font-mono-data text-xs font-semibold">{prop.line}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`font-mono-data text-xs font-bold ${evPositive ? 'text-positive' : evNegative ? 'text-negative' : 'text-muted-foreground'}`}>
                          {prop.ev >= 0 ? '+' : ''}{prop.ev.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {prop.sharp
                          ? <StatusBadge variant="sharp" dot>Sharp</StatusBadge>
                          : <StatusBadge variant="square">Public</StatusBadge>
                        }
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${prop.consensus >= 65 ? 'bg-positive' : prop.consensus <= 40 ? 'bg-negative' : 'bg-primary'}`}
                              style={{ width: `${prop.consensus}%` }}
                            />
                          </div>
                          <span className="font-mono-data text-xs text-muted-foreground w-8 text-right">{prop.consensus}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <StatusBadge variant={statusBadge[prop.status]?.variant ?? 'neutral'}>
                          {statusBadge[prop.status]?.label ?? prop.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {/* Real pagination */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono-data">{filtered.length} of {props.length} props</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={`bpage-${p}`}
              onClick={() => setPage(p)}
              className={`w-7 h-7 rounded font-mono-data text-xs transition-colors ${p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {p}
            </button>
          ))}
          {totalPages > 5 && <span className="px-1">…</span>}
        </div>
        <span className="font-mono-data">Page {page} of {totalPages}</span>
      </div>
    </div>
  );
}