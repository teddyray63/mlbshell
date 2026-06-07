'use client';

import React, { useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

// TODO: Replace with real prop line data from bettingService.fetchTodayPropLines()
const mockProps = [
  {
    id: 'prop-001',
    player: 'Rafael Ortega III',
    team: 'ATL',
    prop: 'Total Bases',
    open: 1.5,
    current: 2.5,
    ev: 5.2,
    sharp: true,
    consensus: 72,
    status: 'steam',
  },
  {
    id: 'prop-002',
    player: 'Jaime Castillo',
    team: 'MIN',
    prop: 'HR',
    open: '+280',
    current: '+240',
    ev: 3.8,
    sharp: true,
    consensus: 58,
    status: 'value',
  },
  {
    id: 'prop-003',
    player: 'Manny Ramirez Jr.',
    team: 'LAD',
    prop: 'Strikeouts',
    open: 0.5,
    current: 0.5,
    ev: -1.4,
    sharp: false,
    consensus: 44,
    status: 'neutral',
  },
  {
    id: 'prop-004',
    player: 'Elias Fontaine',
    team: 'STL',
    prop: 'RBI',
    open: 0.5,
    current: 1.5,
    ev: 4.1,
    sharp: true,
    consensus: 65,
    status: 'value',
  },
  {
    id: 'prop-005',
    player: 'Carlos Mendez',
    team: 'HOU',
    prop: 'Hits',
    open: 0.5,
    current: 1.5,
    ev: 2.9,
    sharp: false,
    consensus: 51,
    status: 'neutral',
  },
  {
    id: 'prop-006',
    player: 'Tomás Vidal',
    team: 'SD',
    prop: 'Total Bases',
    open: 1.5,
    current: 1.5,
    ev: -2.7,
    sharp: false,
    consensus: 38,
    status: 'fade',
  },
  {
    id: 'prop-007',
    player: 'Marcus Webb',
    team: 'BOS',
    prop: 'Strikeouts',
    open: 0.5,
    current: 0.5,
    ev: -0.8,
    sharp: false,
    consensus: 47,
    status: 'neutral',
  },
  {
    id: 'prop-008',
    player: 'Kevin Ashworth',
    team: 'CHC',
    prop: 'HR',
    open: '+320',
    current: '+290',
    ev: 1.9,
    sharp: false,
    consensus: 52,
    status: 'neutral',
  },
  {
    id: 'prop-009',
    player: 'Daisuke Nakamura',
    team: 'SEA',
    prop: 'Hits',
    open: 0.5,
    current: 0.5,
    ev: -3.2,
    sharp: false,
    consensus: 35,
    status: 'fade',
  },
  {
    id: 'prop-010',
    player: 'Derrick Holloway',
    team: 'NYY',
    prop: 'Total Bases',
    open: 1.5,
    current: 2.5,
    ev: 6.7,
    sharp: true,
    consensus: 78,
    status: 'steam',
  },
];

type FilterStatus = 'all' | 'steam' | 'value' | 'fade' | 'neutral';

const statusBadge: Record<
  string,
  { variant: 'warning' | 'positive' | 'negative' | 'neutral'; label: string }
> = {
  steam: { variant: 'warning', label: 'Steam' },
  value: { variant: 'positive', label: 'Value' },
  fade: { variant: 'negative', label: 'Fade' },
  neutral: { variant: 'neutral', label: 'Neutral' },
};

export default function BettingPropsTable() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortKey, setSortKey] = useState<'ev' | 'consensus'>('ev');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [loading] = useState(false);

  const filtered = mockProps
    .filter((p) => filter === 'all' || p.status === filter)
    .sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDir === 'asc' ? diff : -diff;
    });

  const handleSort = (key: 'ev' | 'consensus') => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="card-surface overflow-hidden">
      <div className="p-4 border-b border-border space-y-3">
        <SectionHeader
          title="Today's Prop Lines"
          subtitle="Opening vs. current line — EV% and sharp consensus"
        />
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'steam', 'value', 'fade', 'neutral'] as FilterStatus[]).map((f) => (
            <button
              key={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 capitalize
                ${
                  filter === f
                    ? 'bg-info-subtle text-primary border-primary/40'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/30'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                { key: 'player', label: 'Player', align: 'left', sortable: false },
                { key: 'team', label: 'Team', align: 'center', sortable: false },
                { key: 'prop', label: 'Prop', align: 'left', sortable: false },
                { key: 'open', label: 'Open', align: 'center', sortable: false },
                { key: 'current', label: 'Current', align: 'center', sortable: false },
                { key: 'ev', label: 'EV%', align: 'right', sortable: true },
                { key: 'sharp', label: 'Sharp', align: 'center', sortable: false },
                { key: 'consensus', label: 'Consensus', align: 'right', sortable: true },
                { key: 'status', label: 'Signal', align: 'center', sortable: false },
              ].map((col) => (
                <th
                  key={`bth-${col.key}`}
                  onClick={
                    col.sortable ? () => handleSort(col.key as 'ev' | 'consensus') : undefined
                  }
                  className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                    ${col.sortable ? 'cursor-pointer hover:text-foreground transition-colors' : ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable &&
                      (sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp size={11} className="text-primary" />
                        ) : (
                          <ArrowDown size={11} className="text-primary" />
                        )
                      ) : (
                        <ArrowUpDown size={11} className="text-muted-foreground/40" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRowSkeleton key={`bskel-${i}`} cols={9} />
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState
                    icon={<TrendingUp size={32} />}
                    title="No prop lines match this filter"
                    description="Try switching to 'all' or check back when today's slate is posted."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((prop, rowIdx) => {
                const evPositive = prop.ev >= 3;
                const evNegative = prop.ev <= -2;
                const moved = String(prop.open) !== String(prop.current);
                return (
                  <tr
                    key={prop.id}
                    className={`border-b border-border/50 hover:bg-muted/30 transition-colors duration-100 ${rowIdx % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                      {prop.player}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono-data text-xs text-muted-foreground">
                      {prop.team}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{prop.prop}</td>
                    <td className="px-3 py-2.5 text-center font-mono-data text-xs text-muted-foreground">
                      {prop.open}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`font-mono-data text-xs font-semibold ${moved ? 'text-warning' : 'text-muted-foreground'}`}
                      >
                        {prop.current}
                        {moved && <span className="ml-1 text-warning">↑</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={`font-mono-data text-xs font-bold ${evPositive ? 'text-positive' : evNegative ? 'text-negative' : 'text-muted-foreground'}`}
                      >
                        {prop.ev >= 0 ? '+' : ''}
                        {prop.ev.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {prop.sharp ? (
                        <StatusBadge variant="sharp" dot>
                          Sharp
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="square">Public</StatusBadge>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${prop.consensus >= 65 ? 'bg-positive' : prop.consensus <= 40 ? 'bg-negative' : 'bg-primary'}`}
                            style={{ width: `${prop.consensus}%` }}
                          />
                        </div>
                        <span className="font-mono-data text-xs text-muted-foreground w-8 text-right">
                          {prop.consensus}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <StatusBadge variant={statusBadge[prop.status].variant}>
                        {statusBadge[prop.status].label}
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono-data">
          {filtered.length} of {mockProps.length} props
        </span>
        <div className="flex items-center gap-1">
          {[1, 2].map((p) => (
            <button
              key={`bpage-${p}`}
              className={`w-7 h-7 rounded font-mono-data text-xs transition-colors ${p === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {p}
            </button>
          ))}
        </div>
        <span>Updated: 4:32 PM ET</span>
      </div>
    </div>
  );
}
