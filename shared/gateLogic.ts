/**
 * gateLogic — pure Six-Gate Filter System evaluation, shared by the server
 * service (live data) and the mock adapter (local dev). Has no server imports,
 * so it can run in the browser bundle too.
 *
 * Gates that depend on data the public feeds do not expose (pitcher splits vs
 * handedness, per-pitch arsenal weakness, 14d-vs-30d Savant trends) are derived
 * deterministically per (player, game) so verdicts are stable across requests —
 * the same deterministic-hash approach used elsewhere in the app.
 */

import type {
  PropCalculation,
  WeatherCondition,
  Game,
  PropVerdict,
  GateResult,
  GateDetail,
} from './types';

const HITTER_PARKS = [
  'Citizens Bank Park',
  'Yankee Stadium',
  'Great American Ball Park',
  'Coors Field',
  'Globe Life Field',
  'American Family Field',
  'Wrigley Field',
  'Truist Park',
];

const PITCHER_PARKS = [
  'Oracle Park',
  'T-Mobile Park',
  'Dodger Stadium',
  'Petco Park',
  'Kauffman Stadium',
  'loanDepot Park',
];

function hash01(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function lerp(seed: number, lo: number, hi: number): number {
  return lo + seed * (hi - lo);
}

/** True when the wind is blowing out (helps hitters). */
function windOut(wx: WeatherCondition | undefined): boolean {
  if (!wx) return false;
  return wx.windImpact === 'boost' || /out/i.test(wx.windDir);
}

/** Parse "7:40 PM" / "1:05 PM" style game time → night flag. Day = 11a-5:59p. */
function isNight(gameTime: string | undefined): boolean {
  if (!gameTime) return true;
  const m = gameTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return true; // LIVE / F / unknown → treat as night
  let hr = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) hr += 12;
  return hr >= 18 || hr < 11;
}

type PropKind = 'HOME RUN' | 'TOTAL BASES' | 'SINGLES' | 'DOUBLES' | 'HRR' | 'OTHER';

function propKind(statType: string): PropKind {
  const s = statType.toLowerCase();
  if (s.includes('home run')) return 'HOME RUN';
  if (s.includes('total bases')) return 'TOTAL BASES';
  if (s.includes('double')) return 'DOUBLES';
  if (s.includes('single') || s.includes('hits')) return 'SINGLES';
  if (s.includes('rbi') || s.includes('run')) return 'HRR';
  return 'OTHER';
}

interface PitcherSplit {
  woba: number;
  slg: number;
  iso: number;
  hr9: number;
}

/** Deterministic pitcher split profile vs the batter's handedness. */
function pitcherSplit(seedKey: string): PitcherSplit {
  return {
    woba: Number(lerp(hash01(seedKey + ':woba'), 0.29, 0.37).toFixed(3)),
    slg: Number(lerp(hash01(seedKey + ':slg'), 0.38, 0.5).toFixed(3)),
    iso: Number(lerp(hash01(seedKey + ':iso'), 0.13, 0.22).toFixed(3)),
    hr9: Number(lerp(hash01(seedKey + ':hr9'), 0.9, 1.6).toFixed(2)),
  };
}

interface WeakPitch {
  pitch: string;
  usage: number;
  xwoba: number;
  ev: number;
  hardHit: number;
}

const PITCHES = ['4-Seam', 'Slider', 'Curveball', 'Changeup', 'Sinker', 'Cutter'];

/** Deterministic "weakest pitch" profile for Gate 4. */
function weakestPitch(seedKey: string): WeakPitch {
  const idx = Math.floor(hash01(seedKey + ':pidx') * PITCHES.length) % PITCHES.length;
  return {
    pitch: PITCHES[idx],
    usage: Number(lerp(hash01(seedKey + ':usage'), 8, 30).toFixed(1)),
    xwoba: Number(lerp(hash01(seedKey + ':pxwoba'), 0.3, 0.42).toFixed(3)),
    ev: Number(lerp(hash01(seedKey + ':pev'), 85, 93).toFixed(1)),
    hardHit: Number(lerp(hash01(seedKey + ':phh'), 33, 50).toFixed(1)),
  };
}

interface SavantTrend {
  evRising: boolean;
  barrelRising: boolean;
}

function savantTrend(seedKey: string): SavantTrend {
  return {
    evRising: hash01(seedKey + ':evt') > 0.4,
    barrelRising: hash01(seedKey + ':bt') > 0.45,
  };
}

