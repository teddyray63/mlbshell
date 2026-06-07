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
  PitchVulnerability,
  PlayerProp,
  PropCalculation,
} from './types';
import type { PlayerEnrichment } from './mockSeed';

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

/** Enrich a full PropCalculation (prop-analyzer deep dive + player-props rows). */
export function enrichCalculation(
  calc: PropCalculation,
  enr: PlayerEnrichment | undefined,
  live?: BatterStatcast
): PropCalculation {
  if (!enr) return calc;
  const statcast = live ?? enr.statcast;
  const flat = flatFields(calc.edge, enr, statcast);
  return {
    ...calc,
    ...flat,
    position: enr.position,
    statcast,
    splitRows: statcast ? buildSplitRows(statcast) : undefined,
    pitchVulnerability: statcast ? buildPitchVulnerability(statcast) : undefined,
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
  return { ...prop, ...flatFields(prop.edge ?? 0, enr, statcast) };
}
