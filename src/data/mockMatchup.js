/**
 * mockMatchup — synthesizes a full MatchupGame payload from the seed universe so
 * the /matchup-engine page renders identically in mock mode and fetch mode.
 *
 * Pitcher splits / arsenals and filler batters are generated deterministically
 * so the UI (color coding, CSV export, pitch filters) has realistic data.
 */

import {
  mockGameList,
  mockWeatherList,
  mockPlayerPropInputs,
  mockPlayerEnrichment,
} from './mockProps';

// ─── Park factors (real-ish snapshot for the seed venues) ────────────────────

const PARK_FACTORS = {
  'Yankee Stadium': { parkFactor: 105, hrFactor: 113, runsFactor: 103, hrRateL3: [2.9, 2.8, 3.0] },
  'Dodger Stadium': { parkFactor: 100, hrFactor: 106, runsFactor: 99, hrRateL3: [2.7, 2.6, 2.8] },
  'Minute Maid Park': { parkFactor: 99, hrFactor: 101, runsFactor: 100, hrRateL3: [2.5, 2.6, 2.5] },
  'Truist Park': { parkFactor: 102, hrFactor: 104, runsFactor: 101, hrRateL3: [2.6, 2.7, 2.6] },
  'Wrigley Field': { parkFactor: 102, hrFactor: 108, runsFactor: 103, hrRateL3: [2.7, 2.9, 2.6] },
};

function parkFactor(venue) {
  const p = PARK_FACTORS[venue];
  return p ? { venue, ...p } : null;
}

// ─── Deterministic helpers ───────────────────────────────────────────────────

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const round = (n, dp) => Math.round(n * 10 ** dp) / 10 ** dp;

// ─── Pitcher synthesis ───────────────────────────────────────────────────────

const PITCH_LIBRARY = [
  { pitchType: 'FF', pitchName: '4-Seam Fastball', velo: 95.6 },
  { pitchType: 'SL', pitchName: 'Slider', velo: 87.2 },
  { pitchType: 'CH', pitchName: 'Changeup', velo: 88.1 },
  { pitchType: 'CU', pitchName: 'Curveball', velo: 80.4 },
  { pitchType: 'SI', pitchName: 'Sinker', velo: 94.3 },
];

function makeSplits(id) {
  const base = hash(id);
  const rows = [
    { split: 'Season', m: 1.0 },
    { split: 'vsLHB', m: 1.08 },
    { split: 'vsRHB', m: 0.94 },
  ];
  return rows.map(({ split, m }) => {
    const woba = round((0.295 + base * 0.05) * m, 3);
    const kPct = round((26 + base * 6) / m, 1);
    return {
      split,
      ip: split === 'Season' ? round(60 + base * 40, 1) : undefined,
      bf: split === 'Season' ? Math.round(260 + base * 120) : Math.round(120 + base * 60),
      baa: round((0.225 + base * 0.03) * m, 3),
      woba,
      slg: round((0.38 + base * 0.06) * m, 3),
      iso: round((0.14 + base * 0.04) * m, 3),
      whip: round((1.05 + base * 0.25) * m, 2),
      hr: Math.round((8 + base * 8) * m),
      hr9: round((0.9 + base * 0.6) * m, 2),
      bbPct: round((6 + base * 4) * m, 1),
      whiffPct: round((28 + base * 8) / m, 1),
      kPct,
      putawayPct: round((19 + base * 5) / m, 1),
      swstrPct: round((11 + base * 4) / m, 1),
      k9: round((9 + base * 3) / m, 1),
      firstPitchStrikePct: round(58 + base * 10, 1),
    };
  });
}

