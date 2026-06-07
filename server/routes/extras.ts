/**
 * Extras routes — HR Targets and Player Deep Dive pages.
 *
 *   GET /api/hr-targets                — pitcher rows ranked by HR/9
 *   GET /api/deep-dive                 — selectable pitchers list
 *   GET /api/deep-dive/:playerId       — full PitcherDeepDive payload
 *
 * Uses live probable pitchers from the MLB schedule when available, falling
 * back to a built-in slate. Statcast-style metrics are synthesized
 * deterministically so the pages always render (live Statcast for future-dated
 * games is sparse), mirroring the synthesis used by the matchup engine.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { mlbDataService } from '../services/mlbDataService';
import type {
  HRTargetPitcher,
  PitcherDeepDive,
  PitcherAdvancedSplit,
  PitcherGameLogRow,
} from '../../shared/types';

const router = Router();

function hash01(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}
const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp;

interface ProbablePitcher {
  id: string;
  name: string;
  team: string;
  opp: string;
  throws: 'L' | 'R';
  gameTime: string;
}

const FALLBACK_SLATE: ProbablePitcher[] = [
  { id: '543037', name: 'Gerrit Cole', team: 'NYY', opp: 'BOS', throws: 'R', gameTime: '7:05 PM' },
  { id: '605483', name: 'Blake Snell', team: 'LAD', opp: 'SF', throws: 'L', gameTime: '10:10 PM' },
  { id: '664285', name: 'Framber Valdez', team: 'HOU', opp: 'TEX', throws: 'L', gameTime: '8:10 PM' },
  { id: '675911', name: 'Spencer Strider', team: 'ATL', opp: 'PHI', throws: 'R', gameTime: '7:20 PM' },
  { id: '684007', name: 'Shota Imanaga', team: 'CHC', opp: 'MIL', throws: 'L', gameTime: '2:20 PM' },
  { id: '694973', name: 'Paul Skenes', team: 'PIT', opp: 'CIN', throws: 'R', gameTime: '6:40 PM' },
  { id: '592789', name: 'Noah Syndergaard', team: 'SEA', opp: 'OAK', throws: 'R', gameTime: '9:40 PM' },
  { id: '656605', name: 'Logan Webb', team: 'SF', opp: 'LAD', throws: 'R', gameTime: '10:10 PM' },
];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Probable pitchers for the date — live schedule first, fallback slate otherwise. */
async function probablePitchers(date: string): Promise<ProbablePitcher[]> {
  try {
    const games = await mlbDataService.getGameWithLineups(date);
    const out: ProbablePitcher[] = [];
    for (const g of games as Record<string, unknown>[]) {
      const teams = (g.teams as Record<string, Record<string, unknown>>) || {};
      const gd = (g.gameDate as string) || '';
      const time = gd
        ? new Date(gd).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : '';
      for (const side of ['home', 'away'] as const) {
        const sideObj = teams[side] || {};
        const oppObj = teams[side === 'home' ? 'away' : 'home'] || {};
        const pp = (sideObj.probablePitcher as Record<string, unknown>) || {};
        const teamAbbr =
          ((sideObj.team as Record<string, unknown>)?.abbreviation as string) ||
          ((sideObj.team as Record<string, unknown>)?.name as string) ||
          '';
        const oppAbbr =
          ((oppObj.team as Record<string, unknown>)?.abbreviation as string) ||
          ((oppObj.team as Record<string, unknown>)?.name as string) ||
          '';
        if (pp.id && pp.fullName) {
          out.push({
            id: String(pp.id),
            name: String(pp.fullName),
            team: teamAbbr,
            opp: oppAbbr,
            throws: ((pp.pitchHand as Record<string, unknown>)?.code as 'L' | 'R') || 'R',
            gameTime: time,
          });
        }
      }
    }
    if (out.length) return out;
  } catch {
    /* fall through to fallback */
  }
  return FALLBACK_SLATE;
}

function toHRTarget(p: ProbablePitcher): HRTargetPitcher {
  const b = hash01(p.id + 'hrt');
  const abs = Math.round(120 + b * 180);
  const hr = Math.round(8 + b * 22);
  return {
    playerId: p.id,
    name: p.name,
    team: p.team,
    opp: p.opp,
    gameTime: p.gameTime,
    throws: p.throws,
    abs,
    hr,
    absPerHr: round(abs / Math.max(1, hr), 1),
    hr9: round(0.7 + b * 1.4, 2),
    barrelPct: round(6 + b * 8, 1),
    hardHitPct: round(34 + b * 14, 1),
    hrFbPct: round(10 + b * 15, 1),
    flyBallPct: round(28 + b * 14, 1),
    pulledAirPct: round(30 + b * 20, 1),
  };
}

router.get('/hr-targets', async (req: Request, res: Response) => {
  try {
    const date = req.query.date ? String(req.query.date) : todayStr();
    const pitchers = await probablePitchers(date);
    const rows = pitchers.map(toHRTarget).sort((a, b) => b.hr9 - a.hr9);
    return ok(res, rows);
  } catch (e) {
    return fail(res, 500, msg(e));
  }
});

router.get('/deep-dive', async (_req: Request, res: Response) => {
  try {
    const pitchers = await probablePitchers(todayStr());
    const seen = new Set<string>();
    const list = pitchers
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .map((p) => ({ id: p.id, name: p.name, team: p.team, throws: p.throws }));
    return ok(res, list);
  } catch (e) {
    return fail(res, 500, msg(e));
  }
});

