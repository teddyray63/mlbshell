/**
 * mockProps — realistic, self-consistent MLB mock dataset used by the mock
 * API adapter. Game logs are generated deterministically so that the shared
 * prop-calculation engine (shared/propMath) produces meaningful, stable output
 * (hit rates, projections, edges, EV, confidence) in mock mode.
 */

import type { PlayerPropInput, GameStatLog } from './propMath';
import type { Game, WeatherCondition, TeamRanking, SavedEdge, AnalyticsData } from './types';

// ─── Deterministic RNG ──────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Generate a chronological game log. Values cluster around `mean`; games within
 * the most-recent 15 days get `recentBump` added to create a recency trend.
 */
function makeLog(
  seed: number,
  opponents: string[],
  count: number,
  mean: number,
  spread: number,
  recentBump: number,
  max: number
): GameStatLog[] {
  const rnd = mulberry32(seed);
  const log: GameStatLog[] = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = i; // i=0 is today, increasing into the past
    const bump = daysAgo <= 15 ? recentBump : 0;
    const noise = (rnd() - 0.5) * 2 * spread;
    const raw = mean + bump + noise;
    const value = Math.max(0, Math.min(max, Math.round(raw)));
    log.push({
      date: isoDaysAgo(daysAgo),
      opponent: opponents[i % opponents.length],
      value,
    });
  }
  return log;
}

// ─── Games ──────────────────────────────────────────────────────────────────

const TODAY = isoDaysAgo(0);

export const mockGameList: Game[] = [
  {
    id: 'game-1',
    homeTeam: 'NYY',
    awayTeam: 'BOS',
    date: TODAY,
    gameTime: '1:05 PM',
    venue: 'Yankee Stadium',
    status: 'scheduled',
    homeOdds: -145,
    awayOdds: 125,
    overUnder: 9.0,
  },
  {
    id: 'game-2',
    homeTeam: 'LAD',
    awayTeam: 'SF',
    date: TODAY,
    gameTime: '4:10 PM',
    venue: 'Dodger Stadium',
    status: 'scheduled',
    homeOdds: -165,
    awayOdds: 140,
    overUnder: 8.5,
  },
  {
    id: 'game-3',
    homeTeam: 'HOU',
    awayTeam: 'TEX',
    date: TODAY,
    homeScore: 3,
    awayScore: 2,
    gameTime: 'LIVE',
    venue: 'Minute Maid Park',
    status: 'live',
    inning: 'T7',
  },
  {
    id: 'game-4',
    homeTeam: 'ATL',
    awayTeam: 'PHI',
    date: TODAY,
    homeScore: 5,
    awayScore: 3,
    gameTime: 'F',
    venue: 'Truist Park',
    status: 'final',
  },
  {
    id: 'game-5',
    homeTeam: 'CHC',
    awayTeam: 'MIL',
    date: TODAY,
    gameTime: '7:40 PM',
    venue: 'Wrigley Field',
    status: 'scheduled',
    homeOdds: 110,
    awayOdds: -130,
    overUnder: 8.0,
  },
];

// ─── Weather ────────────────────────────────────────────────────────────────

export const mockWeatherList: WeatherCondition[] = [
  {
    id: 'wx-1',
    venue: 'Yankee Stadium',
    city: 'New York, NY',
    gameId: 'game-1',
    temp: 72,
    feelsLike: 70,
    windSpeed: 12,
    windDir: 'Out to CF',
    humidity: 55,
    condition: 'Partly Cloudy',
    precipitation: 0,
    parkFactor: 1.08,
    windImpact: 'boost',
  },
  {
    id: 'wx-2',
    venue: 'Dodger Stadium',
    city: 'Los Angeles, CA',
    gameId: 'game-2',
    temp: 78,
    feelsLike: 76,
    windSpeed: 6,
    windDir: 'In from LF',
    humidity: 42,
    condition: 'Clear',
    precipitation: 0,
    parkFactor: 0.96,
    windImpact: 'suppress',
  },
  {
    id: 'wx-3',
    venue: 'Minute Maid Park',
    city: 'Houston, TX',
    gameId: 'game-3',
    temp: 85,
    feelsLike: 91,
    windSpeed: 0,
    windDir: 'Dome',
    humidity: 68,
    condition: 'Dome',
    precipitation: 0,
    parkFactor: 1.02,
    windImpact: 'neutral',
  },
  {
    id: 'wx-4',
    venue: 'Wrigley Field',
    city: 'Chicago, IL',
    gameId: 'game-5',
    temp: 65,
    feelsLike: 62,
    windSpeed: 18,
    windDir: 'Out to CF',
    humidity: 61,
    condition: 'Overcast',
    precipitation: 10,
    parkFactor: 1.12,
    windImpact: 'boost',
  },
  {
    id: 'wx-5',
    venue: 'Truist Park',
    city: 'Atlanta, GA',
    gameId: 'game-4',
    temp: 80,
    feelsLike: 83,
    windSpeed: 8,
    windDir: 'L to R',
    humidity: 58,
    condition: 'Clear',
    precipitation: 0,
    parkFactor: 1.01,
    windImpact: 'neutral',
  },
];

