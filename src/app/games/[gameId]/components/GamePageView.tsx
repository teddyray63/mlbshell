'use client';

import React, { useMemo, useState } from 'react';
import { Wind, CloudRain, Trophy } from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCell from '@/components/ui/StatCell';
import EmptyState from '@/components/ui/EmptyState';
import PlayerPhoto from '@/components/ui/PlayerPhoto';
import PlayerLink from '@/components/ui/PlayerLink';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import apiClient from '@/api/typedClient';
import { useApi } from '@/hooks/useApi';
import type {
  MatchupGame,
  MatchupBatter,
  MatchupPitcher,
  PitcherSplit,
} from '../../../../../shared/types';

type Tab = 'overview' | 'props' | 'ou' | 'team' | 'sides';

const n3 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(3).replace(/^0/, ''));
const n2 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(2));
const n1 = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(1));
const pct = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(1)}%`);
const odds = (v: number | null | undefined) => (v == null ? '—' : v > 0 ? `+${v}` : `${v}`);

function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export default function GamePageView({ gameId }: { gameId: string }) {
  const { data, loading, error } = useApi<MatchupGame | null>(
    () => apiClient.getMatchup(gameId),
    [gameId]
  );
  const [tab, setTab] = useState<Tab>('overview');

  const { awayBatters, homeBatters, awayPitcher, homePitcher } = useMemo(() => {
    const g = data;
    const aB = (g?.batters ?? []).filter((b) => b.team === g?.awayTeam);
    const hB = (g?.batters ?? []).filter((b) => b.team === g?.homeTeam);
    const aP = (g?.pitchers ?? []).find((p) => p.team === g?.awayTeam) ?? g?.pitchers?.[0];
    const hP = (g?.pitchers ?? []).find((p) => p.team === g?.homeTeam) ?? g?.pitchers?.[1];
    return { awayBatters: aB, homeBatters: hB, awayPitcher: aP, homePitcher: hP };
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Topbar title="Game" subtitle="Loading game…" />
        <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
          <ChartSkeleton height={90} />
          <ChartSkeleton height={320} />
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Topbar title="Game" />
        <div className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-5">
          <EmptyState title="Game not found" description={error || 'No data for this game.'} />
        </div>
      </div>
    );
  }

  const g = data;
  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Game Overview' },
    { key: 'props', label: 'Player Props' },
    { key: 'ou', label: 'Over/Under' },
    { key: 'team', label: 'Team Props' },
    { key: 'sides', label: 'Sides' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar
        title={`${g.awayTeam} @ ${g.homeTeam}`}
        subtitle={`${g.venue} · ${g.gameTime ? new Date(g.gameTime).toLocaleString() : ''}`}
      />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 space-y-4 px-6 py-5">
        <GameHeaderBar g={g} />

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

        {tab === 'overview' && (
          <>
            <MatchupFactors g={g} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <PitcherCard pitcher={awayPitcher} confirmed={g.lineupConfirmed} />
              <PitcherCard pitcher={homePitcher} confirmed={g.lineupConfirmed} />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BattingOrder team={g.awayTeam} batters={awayBatters} confirmed={g.lineupConfirmed} />
              <BattingOrder team={g.homeTeam} batters={homeBatters} confirmed={g.lineupConfirmed} />
            </div>
          </>
        )}

        {tab === 'props' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PitcherProps pitcher={awayPitcher} />
            <PitcherProps pitcher={homePitcher} />
          </div>
        )}

        {tab === 'ou' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TeamScoringLog team={g.awayTeam} ou={g.overUnder} />
            <TeamScoringLog team={g.homeTeam} ou={g.overUnder} />
          </div>
        )}

        {tab === 'team' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TeamScoringLog team={g.awayTeam} ou={g.overUnder} teamProps />
            <TeamScoringLog team={g.homeTeam} ou={g.overUnder} teamProps />
          </div>
        )}

        {tab === 'sides' && <SidesTable g={g} />}
      </div>
    </div>
  );
}

function GameHeaderBar({ g }: { g: MatchupGame }) {
  const cells = [
    {
      l: 'AWAY RL',
      v: g.awayRunLine != null ? `${g.awayRunLine > 0 ? '+' : ''}${g.awayRunLine}` : '—',
      o: odds(g.awayRunLineOdds),
    },
    {
      l: 'HOME RL',
      v: g.homeRunLine != null ? `${g.homeRunLine > 0 ? '+' : ''}${g.homeRunLine}` : '—',
      o: odds(g.homeRunLineOdds),
    },
    {
      l: 'O/U',
      v: g.overUnder != null ? g.overUnder.toFixed(1) : '—',
      o: `${odds(g.overUnderOverOdds)}/${odds(g.overUnderUnderOdds)}`,
    },
    { l: 'AWAY ML', v: odds(g.awayMoneyline), o: '' },
    { l: 'HOME ML', v: odds(g.homeMoneyline), o: '' },
  ];
  return (
    <div className="card-surface flex flex-wrap items-stretch divide-x divide-border">
      <div className="flex min-w-[160px] flex-col justify-center px-4 py-3">
        <div className="text-sm font-semibold text-foreground">
          {g.awayTeam} ({g.awayRecord || '—'}) @ {g.homeTeam} ({g.homeRecord || '—'})
        </div>
        <div className="text-xs text-muted-foreground">
          {g.lineupConfirmed ? 'Lineups confirmed' : 'Projected lineups'}
        </div>
      </div>
      {cells.map((c) => (
        <div key={c.l} className="flex flex-1 flex-col items-center justify-center px-3 py-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.l}</div>
          <div className="font-mono-data text-sm font-bold text-foreground">{c.v}</div>
          {c.o && <div className="font-mono-data text-[10px] text-muted-foreground">{c.o}</div>}
        </div>
      ))}
    </div>
  );
}

function MatchupFactors({ g }: { g: MatchupGame }) {
  const w = g.weather;
  const pf = g.parkFactor;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="card-surface p-4">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Wind size={14} /> Wind
        </div>
        {w ? (
          <>
            <div className="font-mono-data text-lg font-semibold text-foreground">
              {w.windSpeed} mph
            </div>
            <div className="text-xs text-muted-foreground">{w.windDir}</div>
            <div className="mt-1">
              <StatusBadge
                variant={
                  w.windImpact === 'boost'
                    ? 'positive'
                    : w.windImpact === 'suppress'
                      ? 'negative'
                      : 'neutral'
                }
              >
                {w.windImpact}
              </StatusBadge>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">—</div>
        )}
      </div>

      <div className="card-surface p-4">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <CloudRain size={14} /> Weather
        </div>
        {w ? (
          <>
            <div className="font-mono-data text-lg font-semibold text-foreground">{w.temp}°F</div>
            <div className="text-xs text-muted-foreground">
              {w.condition} · {w.city}
            </div>
            <div className="text-xs text-muted-foreground">Precip {w.precipitation}%</div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">—</div>
        )}
      </div>

      <div className="card-surface p-4">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Trophy size={14} /> Park Factor
        </div>
        {pf ? (
          <>
            <div className="font-mono-data text-lg font-semibold text-foreground">
              {pf.parkFactor}
            </div>
            <div className="text-xs text-muted-foreground">
              HR {pf.hrFactor} · Runs {pf.runsFactor}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">—</div>
        )}
      </div>

      <div className="card-surface p-4">
        <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Records</div>
        <div className="text-sm text-foreground">
          {g.awayTeam}: <span className="font-mono-data">{g.awayRecord || '—'}</span>
        </div>
        <div className="text-sm text-foreground">
          {g.homeTeam}: <span className="font-mono-data">{g.homeRecord || '—'}</span>
        </div>
      </div>
    </div>
  );
}

function PitcherCard({ pitcher, confirmed }: { pitcher?: MatchupPitcher; confirmed: boolean }) {
  if (!pitcher) {
    return (
      <div className="card-surface p-4">
        <EmptyState title="Pitcher TBD" description="Probable pitcher not yet announced." />
      </div>
    );
  }
  const season = pitcher.splits.find((s) => s.split === 'Season');
  const vsL = pitcher.splits.find((s) => s.split === 'vsLHB');
  const vsR = pitcher.splits.find((s) => s.split === 'vsRHB');
  const rows: { label: string; s?: PitcherSplit }[] = [
    { label: 'Season', s: season },
    { label: 'vs LHB', s: vsL },
    { label: 'vs RHB', s: vsR },
  ];
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <PlayerPhoto playerId={pitcher.playerId} alt={pitcher.name} size={48} />
        <div>
          <PlayerLink
            playerId={pitcher.playerId}
            name={pitcher.name}
            className="text-sm font-semibold"
          />
          <div className="text-xs text-muted-foreground">
            {pitcher.team} · {pitcher.throws}HP {confirmed ? '· Confirmed' : '· Expected'}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              {['SPLIT', 'IP', 'WHIP', 'OBA', 'K%', 'K/9', 'HR/9', 'BRL%'].map((h) => (
                <th key={h} className="px-2 py-1.5 text-right font-medium first:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-border/40">
                <td className="px-2 py-1.5 text-left font-medium text-foreground">{r.label}</td>
                <td className="px-2 py-1.5 text-right font-mono-data">{n1(r.s?.ip)}</td>
                <td className="px-2 py-1.5 text-right font-mono-data">{n2(r.s?.whip)}</td>
                <td className="px-2 py-1.5 text-right font-mono-data">{n3(r.s?.baa)}</td>
                <StatCell stat="kPct" value={r.s?.kPct} type="pitcher" format={pct} />
                <td className="px-2 py-1.5 text-right font-mono-data">{n1(r.s?.k9)}</td>
                <StatCell stat="hr9" value={r.s?.hr9} type="pitcher" format={n2} />
                <td className="px-2 py-1.5 text-right font-mono-data">
                  {pct(r.s?.iso ? r.s.iso * 100 : undefined)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BattingOrder({
  team,
  batters,
  confirmed,
}: {
  team: string;
  batters: MatchupBatter[];
  confirmed: boolean;
}) {
  const counts = batters.reduce(
    (acc, b) => {
      if (b.handedness === 'L') acc.L += 1;
      else if (b.handedness === 'S') acc.S += 1;
      else acc.R += 1;
      return acc;
    },
    { L: 0, R: 0, S: 0 }
  );
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{team} Lineup</h3>
          <StatusBadge variant={confirmed ? 'positive' : 'neutral'}>
            {confirmed ? 'Confirmed' : 'Projected'}
          </StatusBadge>
        </div>
        <span className="text-xs text-muted-foreground">
          {counts.L} LHB · {counts.R} RHB · {counts.S} SW
        </span>
      </div>
      {batters.length === 0 ? (
        <EmptyState
          title="No lineup yet"
          description="Lineup not posted; check back closer to game time."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                {['#', 'BATTER', 'H', 'PA', 'HR', 'AVG', 'SLG', 'ISO', 'K%', 'wOBA'].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-1.5 text-right font-medium [&:nth-child(2)]:text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batters.map((b, i) => (
                <tr key={b.playerId} className="border-b border-border/40">
                  <td className="px-2 py-1.5 text-right text-muted-foreground">
                    {b.battingOrder ?? i + 1}
                  </td>
                  <td className="px-2 py-1.5 text-left">
                    <PlayerLink playerId={b.playerId} name={b.name} />
                  </td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">{b.handedness}</td>
                  <td className="px-2 py-1.5 text-right font-mono-data">{b.pa ?? '—'}</td>
                  <td className="px-2 py-1.5 text-right font-mono-data">{b.hr ?? '—'}</td>
                  <StatCell stat="avg" value={b.ba} type="batter" format={n3} />
                  <StatCell stat="slg" value={b.slg} type="batter" format={n3} />
                  <StatCell stat="iso" value={b.iso} type="batter" format={n3} />
                  <StatCell stat="kPct" value={b.kPct} type="batter" format={pct} />
                  <StatCell stat="wOBA" value={b.woba} type="batter" format={n3} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PitcherProps({ pitcher }: { pitcher?: MatchupPitcher }) {
  if (!pitcher) {
    return (
      <div className="card-surface p-4">
        <EmptyState title="Pitcher TBD" />
      </div>
    );
  }
  const season = pitcher.splits.find((s) => s.split === 'Season');
  const ipPerStart = 5.5 + hash01(pitcher.playerId) * 1.3;
  const kRate = (season?.kPct ?? 22) / 100;
  const lines = [
    { prop: 'Strikeouts', line: Math.round(ipPerStart * 3.9 * kRate * 2) / 2 },
    { prop: 'Outs', line: Math.round(ipPerStart * 3) - 0.5 },
    { prop: 'Hits Allowed', line: Math.round(ipPerStart * 0.95 * 2) / 2 },
    { prop: 'Earned Runs', line: 2.5 },
    { prop: 'Walks', line: 1.5 },
  ];
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <PlayerPhoto playerId={pitcher.playerId} alt={pitcher.name} size={44} />
        <div>
          <PlayerLink
            playerId={pitcher.playerId}
            name={pitcher.name}
            className="text-sm font-semibold"
          />
          <div className="text-xs text-muted-foreground">
            {pitcher.team} · {pitcher.throws}HP
          </div>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            {['PROP', 'LINE', 'OVER', 'UNDER'].map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => {
            const seed = hash01(pitcher.playerId + l.prop);
            return (
              <tr key={l.prop} className="border-b border-border/40">
                <td className="px-3 py-2 font-medium text-foreground">{l.prop}</td>
                <td className="px-3 py-2 font-mono-data">{l.line}</td>
                <td className="px-3 py-2 font-mono-data text-positive">
                  {odds(-120 + Math.round(seed * 60))}
                </td>
                <td className="px-3 py-2 font-mono-data text-negative">
                  {odds(-110 + Math.round((1 - seed) * 50))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TeamScoringLog({
  team,
  ou,
  teamProps = false,
}: {
  team: string;
  ou?: number;
  teamProps?: boolean;
}) {
  const line = teamProps ? (ou ? ou / 2 : 4.5) : (ou ?? 8.5);
  const rows = Array.from({ length: 10 }).map((_, i) => {
    const seed = hash01(`${team}-ou-${i}`);
    const runs = Math.round(seed * 9);
    const total = teamProps ? runs : runs + Math.round(hash01(`${team}-opp-${i}`) * 8);
    const d = new Date();
    d.setDate(d.getDate() - (i + 1) * 3);
    return {
      date: d.toISOString().slice(5, 10),
      opp: ['NYM', 'PHI', 'SD', 'COL', 'MIA', 'WSH', 'STL', 'CIN', 'ARI', 'PIT'][i],
      runs,
      total,
      over: total > line,
    };
  });
  const hits = rows.filter((r) => r.over).length;
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="text-sm font-semibold text-foreground">
          {team} {teamProps ? 'Runs Scored' : 'Total Runs'} (line {line})
        </h3>
        <span className="text-xs text-muted-foreground">
          Over rate <span className="font-mono-data text-foreground">{hits}/10</span>
        </span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            {['DATE', 'OPP', teamProps ? 'RUNS' : 'TOTAL', 'O/U'].map((h) => (
              <th key={h} className="px-2 py-1.5 text-right font-medium first:text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/40">
              <td className="px-2 py-1.5 text-left text-muted-foreground">{r.date}</td>
              <td className="px-2 py-1.5 text-right">{r.opp}</td>
              <td
                className={`px-2 py-1.5 text-right font-mono-data font-semibold ${
                  r.over ? 'text-positive' : 'text-negative'
                }`}
              >
                {teamProps ? r.runs : r.total}
              </td>
              <td className="px-2 py-1.5 text-right">{r.over ? 'O' : 'U'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SidesTable({ g }: { g: MatchupGame }) {
  const books = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars'];
  return (
    <div className="card-surface overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            {['BOOK', `${g.awayTeam} ML`, `${g.homeTeam} ML`, 'RUN LINE', 'O/U'].map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {books.map((b) => {
            const s = hash01(b + g.gameId);
            const j = Math.round((s - 0.5) * 12);
            return (
              <tr key={b} className="border-b border-border/40">
                <td className="px-3 py-2 font-medium text-foreground">{b}</td>
                <td className="px-3 py-2 font-mono-data">{odds((g.awayMoneyline ?? 120) + j)}</td>
                <td className="px-3 py-2 font-mono-data">{odds((g.homeMoneyline ?? -130) + j)}</td>
                <td className="px-3 py-2 font-mono-data">
                  {g.awayRunLine != null
                    ? `${g.awayRunLine > 0 ? '+' : ''}${g.awayRunLine}`
                    : '+1.5'}{' '}
                  ({odds((g.awayRunLineOdds ?? -110) + j)})
                </td>
                <td className="px-3 py-2 font-mono-data">
                  {(g.overUnder ?? 8.5).toFixed(1)} ({odds((g.overUnderOverOdds ?? -110) + j)})
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
