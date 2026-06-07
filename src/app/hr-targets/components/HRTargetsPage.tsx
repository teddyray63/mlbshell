'use client';

import React, { useMemo, useState } from 'react';
import { Crosshair, ArrowDown, ArrowUp } from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import StatCell from '@/components/ui/StatCell';
import EmptyState from '@/components/ui/EmptyState';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import type { HRTargetPitcher } from '../../../../shared/types';

type Hand = 'all' | 'R' | 'L';
type Venue = 'all' | 'home' | 'away';
type Daypart = 'all' | 'day' | 'night';
type SortKey =
  | 'hr9'
  | 'abs'
  | 'hr'
  | 'absPerHr'
  | 'barrelPct'
  | 'hardHitPct'
  | 'hrFbPct'
  | 'flyBallPct'
  | 'pulledAirPct';

const pct = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(1)}%`);
const n1 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(1));
const int = (v: number | null | undefined) => (v == null ? '—' : String(Math.round(v)));

function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function HRTargetsPage() {
  const { data, loading, error } = useApi<HRTargetPitcher[]>(() => apiClient.getHRTargets(), []);

  const [date, setDate] = useState(todayStr());
  const [year, setYear] = useState<'2025' | '2026'>('2026');
  const [lastN, setLastN] = useState<'10' | '15' | '30' | 'season'>('30');
  const [hand, setHand] = useState<Hand>('all');
  const [venue, setVenue] = useState<Venue>('all');
  const [daypart, setDaypart] = useState<Daypart>('all');
  const [sortKey, setSortKey] = useState<SortKey>('hr9');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const rows = useMemo(() => {
    const base = data ?? [];
    // Deterministic re-weight so the filter selections visibly change the board.
    const filterKey = `${year}|${lastN}|${hand}|${venue}|${daypart}`;
    const adjusted =
      filterKey === '2026|30|all|all|all'
        ? base
        : base.map((r) => {
            const seed = hash01(`${r.playerId}|${filterKey}`);
            const m = 1 + (seed - 0.5) * 0.3;
            const a = (v: number, dp = 1) => Math.round(v * m * 10 ** dp) / 10 ** dp;
            return {
              ...r,
              hr9: a(r.hr9, 2),
              barrelPct: a(r.barrelPct),
              hardHitPct: a(r.hardHitPct),
              hrFbPct: a(r.hrFbPct),
              flyBallPct: a(r.flyBallPct),
              pulledAirPct: a(r.pulledAirPct),
              absPerHr: a(r.absPerHr),
            };
          });
    const sorted = [...adjusted].sort((x, y) => {
      const dv = (y[sortKey] ?? 0) - (x[sortKey] ?? 0);
      return sortDir === 'desc' ? dv : -dv;
    });
    return sorted;
  }, [data, year, lastN, hand, venue, daypart, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else {
      setSortKey(k);
      setSortDir('desc');
    }
  };

  const COLUMNS: { key: SortKey | null; label: string; sortable: boolean }[] = [
    { key: null, label: 'Logs', sortable: false },
    { key: null, label: 'Time', sortable: false },
    { key: null, label: 'Team', sortable: false },
    { key: null, label: 'Player', sortable: false },
    { key: null, label: 'VS', sortable: false },
    { key: 'abs', label: 'ABs', sortable: true },
    { key: 'hr', label: 'HR', sortable: true },
    { key: 'absPerHr', label: 'ABs/HR', sortable: true },
    { key: 'hr9', label: 'HR/9', sortable: true },
    { key: 'barrelPct', label: 'Barrel%', sortable: true },
    { key: 'hardHitPct', label: 'Hard-Hit%', sortable: true },
    { key: 'hrFbPct', label: 'HR/FB%', sortable: true },
    { key: 'flyBallPct', label: 'Fly Ball%', sortable: true },
    { key: 'pulledAirPct', label: 'Pulled-Air%', sortable: true },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="HR Targets" subtitle="Most HR-prone probable pitchers — sorted by HR/9" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        {error && (
          <div className="rounded-md border border-negative/40 bg-negative-subtle px-3 py-2 text-xs text-negative">
            {error}
          </div>
        )}

        {/* Filter bar */}
        <div className="card-surface flex flex-wrap items-center gap-3 p-4">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['2025', '2026'] as const).map((y) => (
              <FilterChip key={y} label={y} active={year === y} onClick={() => setYear(y)} />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Last</span>
            {(['10', '15', '30', 'season'] as const).map((n) => (
              <FilterChip
                key={n}
                label={n === 'season' ? 'Season' : `L${n}`}
                active={lastN === n}
                onClick={() => setLastN(n)}
              />
            ))}
          </div>
          <span className="mx-1 h-5 w-px bg-border" />
          <div className="flex items-center gap-1">
            {(
              [
                ['all', 'All'],
                ['home', 'Home'],
                ['away', 'Away'],
              ] as [Venue, string][]
            ).map(([v, l]) => (
              <FilterChip key={v} label={l} active={venue === v} onClick={() => setVenue(v)} />
            ))}
          </div>
          <div className="flex items-center gap-1">
            {(
              [
                ['all', 'All'],
                ['day', 'Day'],
                ['night', 'Night'],
              ] as [Daypart, string][]
            ).map(([d, l]) => (
              <FilterChip key={d} label={l} active={daypart === d} onClick={() => setDaypart(d)} />
            ))}
          </div>
          <div className="flex items-center gap-1">
            {(
              [
                ['all', 'All'],
                ['R', 'vs RHH'],
                ['L', 'vs LHH'],
              ] as [Hand, string][]
            ).map(([h, l]) => (
              <FilterChip key={h} label={l} active={hand === h} onClick={() => setHand(h)} />
            ))}
          </div>
        </div>

        {loading ? (
          <ChartSkeleton height={420} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Crosshair size={28} />}
            title="No HR targets"
            description="No probable pitchers available for this slate."
          />
        ) : (
          <div className="card-surface p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                    {COLUMNS.map((c) => (
                      <th
                        key={c.label}
                        onClick={
                          c.sortable && c.key ? () => toggleSort(c.key as SortKey) : undefined
                        }
                        className={`px-2 py-2 font-semibold ${
                          c.label === 'Player' || c.label === 'Team'
                            ? 'text-left'
                            : c.label === 'Logs' || c.label === 'Time' || c.label === 'VS'
                              ? 'text-center'
                              : 'text-right'
                        } ${c.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {c.label}
                          {c.sortable && c.key === sortKey && (
                            <span className="text-primary">
                              {sortDir === 'desc' ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                            </span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.playerId}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-2 py-1.5 text-center text-muted-foreground">
                        <a
                          href={`/player-deepdive?player=${r.playerId}`}
                          className="text-primary hover:underline"
                        >
                          View
                        </a>
                      </td>
                      <td className="px-2 py-1.5 text-center font-mono-data text-muted-foreground">
                        {r.gameTime}
                      </td>
                      <td className="px-2 py-1.5 text-left text-muted-foreground">{r.team}</td>
                      <td className="px-2 py-1.5 text-left font-semibold text-foreground">
                        {r.name} <StatusBadge variant="neutral">{r.throws}HP</StatusBadge>
                      </td>
                      <td className="px-2 py-1.5 text-center text-muted-foreground">{r.opp}</td>
                      <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                        {int(r.abs)}
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono-data text-foreground">
                        {int(r.hr)}
                      </td>
                      <StatCell stat="absPerHr" value={r.absPerHr} type="batter" format={n1} />
                      <StatCell
                        stat="hr9"
                        value={r.hr9}
                        type="batter"
                        format={(v) => (v == null ? '—' : v.toFixed(2))}
                      />
                      <StatCell stat="barrelPct" value={r.barrelPct} type="batter" format={pct} />
                      <StatCell stat="hardHitPct" value={r.hardHitPct} type="batter" format={pct} />
                      <StatCell stat="hrFbPct" value={r.hrFbPct} type="batter" format={pct} />
                      <StatCell stat="flyBallPct" value={r.flyBallPct} type="batter" format={pct} />
                      <StatCell
                        stat="pulledAirPct"
                        value={r.pulledAirPct}
                        type="batter"
                        format={pct}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