// ─── Player prop inputs (with generated game logs) ──────────────────────────

export const mockPlayerPropInputs: PlayerPropInput[] = [
  {
    playerId: 'p-judge',
    player: 'Aaron Judge',
    team: 'NYY',
    opponent: 'BOS',
    gameId: 'game-1',
    statType: 'Home Runs',
    line: 0.5,
    overOdds: 135,
    underOdds: -160,
    log: makeLog(101, ['BOS', 'TB', 'TOR', 'BAL'], 25, 0.55, 0.6, 0.35, 3),
  },
  {
    playerId: 'p-soto',
    player: 'Juan Soto',
    team: 'NYY',
    opponent: 'BOS',
    gameId: 'game-1',
    statType: 'Total Bases',
    line: 1.5,
    overOdds: -120,
    underOdds: 100,
    log: makeLog(102, ['BOS', 'TB', 'TOR', 'BAL'], 25, 1.7, 1.0, 0.6, 6),
  },
  {
    playerId: 'p-cole',
    player: 'Gerrit Cole',
    team: 'NYY',
    opponent: 'BOS',
    gameId: 'game-1',
    statType: 'Strikeouts (Pitcher)',
    line: 7.5,
    overOdds: -110,
    underOdds: -110,
    log: makeLog(103, ['BOS', 'TB', 'TOR', 'BAL'], 25, 8.1, 2.0, 0.7, 14),
  },
  {
    playerId: 'p-betts',
    player: 'Mookie Betts',
    team: 'LAD',
    opponent: 'SF',
    gameId: 'game-2',
    statType: 'Total Bases',
    line: 1.5,
    overOdds: -115,
    underOdds: -105,
    log: makeLog(104, ['SF', 'SD', 'ARI', 'COL'], 25, 1.8, 1.0, 0.5, 6),
  },
  {
    playerId: 'p-ohtani',
    player: 'Shohei Ohtani',
    team: 'LAD',
    opponent: 'SF',
    gameId: 'game-2',
    statType: 'Home Runs',
    line: 0.5,
    overOdds: 120,
    underOdds: -145,
    log: makeLog(105, ['SF', 'SD', 'ARI', 'COL'], 25, 0.5, 0.6, 0.3, 3),
  },
  {
    playerId: 'p-freeman',
    player: 'Freddie Freeman',
    team: 'LAD',
    opponent: 'SF',
    gameId: 'game-2',
    statType: 'Hits',
    line: 1.5,
    overOdds: 105,
    underOdds: -125,
    log: makeLog(106, ['SF', 'SD', 'ARI', 'COL'], 25, 1.4, 0.9, 0.2, 4),
  },
  {
    playerId: 'p-snell',
    player: 'Blake Snell',
    team: 'LAD',
    opponent: 'SF',
    gameId: 'game-2',
    statType: 'Strikeouts (Pitcher)',
    line: 8.5,
    overOdds: 100,
    underOdds: -120,
    log: makeLog(107, ['SF', 'SD', 'ARI', 'COL'], 25, 8.4, 2.2, 0.4, 15),
  },
  {
    playerId: 'p-altuve',
    player: 'Jose Altuve',
    team: 'HOU',
    opponent: 'TEX',
    gameId: 'game-3',
    statType: 'Hits',
    line: 1.5,
    overOdds: 110,
    underOdds: -130,
    log: makeLog(108, ['TEX', 'SEA', 'LAA', 'OAK'], 25, 1.6, 0.9, 0.3, 4),
  },
  {
    playerId: 'p-tucker',
    player: 'Kyle Tucker',
    team: 'HOU',
    opponent: 'TEX',
    gameId: 'game-3',
    statType: 'RBIs',
    line: 0.5,
    overOdds: -125,
    underOdds: 105,
    log: makeLog(109, ['TEX', 'SEA', 'LAA', 'OAK'], 25, 0.8, 0.7, 0.25, 4),
  },
  {
    playerId: 'p-alvarez',
    player: 'Yordan Alvarez',
    team: 'HOU',
    opponent: 'TEX',
    gameId: 'game-3',
    statType: 'Total Bases',
    line: 2.5,
    overOdds: 115,
    underOdds: -135,
    log: makeLog(110, ['TEX', 'SEA', 'LAA', 'OAK'], 25, 2.2, 1.2, 0.2, 6),
  },
  {
    playerId: 'p-suzuki',
    player: 'Seiya Suzuki',
    team: 'CHC',
    opponent: 'MIL',
    gameId: 'game-5',
    statType: 'Total Bases',
    line: 1.5,
    overOdds: -110,
    underOdds: -110,
    log: makeLog(111, ['MIL', 'STL', 'CIN', 'PIT'], 25, 1.7, 1.0, 0.45, 6),
  },
  {
    playerId: 'p-happ',
    player: 'Ian Happ',
    team: 'CHC',
    opponent: 'MIL',
    gameId: 'game-5',
    statType: 'Hits',
    line: 0.5,
    overOdds: -140,
    underOdds: 115,
    log: makeLog(112, ['MIL', 'STL', 'CIN', 'PIT'], 25, 1.1, 0.8, 0.2, 4),
  },
];

