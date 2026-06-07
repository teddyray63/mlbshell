'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserSearch } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCell from '@/components/ui/StatCell';
import FilterChip from '@/components/ui/FilterChip';
import EmptyState from '@/components/ui/EmptyState';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient, { type DeepDivePitcher } from '@/api/typedClient';
import { formatAvg } from '@/utils/formatters';
import type { PitcherDeepDive } from '../../../../shared/types';

type LogView = 'all' | 'home' | 'away' | 'started' | 'relieved';

const pct = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(1)}%`);
const n1 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(1));
const n2 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(2));
const int = (v: number | null | undefined) => (v == null ? '—' : String(Math.round(v)));

export default function PlayerDeepDivePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerId = searchParams.get('player');

  const [list, setList] = useState<DeepDivePitcher[]>([]);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<PitcherDeepDive | null>(null);
  const [loading, setLoading] = useState(true);
  const [logView, setLogView] = useState<LogView>('all');
  const [showPitchMetrics, setShowPitchMetrics] = useState(false);

  // Load selectable pitchers once.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const l = await apiClient.getDeepDiveList();
        if (!active) return;
        setList(l);
        if (!playerId && l[0]) router.replace(`/player-deepdive?player=${l[0].id}`);
      } catch (err) {
        console.error('[DeepDive] list error:', err);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the selected pitcher's deep dive.
  useEffect(() => {
    if (!playerId) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const d = await apiClient.getDeepDive(playerId);
        if (active) setData(d);
      } catch (err) {
        console.error('[DeepDive] payload error:', err);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [playerId]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;
  }, [list, search]);

  const gameLog = useMemo(() => {
    const log = data?.gameLog ?? [];
    switch (logView) {
      case 'home':
        return log.filter((g) => g.home);
      case 'away':
        return log.filter((g) => !g.home);
      case 'started':
        return log.filter((g) => g.started);
      case 'relieved':
        return log.filter((g) => !g.started);
      default:
        return log;
    }
  }, [data, logView]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title="Player Deep Dive" subtitle="Season stats, advanced splits & game log" />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        {/* Player selector */}
        <div className="card-surface flex flex-wrap items-center gap-3 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Player
          </span>
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground"
          />
          <select
            value={playerId ?? ''}
            onChange={(e) => router.push(`/player-deepdive?player=${e.target.value}`)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground"
          >
            {filteredList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.team} ({p.throws}HP)
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <ChartSkeleton height={420} />
        ) : !data ? (
          <EmptyState
            icon={<UserSearch size={28} />}
            title="No player selected"
            description="Pick a pitcher to see their full deep dive."
          />
        ) : (
          <>
            {/* Header */}
            <div className="card-surface flex flex-wrap items-center gap-3 p-5">
              <h2 className="text-xl font-bold text-foreground">{data.name}</h2>
              <StatusBadge variant="neutral">{data.team}</StatusBadge>
              <StatusBadge variant="info">{data.throws}HP</StatusBadge>
            </div>

            {/* Season stats */}
            <div className="card-surface p-4">
              <SectionHeader title="Season Stats" subtitle="Year-by-year pitching line" />
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                      {[
                        'Season',
                        'G',
                        'GS',
                        'W',
                        'L',
                        'IP',
                        'R',
                        'ER',
                        'H',
                        'K',
                        'BB',
                        'HR',
                        'ERA',
                        'H/9',
                        'K/9',
                        'BB/9',
                        'HR/9',
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-2 py-2 font-semibold ${h === 'Season' ? 'text-left' : 'text-right'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.season.map((s) => (
                      <tr key={s.season} className="border-b border-border/50">
                        <td className="px-2 py-1.5 text-left font-semibold text-foreground">
                          {s.season}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(s.g)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(s.gs)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-foreground">
                          {int(s.w)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(s.l)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-foreground">
                          {n1(s.ip)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(s.r)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(s.er)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(s.h)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-foreground">
                          {int(s.k)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(s.bb)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(s.hr)}
                        </td>
                        <StatCell stat="era" value={s.era} type="pitcher" format={n2} />
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {n1(s.h9)}
                        </td>
                        <StatCell stat="k9" value={s.k9} type="pitcher" format={n1} />
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {n1(s.bb9)}
                        </td>
                        <StatCell stat="hr9" value={s.hr9} type="pitcher" format={n2} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advanced splits */}
            <div className="card-surface p-4">
              <SectionHeader
                title="Advanced Splits"
                subtitle="vs L / vs R / Total / % Rank — Statcast"
              />
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                      {[
                        'Split',
                        'IP',
                        'K%',
                        'BB%',
                        'wOBA',
                        'xwOBA',
                        'ISO',
                        'bar/PA',
                        'bar/BBE',
                        'BABIP',
                        'GB%',
                        'LD%',
                        'FB%',
                        'PU%',
                        '95+%',
                        'aEV',
                        'aLA',
                        'HR/FB',
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
                    {data.advancedSplits.map((s) => (
                      <tr key={s.split} className="border-b border-border/50">
                        <td className="px-2 py-1.5 text-left font-semibold text-foreground">
                          {s.split}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {s.ip == null ? '—' : n1(s.ip)}
                        </td>
                        <StatCell stat="kPct" value={s.kPct} type="pitcher" format={pct} />
                        <StatCell stat="bbPct" value={s.bbPct} type="pitcher" format={pct} />
                        <StatCell stat="woba" value={s.woba} type="pitcher" format={formatAvg} />
                        <StatCell stat="xwoba" value={s.xwoba} type="pitcher" format={formatAvg} />
                        <StatCell stat="iso" value={s.iso} type="pitcher" format={formatAvg} />
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {n2(s.barPerPa)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {n2(s.barPerBbe)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {formatAvg(s.babip)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {pct(s.gbPct)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {pct(s.ldPct)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {pct(s.fbPct)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {pct(s.puPct)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {pct(s.hard95Pct)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {n1(s.aev)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {n1(s.ala)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {pct(s.hrFb)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Game log */}
            <div className="card-surface p-4">
              <SectionHeader
                title="Game Log"
                subtitle={`${gameLog.length} games`}
                actions={
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        ['all', 'All'],
                        ['away', 'Away'],
                        ['home', 'Home'],
                        ['started', 'Games Started'],
                        ['relieved', 'Games Relieved'],
                      ] as [LogView, string][]
                    ).map(([v, l]) => (
                      <FilterChip
                        key={v}
                        label={l}
                        active={logView === v}
                        onClick={() => setLogView(v)}
                      />
                    ))}
                    <span className="mx-1 h-4 w-px bg-border" />
                    <FilterChip
                      label="Pitch Metrics"
                      active={showPitchMetrics}
                      onClick={() => setShowPitchMetrics((s) => !s)}
                    />
                  </div>
                }
              />
              {gameLog.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">No games match this filter.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                        {[
                          'Date',
                          'Opp',
                          'DK Pts',
                          'Pitch Count',
                          'IP',
                          'R',
                          'ER',
                          'H',
                          'BB',
                          'K',
                          'HR',
                          ...(showPitchMetrics
                            ? ['Vel', 'SwStr%', 'Whiff%', 'wOBA', 'xwOBA', 'ISO']
                            : []),
                        ].map((h) => (
                          <th
                            key={h}
                            className={`px-2 py-2 font-semibold ${h === 'Date' || h === 'Opp' ? 'text-left' : 'text-right'}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gameLog.map((g, i) => (
                        <tr key={`${g.date}-${i}`} className="border-b border-border/50">
                          <td className="px-2 py-1.5 text-left font-mono-data text-muted-foreground">
                            {g.date}
                          </td>
                          <td className="px-2 py-1.5 text-left text-muted-foreground">
                            {g.home ? 'vs' : '@'} {g.opp}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-foreground">
                            {n1(g.dkPts)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                            {int(g.pitchCount)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-foreground">
                            {n1(g.ip)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                            {int(g.r)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                            {int(g.er)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                            {int(g.h)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                            {int(g.bb)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-foreground">
                            {int(g.k)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                            {int(g.hr)}
                          </td>
                          {showPitchMetrics && (
                            <>
                              <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                                {n1(g.velo)}
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                                {pct(g.swstrPct)}
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                                {pct(g.whiffPct)}
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                                {formatAvg(g.woba)}
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                                {formatAvg(g.xwoba)}
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                                {formatAvg(g.iso)}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
