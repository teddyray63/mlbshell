'use client';

import React, { useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';

import EmptyState from '@/components/ui/EmptyState';
import TodoMarker from '@/components/ui/TodoMarker';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart2 } from 'lucide-react';

// TODO: Replace with real player stat rows from analyticsService.fetchAdvancedStats()
const mockPlayers = [
  { id: 'player-001', name: 'Manny Ramirez Jr.',  team: 'LAD', pos: 'LF',  pa: 187, avg: '.301', obp: '.388', slg: '.521', woba: '.381', iso: '.220', barrelPct: 14.2, exitVelo: 93.1, kPct: 22.4, bbPct: 12.1, hand: 'R' },
  { id: 'player-002', name: 'Carlos Mendez',       team: 'HOU', pos: '2B',  pa: 201, avg: '.278', obp: '.341', slg: '.447', woba: '.348', iso: '.169', barrelPct: 9.8,  exitVelo: 90.4, kPct: 19.8, bbPct: 8.7,  hand: 'R' },
  { id: 'player-003', name: 'Derrick Holloway',    team: 'NYY', pos: 'CF',  pa: 165, avg: '.254', obp: '.318', slg: '.401', woba: '.321', iso: '.147', barrelPct: 7.3,  exitVelo: 88.9, kPct: 28.1, bbPct: 7.2,  hand: 'L' },
  { id: 'player-004', name: 'Rafael Ortega III',   team: 'ATL', pos: '1B',  pa: 223, avg: '.312', obp: '.401', slg: '.558', woba: '.401', iso: '.246', barrelPct: 18.6, exitVelo: 95.2, kPct: 24.7, bbPct: 13.4, hand: 'R' },
  { id: 'player-005', name: 'Tomás Vidal',         team: 'SD',  pos: 'SS',  pa: 178, avg: '.289', obp: '.352', slg: '.432', woba: '.344', iso: '.143', barrelPct: 8.1,  exitVelo: 89.7, kPct: 21.3, bbPct: 9.1,  hand: 'S' },
  { id: 'player-006', name: 'Marcus Webb',         team: 'BOS', pos: 'RF',  pa: 194, avg: '.242', obp: '.299', slg: '.389', woba: '.308', iso: '.147', barrelPct: 6.2,  exitVelo: 87.3, kPct: 31.8, bbPct: 6.8,  hand: 'L' },
  { id: 'player-007', name: 'Jaime Castillo',      team: 'MIN', pos: 'DH',  pa: 209, avg: '.295', obp: '.365', slg: '.498', woba: '.368', iso: '.203', barrelPct: 12.9, exitVelo: 92.8, kPct: 26.2, bbPct: 10.5, hand: 'R' },
  { id: 'player-008', name: 'Kevin Ashworth',      team: 'CHC', pos: '3B',  pa: 182, avg: '.268', obp: '.333', slg: '.421', woba: '.332', iso: '.153', barrelPct: 8.9,  exitVelo: 90.1, kPct: 23.5, bbPct: 8.9,  hand: 'R' },
  { id: 'player-009', name: 'Daisuke Nakamura',    team: 'SEA', pos: 'C',   pa: 141, avg: '.249', obp: '.308', slg: '.378', woba: '.307', iso: '.129', barrelPct: 5.8,  exitVelo: 86.4, kPct: 29.4, bbPct: 7.4,  hand: 'R' },
  { id: 'player-010', name: 'Elias Fontaine',      team: 'STL', pos: 'LF',  pa: 197, avg: '.307', obp: '.378', slg: '.511', woba: '.375', iso: '.204', barrelPct: 13.7, exitVelo: 92.3, kPct: 20.8, bbPct: 11.8, hand: 'L' },
];

type SortKey = keyof (typeof mockPlayers)[0];

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: 'asc' | 'desc' }) {
  if (col !== sortKey) return <ArrowUpDown size={12} className="text-muted-foreground/40" />;
  return dir === 'asc'
    ? <ArrowUp size={12} className="text-primary" />
    : <ArrowDown size={12} className="text-primary" />;
}

export default function AdvancedAnalyticsTable() {
  const [sortKey, setSortKey] = useState<SortKey>('woba');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [loading] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...mockPlayers].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const n = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? n : -n;
  });

  const cols: { key: SortKey; label: string; align?: string }[] = [
    { key: 'name',       label: 'Player' },
    { key: 'team',       label: 'Team',   align: 'center' },
    { key: 'pos',        label: 'Pos',    align: 'center' },
    { key: 'pa',         label: 'PA',     align: 'right' },
    { key: 'avg',        label: 'AVG',    align: 'right' },
    { key: 'obp',        label: 'OBP',    align: 'right' },
    { key: 'slg',        label: 'SLG',    align: 'right' },
    { key: 'woba',       label: 'wOBA',   align: 'right' },
    { key: 'iso',        label: 'ISO',    align: 'right' },
    { key: 'barrelPct',  label: 'Brl%',   align: 'right' },
    { key: 'exitVelo',   label: 'EV',     align: 'right' },
    { key: 'kPct',       label: 'K%',     align: 'right' },
    { key: 'bbPct',      label: 'BB%',    align: 'right' },
  ];

  return (
    <div className="card-surface overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <SectionHeader
          title="Player Stat Table"
          subtitle="Statcast-derived metrics — click column header to sort"
        />
        <TodoMarker
          pageName="AdvancedAnalytics Table"
          description="Replace mockPlayers with real data from analyticsService"
        />
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
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={`skel-row-${i}`} cols={cols.length} />
                ))
              : sorted.length === 0
              ? (
                <tr>
                  <td colSpan={cols.length}>
                    <EmptyState
                      icon={<BarChart2 size={32} />}
                      title="No players found"
                      description="Adjust your filters or search to find player stat data."
                    />
                  </td>
                </tr>
              )
              : sorted.map((player, rowIdx) => {
                  const isHighBarrel = player.barrelPct >= 12;
                  const isHighK      = player.kPct >= 28;
                  return (
                    <tr
                      key={player.id}
                      className={`border-b border-border/50 hover:bg-muted/30 transition-colors duration-100 ${rowIdx % 2 === 0 ? '' : 'bg-muted/10'}`}
                    >
                      <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                        {player.name}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="font-mono-data text-xs text-muted-foreground">{player.team}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="font-mono-data text-xs text-muted-foreground">{player.pos}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right stat-cell text-muted-foreground">{player.pa}</td>
                      <td className="px-3 py-2.5 text-right stat-cell">{player.avg}</td>
                      <td className="px-3 py-2.5 text-right stat-cell">{player.obp}</td>
                      <td className="px-3 py-2.5 text-right stat-cell">{player.slg}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`stat-cell font-semibold ${parseFloat(player.woba) >= 0.360 ? 'text-positive' : parseFloat(player.woba) <= 0.310 ? 'text-negative' : 'text-foreground'}`}>
                          {player.woba}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right stat-cell">{player.iso}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`stat-cell font-semibold ${isHighBarrel ? 'text-positive' : 'text-foreground'}`}>
                          {player.barrelPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right stat-cell">{player.exitVelo.toFixed(1)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`stat-cell ${isHighK ? 'text-negative font-semibold' : 'text-foreground'}`}>
                          {player.kPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right stat-cell text-muted-foreground">{player.bbPct.toFixed(1)}%</td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {/* Pagination stub */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono-data">{mockPlayers.length} players</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((p) => (
            <button
              key={`page-${p}`}
              className={`w-7 h-7 rounded font-mono-data text-xs transition-colors ${p === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span>Rows:</span>
          <select className="bg-muted border border-border rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}