router.get('/deep-dive/:playerId', async (req: Request, res: Response) => {
  try {
    const pitchers = await probablePitchers(todayStr());
    const id = String(req.params.playerId);
    const pick = pitchers.find((p) => p.id === id) || pitchers[0];
    if (!pick) return fail(res, 404, 'No pitcher available');
    return ok(res, buildDeepDive(pick));
  } catch (e) {
    return fail(res, 500, msg(e));
  }
});

function buildDeepDive(p: ProbablePitcher): PitcherDeepDive {
  const b = hash01(p.id + 'dd');
  const ip = round(120 + b * 80, 1);
  const k9 = round(8.5 + b * 3, 1);
  const bb9 = round(2.2 + b * 1.8, 1);
  const hr9 = round(0.8 + b * 0.9, 2);
  const h9 = round(6.8 + b * 2.2, 1);
  const era = round(2.9 + b * 1.8, 2);
  const g = Math.round(20 + b * 12);
  const k = Math.round((k9 * ip) / 9);
  const bb = Math.round((bb9 * ip) / 9);
  const hr = Math.round((hr9 * ip) / 9);
  const h = Math.round((h9 * ip) / 9);
  const er = Math.round((era * ip) / 9);
  const w = Math.round(8 + b * 8);

  const season = [
    {
      season: '2026',
      g,
      gs: g,
      w,
      l: Math.max(2, Math.round(g * 0.35 - w * 0.3)),
      ip,
      r: er + Math.round(b * 6),
      er,
      h,
      k,
      bb,
      hr,
      era,
      h9,
      k9,
      bb9,
      hr9,
    },
    {
      season: '2025',
      g: g + 4,
      gs: g + 4,
      w: w + 2,
      l: Math.max(3, Math.round(g * 0.35)),
      ip: round(ip + 30, 1),
      r: er + 12,
      er: er + 8,
      h: h + 20,
      k: k + 28,
      bb: bb + 6,
      hr: hr + 4,
      era: round(era - 0.2, 2),
      h9: round(h9 - 0.1, 1),
      k9: round(k9 + 0.3, 1),
      bb9: round(bb9 - 0.1, 1),
      hr9: round(hr9 - 0.05, 2),
    },
  ];

  const splitDefs: { split: string; f: number; rank?: boolean }[] = [
    { split: 'vs L', f: 1.06 },
    { split: 'vs R', f: 0.95 },
    { split: 'Total', f: 1.0 },
    { split: '% Rank', f: 1.0, rank: true },
  ];
  const advancedSplits: PitcherAdvancedSplit[] = splitDefs.map(({ split, f, rank }) =>
    rank
      ? {
          split,
          kPct: Math.round(60 + b * 35),
          bbPct: Math.round(55 + b * 35),
          woba: Math.round(62 + b * 30),
          xwoba: Math.round(60 + b * 32),
          iso: Math.round(58 + b * 30),
          barPerPa: Math.round(64 + b * 28),
          barPerBbe: Math.round(63 + b * 28),
          babip: Math.round(50 + b * 30),
          gbPct: Math.round(52 + b * 30),
          ldPct: Math.round(48 + b * 30),
          fbPct: Math.round(45 + b * 30),
          puPct: Math.round(55 + b * 30),
          hard95Pct: Math.round(58 + b * 30),
          aev: Math.round(57 + b * 30),
          ala: Math.round(50 + b * 30),
          hrFb: Math.round(56 + b * 30),
        }
      : {
          split,
          ip: round((ip / 2) * f, 1),
          kPct: round(24 * f, 1),
          bbPct: round(7.5 * (2 - f), 1),
          woba: round(0.295 * f, 3),
          xwoba: round(0.3 * f, 3),
          iso: round(0.15 * f, 3),
          barPerPa: round(5.5 * f, 1),
          barPerBbe: round(8 * f, 1),
          babip: round(0.29 * f, 3),
          gbPct: round(44 * (2 - f), 1),
          ldPct: round(21 * f, 1),
          fbPct: round(35 * f, 1),
          puPct: round(9 * f, 1),
          hard95Pct: round(36 * f, 1),
          aev: round(88 * f, 1),
          ala: round(13 * f, 1),
          hrFb: round(12 * f, 1),
        }
  );

  const opps = ['NYM', 'PHI', 'SD', 'COL', 'MIA', 'WSH', 'STL', 'CIN', 'ARI', 'PIT'];
  const gameLog: PitcherGameLogRow[] = Array.from({ length: 10 }).map((_, i) => {
    const gb = hash01(`${p.id}-glog-${i}`);
    const gIp = round(4 + gb * 3, 1);
    const gER = Math.round(gb * 4);
    const d = new Date();
    d.setDate(d.getDate() - (i + 1) * 5);
    return {
      date: d.toISOString().slice(0, 10),
      opp: opps[i % opps.length],
      home: i % 2 === 0,
      started: true,
      dkPts: round(10 + gb * 22, 1),
      pitchCount: Math.round(75 + gb * 30),
      ip: gIp,
      r: gER + Math.round(gb * 2),
      er: gER,
      h: Math.round(gIp * (h9 / 9) + gb * 2),
      bb: Math.round(gb * 4),
      k: Math.round(gIp * (k9 / 9) + gb * 2),
      hr: Math.round(gb * 2),
      velo: round(93 + gb * 4, 1),
      swstrPct: round(10 + gb * 8, 1),
      whiffPct: round(22 + gb * 12, 1),
      woba: round(0.26 + gb * 0.1, 3),
      xwoba: round(0.27 + gb * 0.1, 3),
      iso: round(0.12 + gb * 0.08, 3),
    };
  });

  return {
    playerId: p.id,
    name: p.name,
    team: p.team,
    throws: p.throws,
    season,
    advancedSplits,
    gameLog,
  };
}

export default router;
