'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { User } from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import StatCell from '@/components/ui/StatCell';
import EmptyState from '@/components/ui/EmptyState';
import PlayerPhoto from '@/components/ui/PlayerPhoto';
import SaveEdgeButton from '@/components/ui/SaveEdgeButton';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import type { PlayerPage, BatterGameLogRow } from '../../../../../shared/types';

type Tab = 'prop' | 'logs' | 'splits' | 'pa' | 'odds';
type Venue = 'all' | 'home' | 'away';

interface PropDef {
  key: string;
  label: string;
  col: keyof BatterGameLogRow;
  line: number;
}

const PROPS: PropDef[] = [
  { key: 'hits', label: 'Hits', col: 'h', line: 0.5 },
  { key: 'tb', label: 'Total Bases', col: 'tb', line: 1.5 },
  { key: 'hr', label: 'Home Runs', col: 'hr', line: 0.5 },
  { key: 'rbi', label: 'RBIs', col: 'rbi', line: 0.5 },
  { key: 'runs', label: 'Runs', col: 'r', line: 0.5 },
  { key: 'walks', label: 'Walks', col: 'bb', line: 0.5 },
  { key: 'ks', label: 'Strikeouts', col: 'k', line: 0.5 },
];

const n3 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(3).replace(/^0/, ''));
const n2 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(2));
const n1 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(1));
const pct = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(1)}%`);
const odds = (v: number) => (v > 0 ? `+${v}` : `${v}`);

export default function PlayerPageView({ playerId }: { playerId: string }) {
  const search = useSearchParams();
  const initialProp = search.get('prop') || 'hits';
  const { data, loading, error } = useApi<PlayerPage>(
    () => apiClient.getPlayerPage(playerId),
    [playerId]
  );

  const [tab, setTab] = useState<Tab>('prop');
  const [activeProp, setActiveProp] = useState(initialProp);
  const [venue, setVenue] = useState<Venue>('all');
  const [recency, setRecency] = useState<'10' | '15' | 'all'>('15');

  const prop = PROPS.find((p) => p.key === activeProp) ?? PROPS[0];

  const log = useMemo(() => {
    let rows = data?.gameLog ?? [];
    if (venue === 'home') rows = rows.filter((r) => r.home);
    if (venue === 'away') rows = rows.filter((r) => !r.home);
    if (recency !== 'all') rows = rows.slice(0, Number(recency));
    return rows;
  }, [data, venue, recency]);

  const hitRate = useMemo(() => {
    if (!log.length) return { hits: 0, games: 0, pct: 0 };
    const hits = log.filter((r) => Number(r[prop.col]) > prop.line).length;
    return { hits, games: log.length, pct: Math.round((hits / log.length) * 100) };
  }, [log, prop]);

  const avgRow = useMemo(() => {
    const cols: (keyof BatterGameLogRow)[] = ['ab', 'h', 'r', 'rbi', 'b1', 'b2', 'b3', 'hr', 'tb'];
    const sums: Record<string, number> = {};
    for (const c of cols) sums[c] = log.reduce((s, r) => s + Number(r[c]), 0);
    const g = Math.max(1, log.length);
    return { sums, perG: (c: string) => sums[c] / g };
  }, [log]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Topbar title="Player" subtitle="Loading player profile…" />
        <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
          <ChartSkeleton height={120} />
          <ChartSkeleton height={360} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Topbar title="Player" />
        <div className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-5">
          <EmptyState
            icon={<User size={32} />}
            title="Player not found"
            description={error || 'No data available for this player.'}
          />
        </div>
      </div>
    );
  }

  const p = data;
  const TABS: { key: Tab; label: string }[] = [
    { key: 'prop', label: 'Prop Analysis' },
    { key: 'logs', label: 'Game Logs' },
    { key: 'splits', label: 'Splits' },
    { key: 'pa', label: 'Plate Appearances' },
    { key: 'odds', label: 'Odds' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar title={p.name} subtitle={`${p.team} · ${p.position}`} />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        {/* Player header */}
        <div className="card-surface flex flex-wrap items-center gap-4 p-4">
          <PlayerPhoto playerId={p.playerId} alt={p.name} size={64} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{p.name}</h2>
              {p.lineupConfirmed ? (
                <StatusBadge variant="positive" dot>
                  Confirmed
                </StatusBadge>
              ) : (
                <StatusBadge variant="neutral">Expected</StatusBadge>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {p.team} · {p.position} · Bats {p.bats} / Throws {p.throws}
            </div>
            {p.todayOpp && (
              <div className="mt-1 text-xs text-foreground">
                Today: vs {p.todayOpp} {p.todayTime ? `at ${p.todayTime}` : ''}{' '}
                {p.todayVenue ? `— ${p.todayVenue}` : ''}
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { l: 'AVG', v: n3(p.season.avg) },
              { l: 'HR', v: p.season.hr ?? '—' },
              { l: 'wOBA', v: n3(p.season.woba) },
              { l: 'Barrel%', v: pct(p.season.barrelPct) },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
                <div className="font-mono-data text-sm font-semibold text-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'prop' && (
          <>
            {/* Prop selector */}
            <div className="flex flex-wrap gap-2">
              {PROPS.map((pr) => (
                <FilterChip
                  key={pr.key}
                  label={pr.label}
                  active={pr.key === activeProp}
                  onClick={() => setActiveProp(pr.key)}
                />
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip label="All" active={venue === 'all'} onClick={() => setVenue('all')} />
              <FilterChip label="Home" active={venue === 'home'} onClick={() => setVenue('home')} />
              <FilterChip label="Away" active={venue === 'away'} onClick={() => setVenue('away')} />
              <span className="mx-1 h-4 w-px bg-border" />
              <FilterChip label="L10" active={recency === '10'} onClick={() => setRecency('10')} />
              <FilterChip label="L15" active={recency === '15'} onClick={() => setRecency('15')} />
              <FilterChip
                label="Season"
                active={recency === 'all'}
                onClick={() => setRecency('all')}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Batter game log */}
              <div className="card-surface overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <h3 className="text-sm font-semibold text-foreground">Batter Game Log</h3>
                  <span className="text-xs text-muted-foreground">
                    {prop.label} hit rate{' '}
                    <span className="font-mono-data text-foreground">
                      {hitRate.hits}/{hitRate.games} ({hitRate.pct}%)
                    </span>
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        {['DATE', 'OPP', 'AB', 'H', 'R', 'RBI', '1B', '2B', '3B', 'HR', 'TB'].map(
                          (h) => (
                            <th
                              key={h}
                              className={`px-2 py-1.5 text-right font-medium ${
                                h === prop.label.slice(0, 2).toUpperCase() ? 'text-primary' : ''
                              }`}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {log.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="px-3 py-6 text-center text-muted-foreground">
                            No games for this filter.
                          </td>
                        </tr>
                      ) : (
                        log.map((r, i) => {
                          const hit = Number(r[prop.col]) > prop.line;
                          return (
                            <tr key={`${r.date}-${i}`} className="border-b border-border/40">
                              <td className="px-2 py-1.5 text-right text-muted-foreground">
                                {r.date.slice(5)}
                              </td>
                              <td className="px-2 py-1.5 text-right">
                                {r.home ? 'vs' : '@'} {r.opp}
                              </td>
                              {(['ab', 'h', 'r', 'rbi', 'b1', 'b2', 'b3', 'hr', 'tb'] as const).map(
                                (c) => (
                                  <td
                                    key={c}
                                    className={`px-2 py-1.5 text-right font-mono-data ${
                                      c === prop.col
                                        ? hit
                                          ? 'bg-positive/15 font-bold text-positive'
                                          : 'bg-negative/10 text-negative'
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {Number(r[c])}
                                  </td>
                                )
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {log.length > 0 && (
                      <tfoot>
                        <tr className="border-t border-border bg-muted/30 font-semibold">
                          <td className="px-2 py-1.5 text-right text-muted-foreground" colSpan={2}>
                            AVG / G
                          </td>
                          {(['ab', 'h', 'r', 'rbi', 'b1', 'b2', 'b3', 'hr', 'tb'] as const).map(
                            (c) => (
                              <td key={c} className="px-2 py-1.5 text-right font-mono-data">
                                {avgRow.perG(c).toFixed(1)}
                              </td>
                            )
                          )}
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Opposing pitcher log */}
              <div className="card-surface overflow-hidden">
                <div className="border-b border-border px-3 py-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {p.opposingPitcher
                      ? `Opposing SP: ${p.opposingPitcher.name} (${p.opposingPitcher.throws}HP)`
                      : 'Opposing Pitcher'}
                  </h3>
                </div>
                {p.opposingPitcher && p.opposingPitcher.gameLog.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          {['DATE', 'OPP', 'IP', 'W', 'H', 'ER', 'BB', 'K', 'HR'].map((h) => (
                            <th key={h} className="px-2 py-1.5 text-right font-medium">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {p.opposingPitcher.gameLog.slice(0, 15).map((r, i) => (
                          <tr key={`${r.date}-${i}`} className="border-b border-border/40">
                            <td className="px-2 py-1.5 text-right text-muted-foreground">
                              {r.date.slice(5)}
                            </td>
                            <td className="px-2 py-1.5 text-right">
                              {r.home ? 'vs' : '@'} {r.opp}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono-data">
                              {r.ip.toFixed(1)}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono-data">
                              {r.win ? 'W' : '—'}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono-data">{r.h}</td>
                            <td className="px-2 py-1.5 text-right font-mono-data">{r.er}</td>
                            <td className="px-2 py-1.5 text-right font-mono-data">{r.bb}</td>
                            <StatCell stat="strikeouts" value={r.k} type="pitcher" />
                            <td className="px-2 py-1.5 text-right font-mono-data">{r.hr}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState title="No game today" description="No opposing pitcher scheduled." />
                )}

                {/* Batter vs pitcher */}
                {p.batterVsPitcher && (
                  <div className="border-t border-border px-3 py-3">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Career vs {p.batterVsPitcher.pitcher}
                    </h4>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      {[
                        { l: 'AB', v: p.batterVsPitcher.ab },
                        { l: 'H', v: p.batterVsPitcher.h },
                        { l: 'HR', v: p.batterVsPitcher.hr },
                        { l: 'AVG', v: n3(p.batterVsPitcher.avg) },
                        { l: 'SLG', v: n3(p.batterVsPitcher.slg) },
                      ].map((s) => (
                        <div key={s.l}>
                          <div className="text-muted-foreground">{s.l}</div>
                          <div className="font-mono-data font-semibold text-foreground">{s.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Best lines strip */}
            {p.bestLines && p.bestLines.length > 0 && (
              <div className="card-surface flex flex-wrap items-center gap-3 p-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Best Lines
                </span>
                {p.bestLines.map((bl, i) => (
                  <div
                    key={`${bl.book}-${i}`}
                    className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 text-xs"
                  >
                    <span className="font-semibold text-foreground">{bl.book}</span>
                    <span className="font-mono-data text-muted-foreground">o{bl.line}</span>
                    <span className="font-mono-data text-positive">{odds(bl.overOdds)}</span>
                    <span className="font-mono-data text-negative">{odds(bl.underOdds)}</span>
                  </div>
                ))}
                <div className="ml-auto">
                  <SaveEdgeButton
                    edge={{
                      propId: `${p.playerId}-${prop.key}`,
                      player: p.name,
                      prop: prop.label,
                      line: prop.line,
                      direction: 'over',
                      edge: hitRate.pct - 50,
                      confidence: hitRate.pct >= 70 ? 'high' : hitRate.pct >= 55 ? 'medium' : 'low',
                    }}
                    size="md"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'logs' && (
          <div className="card-surface overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  {[
                    'DATE',
                    'OPP',
                    'AB',
                    'H',
                    'R',
                    'RBI',
                    '1B',
                    '2B',
                    '3B',
                    'HR',
                    'TB',
                    'BB',
                    'K',
                    'SB',
                  ].map((h) => (
                    <th key={h} className="px-2 py-1.5 text-right font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.gameLog ?? []).map((r, i) => (
                  <tr key={`${r.date}-${i}`} className="border-b border-border/40">
                    <td className="px-2 py-1.5 text-right text-muted-foreground">
                      {r.date.slice(5)}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {r.home ? 'vs' : '@'} {r.opp}
                    </td>
                    {(
                      [
                        'ab',
                        'h',
                        'r',
                        'rbi',
                        'b1',
                        'b2',
                        'b3',
                        'hr',
                        'tb',
                        'bb',
                        'k',
                        'sb',
                      ] as const
                    ).map((c) => (
                      <td key={c} className="px-2 py-1.5 text-right font-mono-data text-foreground">
                        {Number(r[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'splits' && (
          <div className="card-surface overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  {[
                    'SPLIT',
                    'G',
                    'AB',
                    'H',
                    'HR',
                    'RBI',
                    'AVG',
                    'OBP',
                    'SLG',
                    'OPS',
                    'ISO',
                    'BB%',
                    'K%',
                    'wOBA',
                    'xwOBA',
                  ].map((h) => (
                    <th key={h} className="px-2 py-1.5 text-right font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/40">
                  <td className="px-2 py-1.5 text-left font-semibold text-foreground">Season</td>
                  <td className="px-2 py-1.5 text-right font-mono-data">{data.season.g ?? '—'}</td>
                  <td className="px-2 py-1.5 text-right font-mono-data">{data.season.ab ?? '—'}</td>
                  <td className="px-2 py-1.5 text-right font-mono-data">{data.season.h ?? '—'}</td>
                  <td className="px-2 py-1.5 text-right font-mono-data">{data.season.hr ?? '—'}</td>
                  <td className="px-2 py-1.5 text-right font-mono-data">
                    {data.season.rbi ?? '—'}
                  </td>
                  <StatCell stat="avg" value={data.season.avg} type="batter" format={n3} />
                  <td className="px-2 py-1.5 text-right font-mono-data">{n3(data.season.obp)}</td>
                  <StatCell stat="slg" value={data.season.slg} type="batter" format={n3} />
                  <td className="px-2 py-1.5 text-right font-mono-data">{n3(data.season.ops)}</td>
                  <StatCell stat="iso" value={data.season.iso} type="batter" format={n3} />
                  <td className="px-2 py-1.5 text-right font-mono-data">
                    {pct(data.season.bbPct)}
                  </td>
                  <StatCell stat="kPct" value={data.season.kPct} type="batter" format={pct} />
                  <StatCell stat="wOBA" value={data.season.woba} type="batter" format={n3} />
                  <StatCell stat="xwOBA" value={data.season.xwoba} type="batter" format={n3} />
                </tr>
              </tbody>
            </table>
            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
              {[
                { l: 'Exit Velo', v: n1(data.season.exitVelo), s: 'exitVelo' },
                { l: 'Barrel%', v: pct(data.season.barrelPct), s: 'barrelPct' },
                { l: 'Hard-Hit%', v: pct(data.season.hardHitPct), s: 'hardHitPct' },
                { l: 'OPS', v: n3(data.season.ops), s: 'ops' },
              ].map((c) => (
                <div key={c.l} className="rounded-md border border-border bg-card p-3 text-center">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {c.l}
                  </div>
                  <div className="mt-1 font-mono-data text-base font-semibold text-foreground">
                    {c.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'pa' && (
          <div className="card-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Plate Appearance Outcomes (L15)
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {(() => {
                const l = data.gameLog.slice(0, 15);
                const sum = (c: keyof BatterGameLogRow) => l.reduce((s, r) => s + Number(r[c]), 0);
                const items = [
                  { l: 'AB', v: sum('ab') },
                  { l: 'Hits', v: sum('h') },
                  { l: '1B', v: sum('b1') },
                  { l: '2B', v: sum('b2') },
                  { l: '3B', v: sum('b3') },
                  { l: 'HR', v: sum('hr') },
                  { l: 'BB', v: sum('bb') },
                  { l: 'K', v: sum('k') },
                  { l: 'R', v: sum('r') },
                  { l: 'RBI', v: sum('rbi') },
                  { l: 'TB', v: sum('tb') },
                  { l: 'SB', v: sum('sb') },
                ];
                return items.map((it) => (
                  <div
                    key={it.l}
                    className="rounded-md border border-border bg-card p-3 text-center"
                  >
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {it.l}
                    </div>
                    <div className="mt-1 font-mono-data text-base font-semibold text-foreground">
                      {it.v}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {tab === 'odds' && (
          <div className="card-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  {['PROP', 'LINE', 'OVER', 'UNDER', 'BOOK', ''].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROPS.map((pr, i) => {
                  const bl = (data.bestLines ?? [])[i % Math.max(1, (data.bestLines ?? []).length)];
                  const line = bl?.line ?? pr.line;
                  return (
                    <tr key={pr.key} className="border-b border-border/40">
                      <td className="px-3 py-2 font-medium text-foreground">{pr.label}</td>
                      <td className="px-3 py-2 font-mono-data">{line}</td>
                      <td className="px-3 py-2 font-mono-data text-positive">
                        {bl ? odds(bl.overOdds) : '—'}
                      </td>
                      <td className="px-3 py-2 font-mono-data text-negative">
                        {bl ? odds(bl.underOdds) : '—'}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{bl?.book ?? '—'}</td>
                      <td className="px-3 py-2">
                        <SaveEdgeButton
                          edge={{
                            propId: `${data.playerId}-${pr.key}`,
                            player: data.name,
                            prop: pr.label,
                            line,
                            direction: 'over',
                            edge: 0,
                            confidence: 'medium',
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