function makeArsenal(id) {
  const base = hash(id + 'arsenal');
  const n = 4 + (base > 0.6 ? 1 : 0);
  const pitches = PITCH_LIBRARY.slice(0, n);
  const usages = [42, 24, 16, 12, 6].slice(0, n);
  return pitches.map((p, i) => {
    const b = hash(id + p.pitchType);
    return {
      pitchType: p.pitchType,
      pitchName: p.pitchName,
      count: Math.round((300 + b * 400) * (usages[i] / 100)),
      usagePct: usages[i],
      bbe: Math.round(40 + b * 60),
      ba: round(0.21 + b * 0.07, 3),
      woba: round(0.28 + b * 0.08, 3),
      slg: round(0.35 + b * 0.12, 3),
      iso: round(0.12 + b * 0.06, 3),
      hr: Math.round(b * 6),
      bbPct: round(5 + b * 5, 1),
      whiffPct: round(22 + b * 16, 1),
      kPct: round(20 + b * 12, 1),
      putawayPct: round(16 + b * 8, 1),
      swstrPct: round(9 + b * 7, 1),
      velo: round(p.velo + (b - 0.5) * 2, 1),
      exitVelo: round(87 + b * 6, 1),
      launchAngle: round(8 + b * 12, 1),
      hardHitPct: round(35 + b * 15, 1),
    };
  });
}

function hrRisk(v) {
  return v > 0.66 ? 'high' : v < 0.4 ? 'low' : 'medium';
}

function makePitcher(seedPlayerId, name, team, throws) {
  const id = seedPlayerId || `${team}-sp`;
  const r = hash(id + 'risk');
  return {
    playerId: mockPlayerEnrichment[seedPlayerId]?.mlbId || id,
    name,
    team,
    throws,
    hrRiskVsLHB: hrRisk(hash(id + 'L')),
    hrRiskVsRHB: hrRisk(r),
    splits: makeSplits(id),
    arsenal: makeArsenal(id),
  };
}

// ─── Batter synthesis ────────────────────────────────────────────────────────

function batterFromEnrichment(input) {
  const enr = mockPlayerEnrichment[input.playerId];
  const sc = enr?.statcast;
  const b = hash(input.playerId);
  return {
    playerId: enr?.mlbId || input.playerId,
    name: input.player,
    team: input.team,
    handedness: enr?.handedness || 'R',
    battingOrder: undefined,
    odds: input.overOdds,
    pa: sc?.pa ?? Math.round(180 + b * 100),
    l5PaPerG: round(3.8 + b * 0.8, 1),
    hr: Math.round((sc?.barrelPct ?? 8) * 0.8),
    nearHr: Math.round((sc?.barrelPct ?? 8) * 0.5),
    ba: sc?.ba,
    obp: sc?.ba != null ? round(sc.ba + 0.07 + b * 0.03, 3) : undefined,
    slg: sc?.slg,
    iso: sc?.slg != null && sc?.ba != null ? round(sc.slg - sc.ba, 3) : undefined,
    woba: sc?.woba,
    bbPct: sc?.bbPct,
    whiffPct: sc?.kPct != null ? round(sc.kPct + 6, 1) : undefined,
    kPct: sc?.kPct,
    swstrPct: sc?.kPct != null ? round(sc.kPct * 0.5, 1) : undefined,
  };
}

const FILLER_NAMES = [
  ['Carlos Mendez', 'R'],
  ['Tyler Brooks', 'L'],
  ['Diego Ramirez', 'S'],
  ['Sam Coleman', 'R'],
  ['Andre Watts', 'L'],
  ['Marcus Lee', 'R'],
  ['Owen Parker', 'L'],
];

function fillerBatter(team, i, gameId) {
  const id = `${team}-fill-${i}`;
  const b = hash(id + gameId);
  const [name, hand] = FILLER_NAMES[i % FILLER_NAMES.length];
  const ba = round(0.23 + b * 0.06, 3);
  const slg = round(0.36 + b * 0.16, 3);
  const kPct = round(18 + b * 12, 1);
  return {
    playerId: id,
    name,
    team,
    handedness: hand,
    odds: b > 0.5 ? Math.round(120 + b * 120) : -Math.round(110 + b * 60),
    pa: Math.round(150 + b * 120),
    l5PaPerG: round(3.6 + b * 0.9, 1),
    hr: Math.round(b * 10),
    nearHr: Math.round(b * 6),
    ba,
    obp: round(ba + 0.06 + b * 0.03, 3),
    slg,
    iso: round(slg - ba, 3),
    woba: round(0.3 + b * 0.08, 3),
    bbPct: round(6 + b * 5, 1),
    whiffPct: round(kPct + 6, 1),
    kPct,
    swstrPct: round(kPct * 0.5, 1),
  };
}