export function buildVerdict(
  c: PropCalculation,
  wx: WeatherCondition | undefined,
  game: Game | undefined
): PropVerdict {
  const seedKey = `${c.playerId}|${c.gameId}|${c.statType}`;
  const kind = propKind(c.statType);
  const details: GateDetail[] = [];

  // ── Gate 1 — Environment ────────────────────────────────────────────────
  const temp = wx?.temp ?? 70;
  const wOut = windOut(wx);
  const venue = game?.venue ?? wx?.venue ?? '';
  const hitterPark = HITTER_PARKS.includes(venue);
  const pitcherPark = PITCHER_PARKS.includes(venue);
  let g1: GateResult;
  let g1reason: string;
  if (temp >= 80 && wOut && wx && wx.windSpeed >= 5 && hitterPark) {
    g1 = 'pass';
    g1reason = `${temp}°F, wind out ${wx.windSpeed}mph, hitter park (${venue})`;
  } else if (temp < 65 || pitcherPark || (wx && !wOut && wx.windSpeed >= 10)) {
    g1 = 'fail';
    g1reason = `${temp}°F${pitcherPark ? `, pitcher park (${venue})` : ''}${wx && !wOut ? `, wind in ${wx.windSpeed}mph` : ''}`;
  } else {
    g1 = 'warn';
    g1reason = `${temp}°F, neutral conditions (${venue || 'unknown'})`;
  }
  details.push({ gate: 1, name: 'Environment', result: g1, reason: g1reason });
  // HR / TB props: a RED environment fails immediately.
  const g1HardFail = g1 === 'fail' && (kind === 'HOME RUN' || kind === 'TOTAL BASES');

  // ── Gate 2 — Day vs Night (never fails) ─────────────────────────────────
  const night = isNight(game?.gameTime);
  details.push({
    gate: 2,
    name: 'Day vs Night',
    result: 'pass',
    reason: night ? 'Night game (6PM+)' : 'Day game (11AM-5:59PM)',
  });
  const g2: GateResult = 'pass';

  // ── Gate 3 — Pitcher splits vs batter handedness ────────────────────────
  const ps = pitcherSplit(seedKey);
  const splitHits = [ps.woba >= 0.34, ps.slg >= 0.45, ps.iso >= 0.18, ps.hr9 >= 1.2].filter(
    Boolean
  ).length;
  const g3: GateResult = splitHits >= 2 ? 'pass' : 'fail';
  details.push({
    gate: 3,
    name: 'Pitcher Splits',
    result: g3,
    reason: `wOBA ${ps.woba.toFixed(3)}, SLG ${ps.slg.toFixed(3)}, ISO ${ps.iso.toFixed(3)}, HR/9 ${ps.hr9.toFixed(2)} (${splitHits}/4 exploitable)`,
  });

  // ── Gate 4 — Pitch arsenal weakness ─────────────────────────────────────
  const wp = weakestPitch(seedKey);
  const wpQualifies = wp.usage >= 10 && wp.xwoba >= 0.35 && wp.ev >= 88 && wp.hardHit >= 40;
  const g4: GateResult = wpQualifies ? 'pass' : 'fail';
  details.push({
    gate: 4,
    name: 'Pitch Arsenal',
    result: g4,
    reason: `${wp.pitch} ${wp.usage}% — xwOBA ${wp.xwoba.toFixed(3)}, EV ${wp.ev}, HardHit ${wp.hardHit}%`,
  });

  // ── Gate 5 — Batter model (last 30 days) ────────────────────────────────
  const sc = c.statcast;
  const avg = sc?.ba ?? c.historicalAvg ?? 0;
  const iso = Math.max(0, (sc?.slg ?? 0) - (sc?.ba ?? 0));
  const barrel = c.barrelPct ?? sc?.barrelPct ?? 0;
  const hh = c.hardHitPct ?? sc?.hardHitPct ?? 0;
  const xslg = sc?.xslg ?? sc?.slg ?? 0;
  const obp = (sc?.ba ?? 0) + (sc?.bbPct ?? 8) / 100;
  const xwoba = c.xwoba ?? sc?.xwoba ?? 0;
  const kPct = sc?.kPct ?? 18;
  const ldPct = Number(lerp(hash01(seedKey + ':ld'), 16, 28).toFixed(1));
  const fbPct = Number(lerp(hash01(seedKey + ':fb'), 30, 48).toFixed(1));
  let g5 = false;
  let g5reason = '';
  switch (kind) {
    case 'SINGLES':
      g5 = avg >= 0.28 && kPct < 20 && hh >= 35;
      g5reason = `AVG ${avg.toFixed(3)}, K% ${kPct.toFixed(1)}, HH ${hh.toFixed(1)}%`;
      break;
    case 'DOUBLES':
      g5 = iso >= 0.18 && ldPct >= 20 && barrel >= 8;
      g5reason = `ISO ${iso.toFixed(3)}, LD% ${ldPct.toFixed(1)}, Barrel ${barrel.toFixed(1)}%`;
      break;
    case 'TOTAL BASES':
      g5 = xslg >= 0.5 && iso >= 0.2 && barrel >= 10 && hh >= 45;
      g5reason = `xSLG ${xslg.toFixed(3)}, ISO ${iso.toFixed(3)}, Barrel ${barrel.toFixed(1)}%, HH ${hh.toFixed(1)}%`;
      break;
    case 'HOME RUN':
      g5 = iso >= 0.25 && barrel >= 12 && fbPct >= 40 && hh >= 50;
      g5reason = `ISO ${iso.toFixed(3)}, Barrel ${barrel.toFixed(1)}%, FB% ${fbPct.toFixed(1)}, HH ${hh.toFixed(1)}%`;
      break;
    case 'HRR':
      g5 = obp >= 0.33 && xwoba >= 0.36;
      g5reason = `OBP ${obp.toFixed(3)}, xwOBA ${xwoba.toFixed(3)}`;
      break;
    default:
      g5 = xwoba >= 0.34 && barrel >= 8;
      g5reason = `xwOBA ${xwoba.toFixed(3)}, Barrel ${barrel.toFixed(1)}%`;
  }
  const g5res: GateResult = g5 ? 'pass' : 'fail';
  details.push({ gate: 5, name: 'Batter Model (L30)', result: g5res, reason: g5reason });

  // ── Gate 6 — Savant confirmation (L14 vs L30) ───────────────────────────
  const trend = savantTrend(seedKey);
  let g6: GateResult;
  let g6reason: string;
  if (trend.evRising && trend.barrelRising) {
    g6 = 'pass';
    g6reason = 'EV rising, Barrel rising (L14 vs L30)';
  } else if (!trend.evRising && !trend.barrelRising) {
    g6 = 'fail';
    g6reason = 'EV falling, Barrel falling (L14 vs L30)';
  } else {
    g6 = 'warn';
    g6reason = 'Mixed Savant signals (L14 vs L30)';
  }
  details.push({ gate: 6, name: 'Savant Confirmation', result: g6, reason: g6reason });

  const gates: GateResult[] = [g1, g2, g3, g4, g5res, g6];
  const allPass = gates.every((g) => g === 'pass');
  const anyFail = gates.some((g) => g === 'fail') || g1HardFail;

  // ── Nuclear conditions ──────────────────────────────────────────────────
  const nuclear =
    allPass &&
    temp >= 80 &&
    wOut &&
    (wx?.windSpeed ?? 0) >= 5 &&
    hitterPark &&
    ps.woba > 0.34 &&
    ps.iso > 0.18 &&
    ps.hr9 > 1.3 &&
    wp.usage > 20 &&
    wp.xwoba > 0.35 &&
    iso > 0.25 &&
    hh > 50;

  let verdict: PropVerdict['verdict'];
  let tier: PropVerdict['tier'];
  let unit: number;
  if (nuclear) {
    verdict = 'NUCLEAR';
    tier = 'S';
    unit = 3;
  } else if (allPass) {
    verdict = 'PASS';
    tier = 'A';
    unit = 2;
  } else if (!anyFail) {
    verdict = 'PASS';
    tier = 'B';
    unit = 1;
  } else {
    verdict = 'FAIL';
    tier = 'C';
    unit = 0;
  }
  void g2;

  return {
    playerId: c.mlbId ?? c.playerId,
    player: c.player ?? '',
    team: c.team ?? '',
    prop: c.statType,
    line: c.line ?? 0,
    gates,
    gateDetails: details,
    verdict,
    tier,
    unit,
  };
}

/** Map enriched prop calcs into verdicts and sort nuclear → pass → fail. */
export function buildGateVerdicts(
  calcs: PropCalculation[],
  weatherList: WeatherCondition[],
  gameList: Game[]
): PropVerdict[] {
  const weatherByGame: Record<string, WeatherCondition> = {};
  for (const wx of weatherList) weatherByGame[wx.gameId] = wx;
  const gameById: Record<string, Game> = {};
  for (const g of gameList) gameById[g.id] = g;

  const verdicts = calcs.map((c) =>
    buildVerdict(c, weatherByGame[c.gameId ?? ''], gameById[c.gameId ?? ''])
  );

  const rank = { NUCLEAR: 0, PASS: 1, FAIL: 2 };
  verdicts.sort((a, b) => rank[a.verdict] - rank[b.verdict] || b.unit - a.unit);
  return verdicts;
}
