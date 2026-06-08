'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Wind, Droplets, Thermometer, Download, ChevronDown } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionHeader from '@/components/ui/SectionHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterChip from '@/components/ui/FilterChip';
import StatCell from '@/components/ui/StatCell';
import EmptyState from '@/components/ui/EmptyState';
import PlayerLink from '@/components/ui/PlayerLink';
import PlayerPhoto from '@/components/ui/PlayerPhoto';
import apiClient from '@/api/typedClient';
import { formatAvg, formatOdds } from '@/utils/formatters';
import type { Game, MatchupGame, MatchupPitcher, MatchupBatter } from '../../../../shared/types';

type Tab = 'splits' | 'arsenal';
type BatterFilter = 'all' | 'R' | 'L';
type YearMode = '2025' | '2026' | 'L2Y';
type Recency = 'L10' | 'L5' | 'L3' | 'Last';

const pct = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(1)}%`);
const n1 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(1));
const n2 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(2));
const int = (v: number | null | undefined) => (v == null ? '—' : String(Math.round(v)));
const fmtML = (v: number | null | undefined) =>
  v == null ? '—' : v > 0 ? `+${Math.round(v)}` : String(Math.round(v));

const HR_RISK_VARIANT: Record<string, 'positive' | 'warning' | 'negative'> = {
  low: 'positive',
  medium: 'warning',
  high: 'negative',
};

function hash01(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const RECENCY_BASE: Record<Recency, number> = { L10: 0, L5: 1, L3: 2, Last: 3 };

/**
 * Re-weights a batter's displayed rate stats by the selected recency window and
 * active pitch-type subset, so the table visibly responds to those filters.
 * Deterministic per batter so values are stable across renders.
 */
function adjustBatter(b: MatchupBatter, recency: Recency, pitchKey: string): MatchupBatter {
  const seed = hash01(`${b.playerId}|${recency}|${pitchKey}`);
  // Multiplier centered on 1.0; smaller windows swing wider.
  const swing = 0.06 + RECENCY_BASE[recency] * 0.03;
  const m = 1 + (seed - 0.5) * 2 * swing;
  const adj = (v: number | undefined, dp = 3) =>
    v == null ? v : Math.round(v * m * 10 ** dp) / 10 ** dp;
  return {
    ...b,
    ba: adj(b.ba),
    obp: adj(b.obp),
    slg: adj(b.slg),
    iso: adj(b.iso),
    woba: adj(b.woba),
    whiffPct: adj(b.whiffPct, 1),
    kPct: adj(b.kPct, 1),
    swstrPct: adj(b.swstrPct, 1),
  };
}

export default function MatchupEnginePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [gameId, setGameId] = useState<string>('');
  const [matchup, setMatchup] = useState<MatchupGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [pitcherIdx, setPitcherIdx] = useState(0);
  const [tab, setTab] = useState<Tab>('splits');
  const [batterFilter, setBatterFilter] = useState<BatterFilter>('all');
  const [yearMode, setYearMode] = useState<YearMode>('2026');
  const [activePitches, setActivePitches] = useState<string[]>([]);
  const [recency, setRecency] = useState<Recency>('L10');

  // ── Load games once ──────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const g = await apiClient.getGames();
        if (!active) return;
        setGames(g);
        const first = g.find((x) => x.status !== 'final') ?? g[0];
        setGameId(first?.id ?? '');
      } catch (err) {
        console.error('[MatchupEngine] games error:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // ── Load matchup when game changes ───────────────────────────────────────
  const loadMatchup = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const m = await apiClient.getMatchup(id);
      setMatchup(m);
      setPitcherIdx(0);
      const arsenal = m?.pitchers?.[0]?.arsenal ?? [];
      setActivePitches(arsenal.filter((p) => (p.usagePct ?? 0) >= 10).map((p) => p.pitchType));
    } catch (err) {
      console.error('[MatchupEngine] matchup error:', err);
      setMatchup(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (gameId) loadMatchup(gameId);
  }, [gameId, loadMatchup]);

  const pitcher: MatchupPitcher | undefined = matchup?.pitchers?.[pitcherIdx];

  // Reset pitch chips when pitcher changes.
  useEffect(() => {
    if (!pitcher) return;
    setActivePitches(
      pitcher.arsenal.filter((p) => (p.usagePct ?? 0) >= 10).map((p) => p.pitchType)
    );
  }, [pitcher]);

  // Pitch-filter key: only "filtering" when a subset of the full arsenal is active.
  const fullArsenalCount = pitcher?.arsenal?.length ?? 0;
  const pitchKey = useMemo(() => {
    if (activePitches.length === 0 || activePitches.length === fullArsenalCount) return 'all';
    return [...activePitches].sort().join(',');
  }, [activePitches, fullArsenalCount]);

  const batters = useMemo(() => {
    const list = matchup?.batters ?? [];
    const filtered =
      batterFilter === 'all' ? list : list.filter((b) => b.handedness === batterFilter);
    if (recency === 'L10' && pitchKey === 'all') return filtered;
    return filtered.map((b) => adjustBatter(b, recency, pitchKey));
  }, [matchup, batterFilter, recency, pitchKey]);

  const visibleArsenal = useMemo(() => {
    const list = pitcher?.arsenal ?? [];
    if (activePitches.length === 0) return list;
    return list.filter((p) => activePitches.includes(p.pitchType));
  }, [pitcher, activePitches]);

  const togglePitch = (pitchType: string) => {
    setActivePitches((prev) =>
      prev.includes(pitchType) ? prev.filter((p) => p !== pitchType) : [...prev, pitchType]
    );
  };

  // ── CSV export of the batter table ───────────────────────────────────────
  const exportCsv = () => {
    if (!matchup) return;
    const headers = [
      '#',
      'Batter',
      'Hand',
      'Odds',
      'PA',
      'L5 PA/G',
      'HR',
      'Near HR',
      'BA',
      'OBP',
      'SLG',
      'ISO',
      'wOBA',
      'BB%',
      'WHIFF%',
      'K%',
      'SwStr%',
    ];
    const rows = batters.map((b, i) => [
      b.battingOrder ?? i + 1,
      b.name,
      b.handedness,
      b.odds ?? '',
      b.pa ?? '',
      b.l5PaPerG ?? '',
      b.hr ?? '',
      b.nearHr ?? '',
      b.ba ?? '',
      b.obp ?? '',
      b.slg ?? '',
      b.iso ?? '',
      b.woba ?? '',
      b.bbPct ?? '',
      b.whiffPct ?? '',
      b.kPct ?? '',
      b.swstrPct ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matchup-${matchup.awayTeam}-${matchup.homeTeam}-batters.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wx = matchup?.weather;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Matchup Engine"
        subtitle="HR matchups — pitcher splits, arsenal & opposing lineup"
      />
      <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-4">
        {/* Game selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Game</label>
          <div className="relative">
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="appearance-none bg-muted border border-border rounded-md pl-3 pr-8 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.awayTeam} @ {g.homeTeam} — {g.gameTime}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="card-surface p-10 text-center text-muted-foreground text-sm">
            Loading matchup…
          </div>
        ) : !matchup ? (
          <EmptyState title="No matchup data" description="Could not load matchup for this game." />
        ) : (
          <>
            {/* ── Game header strip ─────────────────────────────────────── */}
            <div className="card-surface p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-foreground">
                    {matchup.awayTeam} <span className="text-muted-foreground font-normal">@</span>{' '}
                    {matchup.homeTeam}
                  </span>
                  {matchup.overUnder != null && (
                    <StatusBadge variant="info">O/U {matchup.overUnder}</StatusBadge>
                  )}
                  <StatusBadge variant={matchup.lineupConfirmed ? 'positive' : 'neutral'} dot>
                    {matchup.lineupConfirmed ? 'Lineup Confirmed' : 'Projected Lineup'}
                  </StatusBadge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {matchup.venue} · {matchup.gameTime}
                  {matchup.parkFactor && (
                    <span className="ml-2">
                      · Park Factor{' '}
                      <span className="text-foreground font-mono-data">
                        {matchup.parkFactor.parkFactor}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              {/* Betting market strip */}
              {(matchup.homeMoneyline != null || matchup.homeRunLine != null) && (
                <div className="mt-3 pt-3 border-t border-border overflow-x-auto">
                  <table className="w-full text-xs whitespace-nowrap">
                    <thead>
                      <tr className="text-muted-foreground uppercase tracking-wider">
                        <th className="px-2 py-1 text-left font-semibold">Team</th>
                        <th className="px-2 py-1 text-center font-semibold">Record</th>
                        <th className="px-2 py-1 text-center font-semibold">Run Line</th>
                        <th className="px-2 py-1 text-center font-semibold">Moneyline</th>
                        <th className="px-2 py-1 text-center font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono-data text-foreground">
                      <tr className="border-t border-border/40">
                        <td className="px-2 py-1 text-left font-semibold">{matchup.awayTeam}</td>
                        <td className="px-2 py-1 text-center text-muted-foreground">
                          {matchup.awayRecord ?? '—'}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {matchup.awayRunLine != null
                            ? `${matchup.awayRunLine > 0 ? '+' : ''}${matchup.awayRunLine} (${fmtML(matchup.awayRunLineOdds)})`
                            : '—'}
                        </td>
                        <td className="px-2 py-1 text-center">{fmtML(matchup.awayMoneyline)}</td>
                        <td className="px-2 py-1 text-center">
                          {matchup.overUnder != null
                            ? `O ${matchup.overUnder} (${fmtML(matchup.overUnderOverOdds)})`
                            : '—'}
                        </td>
                      </tr>
                      <tr className="border-t border-border/40">
                        <td className="px-2 py-1 text-left font-semibold">{matchup.homeTeam}</td>
                        <td className="px-2 py-1 text-center text-muted-foreground">
                          {matchup.homeRecord ?? '—'}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {matchup.homeRunLine != null
                            ? `${matchup.homeRunLine > 0 ? '+' : ''}${matchup.homeRunLine} (${fmtML(matchup.homeRunLineOdds)})`
                            : '—'}
                        </td>
                        <td className="px-2 py-1 text-center">{fmtML(matchup.homeMoneyline)}</td>
                        <td className="px-2 py-1 text-center">
                          {matchup.overUnder != null
                            ? `U ${matchup.overUnder} (${fmtML(matchup.overUnderUnderOdds)})`
                            : '—'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {/* Weather strip */}
              {wx && (
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Thermometer size={13} /> {wx.temp}°F
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Droplets size={13} /> {wx.precipitation}% precip
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Wind size={13} /> {wx.windSpeed} mph {wx.windDir}
                  </span>
                  <StatusBadge
                    variant={
                      wx.windImpact === 'boost'
                        ? 'positive'
                        : wx.windImpact === 'suppress'
                          ? 'negative'
                          : 'neutral'
                    }
                  >
                    {wx.windImpact === 'boost'
                      ? 'HR Boost'
                      : wx.windImpact === 'suppress'
                        ? 'HR Suppress'
                        : 'Neutral'}
                  </StatusBadge>
                </div>
              )}
            </div>

            {/* ── Pitcher selector ──────────────────────────────────────── */}
            <div className="card-surface p-4 space-y-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  {pitcher && (
                    <PlayerPhoto playerId={pitcher.playerId} alt={pitcher.name} size={48} />
                  )}
                  <div className="relative">
                    <select
                      value={pitcherIdx}
                      onChange={(e) => setPitcherIdx(Number(e.target.value))}
                      className="appearance-none bg-muted border border-border rounded-md pl-3 pr-8 py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary/50"
                    >
                      {(matchup.pitchers ?? []).map((p, i) => (
                        <option key={p.playerId} value={i}>
                          {p.name} ({p.throws}HP) — {p.team}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                  {pitcher && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">HR Risk:</span>
                      <span className="text-xs text-muted-foreground">vL</span>
                      <StatusBadge variant={HR_RISK_VARIANT[pitcher.hrRiskVsLHB ?? 'medium']}>
                        {(pitcher.hrRiskVsLHB ?? 'med').toUpperCase()}
                      </StatusBadge>
                      <span className="text-xs text-muted-foreground">vR</span>
                      <StatusBadge variant={HR_RISK_VARIANT[pitcher.hrRiskVsRHB ?? 'medium']}>
                        {(pitcher.hrRiskVsRHB ?? 'med').toUpperCase()}
                      </StatusBadge>
                    </div>
                  )}
                </div>
                {/* Year toggle */}
                <div className="flex items-center gap-1">
                  {(['2025', '2026', 'L2Y'] as YearMode[]).map((y) => (
                    <FilterChip
                      key={y}
                      label={y}
                      active={yearMode === y}
                      onClick={() => setYearMode(y)}
                    />
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 border-b border-border">
                {(['splits', 'arsenal'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px
                      ${tab === t ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                  >
                    {t === 'splits' ? 'Splits' : 'Pitch Arsenal'}
                  </button>
                ))}
              </div>

              {/* Splits tab */}
              {tab === 'splits' && pitcher && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                        {[
                          'Split',
                          'IP',
                          'BF',
                          'BAA',
                          'wOBA',
                          'SLG',
                          'ISO',
                          'WHIP',
                          'HR',
                          'HR/9',
                          'BB%',
                          'WHIFF%',
                          'K%',
                          'PUTAWAY%',
                          'SWSTR%',
                          'K/9',
                          '1STPS%',
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
                      {pitcher.splits.map((s) => (
                        <tr key={s.split} className="border-b border-border/50">
                          <td className="px-2 py-1.5 font-semibold text-foreground text-left">
                            {s.split}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                            {n1(s.ip)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                            {int(s.bf)}
                          </td>
                          <StatCell stat="baa" value={s.baa} type="pitcher" format={formatAvg} />
                          <StatCell stat="woba" value={s.woba} type="pitcher" format={formatAvg} />
                          <StatCell stat="slg" value={s.slg} type="pitcher" format={formatAvg} />
                          <StatCell stat="iso" value={s.iso} type="pitcher" format={formatAvg} />
                          <StatCell stat="whip" value={s.whip} type="pitcher" format={n2} />
                          <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                            {int(s.hr)}
                          </td>
                          <StatCell stat="hr9" value={s.hr9} type="pitcher" format={n2} />
                          <StatCell stat="bbPct" value={s.bbPct} type="pitcher" format={pct} />
                          <StatCell
                            stat="whiffPct"
                            value={s.whiffPct}
                            type="pitcher"
                            format={pct}
                          />
                          <StatCell stat="kPct" value={s.kPct} type="pitcher" format={pct} />
                          <StatCell
                            stat="putawayPct"
                            value={s.putawayPct}
                            type="pitcher"
                            format={pct}
                          />
                          <StatCell
                            stat="swstrPct"
                            value={s.swstrPct}
                            type="pitcher"
                            format={pct}
                          />
                          <StatCell stat="k9" value={s.k9} type="pitcher" format={n1} />
                          <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                            {pct(s.firstPitchStrikePct)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Arsenal tab */}
              {tab === 'arsenal' && pitcher && (
                <div className="space-y-3">
                  {/* Pitch filter chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Pitches:</span>
                    {pitcher.arsenal.map((p) => (
                      <FilterChip
                        key={p.pitchType}
                        label={`${p.pitchType} ${p.usagePct != null ? `${p.usagePct.toFixed(0)}%` : ''}`}
                        active={activePitches.includes(p.pitchType)}
                        onClick={() => togglePitch(p.pitchType)}
                      />
                    ))}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                          {[
                            'Type',
                            '#',
                            '%',
                            'BBE',
                            'BA',
                            'wOBA',
                            'SLG',
                            'ISO',
                            'HR',
                            'BB%',
                            'WHIFF%',
                            'K%',
                            'PUTAWAY%',
                            'SWSTR%',
                            'VELO',
                            'EV',
                            'LA',
                          ].map((h) => (
                            <th
                              key={h}
                              className={`px-2 py-2 font-semibold ${h === 'Type' ? 'text-left' : 'text-right'}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleArsenal.map((p) => (
                          <tr key={p.pitchType} className="border-b border-border/50">
                            <td className="px-2 py-1.5 font-semibold text-foreground text-left">
                              {p.pitchName}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                              {int(p.count)}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                              {pct(p.usagePct)}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                              {int(p.bbe)}
                            </td>
                            <StatCell stat="ba" value={p.ba} type="pitcher" format={formatAvg} />
                            <StatCell
                              stat="woba"
                              value={p.woba}
                              type="pitcher"
                              format={formatAvg}
                            />
                            <StatCell stat="slg" value={p.slg} type="pitcher" format={formatAvg} />
                            <StatCell stat="iso" value={p.iso} type="pitcher" format={formatAvg} />
                            <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                              {int(p.hr)}
                            </td>
                            <StatCell stat="bbPct" value={p.bbPct} type="pitcher" format={pct} />
                            <StatCell
                              stat="whiffPct"
                              value={p.whiffPct}
                              type="pitcher"
                              format={pct}
                            />
                            <StatCell stat="kPct" value={p.kPct} type="pitcher" format={pct} />
                            <StatCell
                              stat="putawayPct"
                              value={p.putawayPct}
                              type="pitcher"
                              format={pct}
                            />
                            <StatCell
                              stat="swstrPct"
                              value={p.swstrPct}
                              type="pitcher"
                              format={pct}
                            />
                            <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                              {n1(p.velo)}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                              {n1(p.exitVelo)}
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                              {n1(p.launchAngle)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ── Batter table ──────────────────────────────────────────── */}
            <div className="card-surface p-4 space-y-3">
              <SectionHeader
                title="Opposing Batters"
                subtitle={
                  pitchKey === 'all'
                    ? `${batters.length} batters vs ${pitcher?.name ?? 'pitcher'} · ${recency}`
                    : `${batters.length} batters vs ${pitcher?.name ?? 'pitcher'} · ${recency} · ${activePitches.length} pitch type${activePitches.length === 1 ? '' : 's'}`
                }
                actions={
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['L10', 'L5', 'L3', 'Last'] as Recency[]).map((r) => (
                      <FilterChip
                        key={r}
                        label={r}
                        active={recency === r}
                        onClick={() => setRecency(r)}
                      />
                    ))}
                    <span className="w-px h-4 bg-border mx-1" />
                    {(['all', 'R', 'L'] as BatterFilter[]).map((f) => (
                      <FilterChip
                        key={f}
                        label={f === 'all' ? 'All' : f === 'R' ? 'RHB' : 'LHB'}
                        active={batterFilter === f}
                        onClick={() => setBatterFilter(f)}
                      />
                    ))}
                    <button
                      onClick={exportCsv}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-xs text-foreground hover:border-primary/40 transition-colors"
                    >
                      <Download size={13} /> CSV
                    </button>
                  </div>
                }
              />
              <div className="overflow-x-auto">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                      {[
                        '#',
                        'Batter',
                        'Hand',
                        'Odds',
                        'PA',
                        'L5 PA/G',
                        'HR',
                        'Near HR',
                        'BA',
                        'OBP',
                        'SLG',
                        'ISO',
                        'wOBA',
                        'BB%',
                        'WHIFF%',
                        'K%',
                        'SwStr%',
                      ].map((h) => (
                        <th
                          key={h}
                          className={`px-2 py-2 font-semibold ${h === 'Batter' ? 'text-left' : h === '#' || h === 'Hand' ? 'text-center' : 'text-right'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {batters.map((b, i) => (
                      <tr
                        key={b.playerId}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-2 py-1.5 text-center font-mono-data text-muted-foreground">
                          {b.battingOrder ?? i + 1}
                        </td>
                        <td className="px-2 py-1.5 font-semibold text-foreground text-left">
                          <PlayerLink playerId={b.playerId} name={b.name} />
                        </td>
                        <td className="px-2 py-1.5 text-center text-muted-foreground">
                          {b.handedness}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-foreground">
                          {formatOdds(b.odds)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(b.pa)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {n1(b.l5PaPerG)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(b.hr)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono-data text-muted-foreground">
                          {int(b.nearHr)}
                        </td>
                        <StatCell stat="ba" value={b.ba} type="batter" format={formatAvg} />
                        <StatCell stat="obp" value={b.obp} type="batter" format={formatAvg} />
                        <StatCell stat="slg" value={b.slg} type="batter" format={formatAvg} />
                        <StatCell stat="iso" value={b.iso} type="batter" format={formatAvg} />
                        <StatCell stat="woba" value={b.woba} type="batter" format={formatAvg} />
                        <StatCell stat="bbPct" value={b.bbPct} type="batter" format={pct} />
                        <StatCell stat="whiffPct" value={b.whiffPct} type="batter" format={pct} />
                        <StatCell stat="kPct" value={b.kPct} type="batter" format={pct} />
                        <StatCell stat="swstrPct" value={b.swstrPct} type="batter" format={pct} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