// ─── Public builder ──────────────────────────────────────────────────────────

const SEED_PITCHERS = {
  'game-1': {
    home: ['p-cole', 'Gerrit Cole', 'NYY', 'R'],
    away: [null, 'Brayan Bello', 'BOS', 'R'],
  },
  'game-2': { home: ['p-snell', 'Blake Snell', 'LAD', 'L'], away: [null, 'Logan Webb', 'SF', 'R'] },
  'game-3': {
    home: [null, 'Framber Valdez', 'HOU', 'L'],
    away: [null, 'Nathan Eovaldi', 'TEX', 'R'],
  },
  'game-4': {
    home: [null, 'Spencer Strider', 'ATL', 'R'],
    away: [null, 'Zack Wheeler', 'PHI', 'R'],
  },
  'game-5': {
    home: [null, 'Shota Imanaga', 'CHC', 'L'],
    away: [null, 'Freddy Peralta', 'MIL', 'R'],
  },
};

export function buildMockMatchup(gameId) {
  const game = mockGameList.find((g) => g.id === gameId) || mockGameList[0];
  if (!game) return null;
  const wx = mockWeatherList.find((w) => w.gameId === game.id) || null;

  const sp = SEED_PITCHERS[game.id] || {
    home: [null, `${game.homeTeam} Starter`, game.homeTeam, 'R'],
    away: [null, `${game.awayTeam} Starter`, game.awayTeam, 'R'],
  };
  const pitchers = [makePitcher(...sp.home), makePitcher(...sp.away)];

  // Batters: enriched seed hitters in this game + deterministic filler to ~9 per side.
  const seedHitters = mockPlayerPropInputs.filter(
    (p) => p.gameId === game.id && !p.statType.includes('Pitcher')
  );
  const batters = seedHitters.map(batterFromEnrichment);
  const sides = [game.awayTeam, game.homeTeam];
  for (const team of sides) {
    const have = batters.filter((b) => b.team === team).length;
    for (let i = have; i < 5; i += 1) batters.push(fillerBatter(team, i, game.id));
  }
  batters.forEach((b, i) => {
    b.battingOrder = (i % 9) + 1;
  });

  // Deterministic betting market (propfinder-style game header).
  const mh = hash(`${game.id}-market`);
  const homeFav = mh > 0.5;
  const favOdds = -(110 + Math.round(mh * 70)); // -110 .. -180
  const dogOdds = +(100 + Math.round((1 - mh) * 60)); // +100 .. +160
  const rlOdds = -(105 + Math.round(mh * 30));
  const rlDogOdds = -(105 + Math.round((1 - mh) * 30));
  const winsH = 28 + Math.round(hash(`${game.id}-${game.homeTeam}`) * 20);
  const winsA = 28 + Math.round(hash(`${game.id}-${game.awayTeam}`) * 20);

  return {
    gameId: game.id,
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    venue: game.venue,
    gameTime: game.gameTime,
    overUnder: game.overUnder,
    overUnderOverOdds: -110,
    overUnderUnderOdds: -110,
    lineupConfirmed: game.status === 'scheduled' || game.status === 'live',
    homeMoneyline: homeFav ? favOdds : dogOdds,
    awayMoneyline: homeFav ? dogOdds : favOdds,
    homeRunLine: homeFav ? -1.5 : 1.5,
    homeRunLineOdds: homeFav ? rlDogOdds : rlOdds,
    awayRunLine: homeFav ? 1.5 : -1.5,
    awayRunLineOdds: homeFav ? rlOdds : rlDogOdds,
    homeRecord: `${winsH}-${62 - winsH}`,
    awayRecord: `${winsA}-${62 - winsA}`,
    weather: wx,
    parkFactor: parkFactor(game.venue),
    pitchers,
    batters,
  };
}

buildMockMatchup.parkFactor = parkFactor;

// ─── HR Targets (gameday-insights Homerun Targets) ───────────────────────────