// ─── Team Rankings ──────────────────────────────────────────────────────────

export const mockTeamRankings: TeamRanking[] = [
  // AL East
  rank(1, 'NYY', 'New York Yankees', 'AL East', 41, 25, 360, 280, 'W3', '7-3'),
  rank(2, 'BAL', 'Baltimore Orioles', 'AL East', 39, 27, 340, 300, 'L1', '6-4'),
  rank(3, 'BOS', 'Boston Red Sox', 'AL East', 35, 31, 320, 315, 'W1', '5-5'),
  rank(4, 'TB', 'Tampa Bay Rays', 'AL East', 33, 33, 300, 305, 'L2', '4-6'),
  rank(5, 'TOR', 'Toronto Blue Jays', 'AL East', 31, 35, 290, 320, 'L1', '4-6'),
  // AL Central
  rank(1, 'CLE', 'Cleveland Guardians', 'AL Central', 42, 24, 330, 270, 'W4', '8-2'),
  rank(2, 'KC', 'Kansas City Royals', 'AL Central', 38, 28, 325, 290, 'W2', '6-4'),
  rank(3, 'MIN', 'Minnesota Twins', 'AL Central', 36, 30, 315, 300, 'L1', '5-5'),
  rank(4, 'DET', 'Detroit Tigers', 'AL Central', 33, 33, 295, 305, 'W1', '5-5'),
  rank(5, 'CWS', 'Chicago White Sox', 'AL Central', 21, 45, 240, 360, 'L6', '2-8'),
  // AL West
  rank(1, 'HOU', 'Houston Astros', 'AL West', 40, 26, 350, 285, 'W2', '7-3'),
  rank(2, 'SEA', 'Seattle Mariners', 'AL West', 38, 28, 320, 290, 'W1', '6-4'),
  rank(3, 'TEX', 'Texas Rangers', 'AL West', 34, 32, 310, 308, 'L2', '5-5'),
  rank(4, 'LAA', 'Los Angeles Angels', 'AL West', 29, 37, 280, 330, 'L3', '3-7'),
  rank(5, 'OAK', 'Oakland Athletics', 'AL West', 26, 40, 260, 350, 'L1', '4-6'),
  // NL East
  rank(1, 'PHI', 'Philadelphia Phillies', 'NL East', 44, 22, 370, 270, 'W5', '8-2'),
  rank(2, 'ATL', 'Atlanta Braves', 'NL East', 39, 27, 355, 290, 'W1', '6-4'),
  rank(3, 'NYM', 'New York Mets', 'NL East', 34, 32, 315, 310, 'L1', '5-5'),
  rank(4, 'WSH', 'Washington Nationals', 'NL East', 31, 35, 295, 325, 'W2', '5-5'),
  rank(5, 'MIA', 'Miami Marlins', 'NL East', 25, 41, 255, 350, 'L4', '3-7'),
  // NL Central
  rank(1, 'MIL', 'Milwaukee Brewers', 'NL Central', 39, 27, 335, 295, 'W2', '6-4'),
  rank(2, 'STL', 'St. Louis Cardinals', 'NL Central', 36, 30, 320, 305, 'W1', '6-4'),
  rank(3, 'CHC', 'Chicago Cubs', 'NL Central', 35, 31, 318, 308, 'L1', '5-5'),
  rank(4, 'CIN', 'Cincinnati Reds', 'NL Central', 33, 33, 300, 305, 'W1', '5-5'),
  rank(5, 'PIT', 'Pittsburgh Pirates', 'NL Central', 31, 35, 285, 315, 'L2', '4-6'),
  // NL West
  rank(1, 'LAD', 'Los Angeles Dodgers', 'NL West', 45, 21, 385, 265, 'W6', '9-1'),
  rank(2, 'SD', 'San Diego Padres', 'NL West', 38, 28, 330, 295, 'W1', '6-4'),
  rank(3, 'ARI', 'Arizona Diamondbacks', 'NL West', 35, 31, 325, 315, 'L1', '5-5'),
  rank(4, 'SF', 'San Francisco Giants', 'NL West', 33, 33, 305, 308, 'L1', '5-5'),
  rank(5, 'COL', 'Colorado Rockies', 'NL West', 24, 42, 270, 380, 'L5', '2-8'),
];

