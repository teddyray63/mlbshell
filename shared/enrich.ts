/**
 * enrich — augments base PropCalculation / PlayerProp records with Statcast
 * metrics, per-split breakdowns and pitch-vulnerability profiles.
 *
 * Used by BOTH the client mock adapter and the Express backend so the enriched
 * shapes are identical across modes. In fetch mode the backend passes a `live`
 * BatterStatcast (from Baseball Savant); in mock mode the baked snapshot from
 * mockPlayerEnrichment is used.
 */

import type {
  BatterStatcast,
  BatterSplitRow,
  BatterVsPitcher,
  BestLine,
  PitcherPanelSplit,
  PitchVulnerability,
  PlayerProp,
  PropCalculation,
} from './types';
import type { PlayerEnrichment } from './mockSeed';

/** Stable string hash → [0,1) for deterministic synthetic fields. */
function hash01(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** A representative probable starter per opponent team (head-to-head label). */
const OPP_PITCHER: Record<string, string> = {
  BOS: 'Brayan Bello',
  SF: 'Logan Webb',
  TEX: 'Nathan Eovaldi',
  MIL: 'Freddy Peralta',
  NYY: 'Carlos Rodón',
  LAD: 'Tyler Glasnow',
  HOU: 'Framber Valdez',
  CHC: 'Justin Steele',
  ATL: 'Spencer Strider',
  PIT: 'Paul Skenes',
};

function opposingPitcherName(opponent: string | undefined, seed: number): string {
  if (opponent && OPP_PITCHER[opponent]) return OPP_PITCHER[opponent];
  const pool = Object.values(OPP_PITCHER);
  return pool[Math.floor(seed * pool.length) % pool.length];
}

const SPLIT_FACTORS: { split: string; f: number }[] = [
  { split: 'Season', f: 1.0 },
  { split: 'Last 30', f: 1.04 },
  { split: 'Last 15', f: 1.09 },
  { split: 'Last 7', f: 0.94 },
  { split: "vs Today's Pitcher", f: 0.88 },
];

function r(v: number | undefined, dp: number): number | undefined {
  if (v == null) return undefined;
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}

/** Build the Prop Analyzer stat-breakdown rows from a base Statcast line. */
export function buildSplitRows(base: BatterStatcast): BatterSplitRow[] {
  return SPLIT_FACTORS.map(({ split, f }) => ({
    split,
    avg: r((base.ba ?? 0) * f, 3),
    woba: r((base.woba ?? 0) * f, 3),
    xwoba: r((base.xwoba ?? 0) * f, 3),
    slg: r((base.slg ?? 0) * f, 3),
    exitVelo: r((base.exitVelo ?? 0) * (1 + (f - 1) * 0.3), 1),
    barrelPct: r((base.barrelPct ?? 0) * f, 1),
    hardHitPct: r((base.hardHitPct ?? 0) * (1 + (f - 1) * 0.5), 1),
    launchAngle: base.launchAngle,
    kPct: r((base.kPct ?? 0) * (2 - f), 1),
    bbPct: base.bbPct,
  }));
}

const PITCH_TYPES = ['4-Seam Fastball', 'Slider', 'Curveball', 'Changeup', 'Sinker'];

/** Synthesize a pitch-vulnerability profile anchored to the batter's K rate. */
export function buildPitchVulnerability(base: BatterStatcast): PitchVulnerability[] {
  const kBase = base.kPct ?? 22;
  const wBase = base.woba ?? 0.32;
  // Deterministic per-pitch spread.
  const spreads = [-6, 8, 4, -2, 1];
  return PITCH_TYPES.map((pitchType, i) => {
    const whiffPct = Math.max(8, Math.round((kBase + spreads[i]) * 10) / 10);
    const woba = Math.max(0.2, Math.round((wBase + (3 - i) * 0.012) * 1000) / 1000);
    const verdict: PitchVulnerability['verdict'] =
      whiffPct >= 30 ? 'struggles' : whiffPct <= 18 ? 'succeeds' : 'neutral';
    return { pitchType, whiffPct, woba, verdict };
  });
}

/** Platoon-split the edge by batter handedness (proxy for vs RHP / vs LHP edge). */
function platoonEdges(edge: number, hand: 'L' | 'R' | 'S'): { vsRHP: number; vsLHP: number } {
  // L batters do better vs RHP; R batters better vs LHP; switch hitters neutral.
  const delta = hand === 'L' ? 2.5 : hand === 'R' ? -1.5 : 0.5;
  return {
    vsRHP: Math.round((edge + delta) * 10) / 10,
    vsLHP: Math.round((edge - delta) * 10) / 10,
  };
}

/** Flat Statcast fields shared by PlayerProp and PropCalculation enrichment. */
function flatFields(
  edge: number,
  enr: PlayerEnrichment,
  statcast?: BatterStatcast
): Partial<PlayerProp> {
  const platoon = platoonEdges(edge, enr.handedness);
  return {
    handedness: enr.handedness,
    exitVelo: statcast?.exitVelo,
    barrelPct: statcast?.barrelPct,
    hardHitPct: statcast?.hardHitPct,
    xwoba: statcast?.xwoba,
    whiffPct: statcast?.kPct != null ? r(statcast.kPct + 6, 1) : undefined,
    edgeVsRHP: platoon.vsRHP,
    edgeVsLHP: platoon.vsLHP,
    parkFactor: enr.parkFactor,
  };
}

/** Build a deterministic batter-vs-pitcher head-to-head from the matchup seed. */
function buildBatterVsPitcher(
  seed: number,
  pitcher: string,
  statcast?: BatterStatcast
): BatterVsPitcher {
  const ab = 8 + Math.floor(seed * 30); // 8–37 career AB
  const avg = Math.max(0.12, Math.min(0.45, (statcast?.ba ?? 0.26) + (seed - 0.5) * 0.12));
  const h = Math.round(ab * avg);
  const hr = Math.floor(seed * 4); // 0–3
  const slg = Math.max(avg, Math.min(0.95, avg + 0.18 + seed * 0.25));
  const kPct = Math.round((statcast?.kPct ?? 22) + (seed - 0.5) * 10);
  const brlPct = Math.round(((statcast?.barrelPct ?? 9) + (seed - 0.5) * 6) * 10) / 10;
  return {
    pitcher,
    sinceYear: 2021,
    ab,
    h,
    hr,
    avg: Math.round(avg * 1000) / 1000,
    slg: Math.round(slg * 1000) / 1000,
    kPct: Math.max(5, kPct),
    brlPct: Math.max(0, brlPct),
  };
}

/** Build a pitcher panel (season + home/away + platoon splits) for the analyzer. */
function buildPitcherPanel(seed: number): PitcherPanelSplit[] {
  const base = {
    era: 3.2 + seed * 1.6,
    whip: 1.05 + seed * 0.35,
    oba: 0.23 + seed * 0.05,
    kPct: 22 + seed * 10,
    k9: 8.5 + seed * 3,
    hr9: 0.8 + seed * 0.9,
    brlPct: 6 + seed * 5,
  };
  const rows: { split: string; f: number }[] = [
    { split: "'26 Season", f: 1.0 },
    { split: "'26 Home", f: 0.94 },
    { split: "'26 Away", f: 1.07 },
    { split: "'26 vs RHB", f: 0.97 },
    { split: "'26 vs LHB", f: 1.05 },
  ];
  return rows.map(({ split, f }) => ({
    split,
    era: Math.round(base.era * f * 100) / 100,
    whip: Math.round(base.whip * f * 100) / 100,
    oba: Math.round(base.oba * f * 1000) / 1000,
    kPct: Math.round(base.kPct * (2 - f) * 10) / 10,
    k9: Math.round(base.k9 * (2 - f) * 10) / 10,
    hr9: Math.round(base.hr9 * f * 100) / 100,
    brlPct: Math.round(base.brlPct * f * 10) / 10,
  }));
}

/** Build the best-lines strip across books for the analyzer. */
function buildBestLines(line: number, overOdds: number, underOdds: number, seed: number): BestLine[] {
  const books = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars'];
  return books.map((book, i) => {
    const adj = (((seed * 7 + i) % 3) - 1) * 0.5; // -0.5 / 0 / +0.5
    const oOdds = Math.round(overOdds + ((i % 2 === 0 ? 1 : -1) * (5 + i * 3)));
    const uOdds = Math.round(underOdds + ((i % 2 === 0 ? -1 : 1) * (5 + i * 3)));
    return {
      book,
      line: Math.round((line + adj) * 2) / 2,
      overOdds: oOdds,
      underOdds: uOdds,
    };
  });
}

/** Enrich a full PropCalculation (prop-analyzer deep dive + player-props rows). */
export function enrichCalculation(
  calc: PropCalculation,
  enr: PlayerEnrichment | undefined,
  live?: BatterStatcast
): PropCalculation {
  if (!enr) return calc;
  const statcast = live ?? enr.statcast;
  const flat = flatFields(calc.edge, enr, statcast);
  const seed = hash01(calc.playerId + (calc.statType ?? ''));
  const oppPitcher = opposingPitcherName(calc.opponent, seed);

  // Hit-rate fraction from the last ≤10 logged games.
  const log = (calc.gameLog ?? []).slice(0, 10);
  const hitRateGames = log.length || undefined;
  const hitRateHits = log.length
    ? log.filter((g) => (g.hit ?? (g.line != null && g.value >= g.line))).length
    : undefined;

  return {
    ...calc,
    ...flat,
    mlbId: enr.mlbId,
    position: enr.position,
    statcast,
    splitRows: statcast ? buildSplitRows(statcast) : undefined,
    pitchVulnerability: statcast ? buildPitchVulnerability(statcast) : undefined,
    // Extended derived fields (propfinder / doinksports parity)
    l5PaPerG: Math.round((3.8 + seed * 1.0) * 10) / 10,
    nearHr: Math.floor(seed * 5),
    hrFbPct: Math.round((10 + seed * 15) * 10) / 10,
    pulledAirPct: Math.round((30 + seed * 20) * 10) / 10,
    hitRateHits,
    hitRateGames,
    opposingPitcher: oppPitcher,
    batterVsPitcher: buildBatterVsPitcher(seed, oppPitcher, statcast),
    pitcherPanel: buildPitcherPanel(seed),
    bestLines:
      calc.line != null
        ? buildBestLines(calc.line, calc.overOdds ?? -110, calc.underOdds ?? -110, seed)
        : undefined,
  };
}

/** Enrich a flat PlayerProp (cheatsheet + player-props table). */
export function enrichPlayerProp(
  prop: PlayerProp,
  enr: PlayerEnrichment | undefined,
  live?: BatterStatcast
): PlayerProp {
  if (!enr) return prop;
  const statcast = live ?? enr.statcast;
  return { ...prop, mlbId: enr.mlbId, ...flatFields(prop.edge ?? 0, enr, statcast) };
}