/** All probable pitchers across the seed slate, as HR-target rows. */
export function buildMockHRTargets() {
  const rows = [];
  for (const game of mockGameList) {
    const sp = SEED_PITCHERS[game.id];
    if (!sp) continue;
    for (const [side, opp] of [
      ['home', game.awayTeam],
      ['away', game.homeTeam],
    ]) {
      const [seedId, name, team, throws] = sp[side];
      const id = seedId || `${team}-sp`;
      const b = hash(id + 'hrt');
      const abs = Math.round(120 + b * 180);
      const hr = Math.round(8 + b * 22);
      const hr9 = round(0.7 + b * 1.4, 2);
      rows.push({
        playerId: mockPlayerEnrichment[seedId]?.mlbId || id,
        name,
        team,
        opp,
        gameTime: game.gameTime,
        throws,
        abs,
        hr,
        absPerHr: round(abs / Math.max(1, hr), 1),
        hr9,
        barrelPct: round(6 + b * 8, 1),
        hardHitPct: round(34 + b * 14, 1),
        hrFbPct: round(10 + b * 15, 1),
        flyBallPct: round(28 + b * 14, 1),
        pulledAirPct: round(30 + b * 20, 1),
      });
    }
  }
  return rows.sort((a, b) => b.hr9 - a.hr9);
}

// ─── Player Deep Dive (moonshots player page) ────────────────────────────────

const DEEP_DIVE_OPPS = ['NYM', 'PHI', 'SD', 'COL', 'MIA', 'WSH', 'STL', 'CIN', 'ARI', 'PIT'];

/** A pitcher deep-dive payload (season stats + advanced splits + game log). */
export function buildMockDeepDive(playerId) {
  // Resolve against the probable-pitcher universe.
  const universe = [];
  for (const game of mockGameList) {
    const sp = SEED_PITCHERS[game.id];
    if (!sp) continue;
    for (const side of ['home', 'away']) {
      const [seedId, name, team, throws] = sp[side];
      const id = String(mockPlayerEnrichment[seedId]?.mlbId || seedId || `${team}-sp`);
      universe.push({ id, name, team, throws, seedId });
    }
  }
  const pick =
    universe.find((p) => p.id === String(playerId)) ||
    universe.find((p) => p.name === playerId) ||
    universe[0];
  if (!pick) return null;

  const b = hash(pick.id + 'dd');
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

  const splitDefs = [
    { split: 'vs L', f: 1.06 },
    { split: 'vs R', f: 0.95 },
    { split: 'Total', f: 1.0 },
    { split: '% Rank', f: 1.0, rank: true },
  ];
  const advancedSplits = splitDefs.map(({ split, f, rank }) =>
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

  const gameLog = Array.from({ length: 10 }).map((_, i) => {
    const gb = hash(`${pick.id}-glog-${i}`);
    const gIp = round(4 + gb * 3, 1);
    const gK = Math.round(gIp * (k9 / 9) + gb * 2);
    const gER = Math.round(gb * 4);
    const d = new Date();
    d.setDate(d.getDate() - (i + 1) * 5);
    return {
      date: d.toISOString().slice(0, 10),
      opp: DEEP_DIVE_OPPS[i % DEEP_DIVE_OPPS.length],
      home: i % 2 === 0,
      started: true,
      dkPts: round(10 + gb * 22, 1),
      pitchCount: Math.round(75 + gb * 30),
      ip: gIp,
      r: gER + Math.round(gb * 2),
      er: gER,
      h: Math.round(gIp * (h9 / 9) + gb * 2),
      bb: Math.round(gb * 4),
      k: gK,
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
    playerId: pick.id,
    name: pick.name,
    team: pick.team,
    throws: pick.throws,
    season,
    advancedSplits,
    gameLog,
  };
}

/** List of selectable deep-dive pitchers (for the search/selector). */
export function buildMockDeepDiveList() {
  const seen = new Set();
  const out = [];
  for (const game of mockGameList) {
    const sp = SEED_PITCHERS[game.id];
    if (!sp) continue;
    for (const side of ['home', 'away']) {
      const [seedId, name, team, throws] = sp[side];
      const id = String(mockPlayerEnrichment[seedId]?.mlbId || seedId || `${team}-sp`);
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ id, name, team, throws });
    }
  }
  return out;
}