function rank(
  r: number,
  team: string,
  teamName: string,
  division: string,
  wins: number,
  losses: number,
  runsScored: number,
  runsAllowed: number,
  streak: string,
  lastTen: string
): TeamRanking {
  const pct = (wins / (wins + losses)).toFixed(3).replace(/^0/, '');
  return {
    id: `rank-${team}`,
    rank: r,
    team,
    teamName,
    division,
    wins,
    losses,
    pct,
    gamesBack: r === 1 ? '-' : '',
    runsScored,
    runsAllowed,
    runDiff: runsScored - runsAllowed,
    streak,
    lastTen,
  };
}

// ─── Saved Edges (seed) ─────────────────────────────────────────────────────

export const mockSavedEdgesSeed: SavedEdge[] = [
  {
    id: 'edge-seed-1',
    propId: 'p-judge',
    player: 'Aaron Judge',
    prop: 'Home Runs',
    line: 0.5,
    direction: 'over',
    edge: 12.4,
    confidence: 'high',
    savedAt: new Date().toISOString(),
    notes: 'Wind blowing out at Yankee Stadium',
  },
  {
    id: 'edge-seed-2',
    propId: 'p-cole',
    player: 'Gerrit Cole',
    prop: 'Strikeouts (Pitcher)',
    line: 7.5,
    direction: 'over',
    edge: 6.8,
    confidence: 'medium',
    savedAt: new Date().toISOString(),
  },
];

// ─── Analytics ──────────────────────────────────────────────────────────────

export const mockAnalyticsData: AnalyticsData = {
  cards: [
    {
      id: 'card-1',
      label: 'Games Today',
      value: '15',
      change: '+2 vs yesterday',
      trend: 'up',
      description: 'Total MLB games scheduled today',
    },
    {
      id: 'card-2',
      label: 'Avg Over/Under',
      value: '8.7',
      change: '-0.3 vs season avg',
      trend: 'down',
      description: 'Average total runs line across all games',
    },
    {
      id: 'card-3',
      label: 'High-Edge Props',
      value: '24',
      change: '+6 vs yesterday',
      trend: 'up',
      description: 'Props with edge > 5%',
    },
    {
      id: 'card-4',
      label: 'Weather Alerts',
      value: '3',
      change: 'Wind > 15mph',
      trend: 'neutral',
      description: 'Games with significant weather impact',
    },
  ],
  barrelRate: [
    { name: 'Groundball', pct: 0.38 },
    { name: 'Line Drive', pct: 0.24 },
    { name: 'Fly Ball', pct: 0.29 },
    { name: 'Pop Up', pct: 0.09 },
  ],
  lineMovement: [
    { time: 'Open', over: 7.5, under: 7.5 },
    { time: '8am', over: 7.5, under: 7.5 },
    { time: '10am', over: 8.0, under: 7.5 },
    { time: '12pm', over: 8.0, under: 8.0 },
    { time: '2pm', over: 8.5, under: 8.0 },
    { time: '4pm', over: 8.5, under: 8.5 },
    { time: 'Live', over: 9.0, under: 8.5 },
  ],
  pitcherRadar: [
    { metric: 'K%', value: 32, league: 22 },
    { metric: 'BB%', value: 6, league: 8 },
    { metric: 'Whiff%', value: 31, league: 25 },
    { metric: 'Chase%', value: 34, league: 28 },
    { metric: 'Velo', value: 97, league: 93 },
    { metric: 'GB%', value: 48, league: 43 },
  ],
  wobaTrend: [
    { date: 'Apr', woba: 0.31 },
    { date: 'May', woba: 0.34 },
    { date: 'Jun', woba: 0.36 },
    { date: 'Jul', woba: 0.39 },
    { date: 'Aug', woba: 0.37 },
    { date: 'Sep', woba: 0.4 },
  ],
};
