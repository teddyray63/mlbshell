/**
 * playerProfileData.ts
 * Mock player profile data for dynamic player profile pages.
 * TODO: Replace with real API calls via statcastService / MLB Stats API
 */

export interface PlayerProfile {
  id: string;
  name: string;
  team: string;
  teamFull: string;
  position: string;
  number: string;
  bats: string;
  throws: string;
  age: number;
  height: string;
  weight: string;
  // Season stats
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  hr: number;
  rbi: number;
  sb: number;
  pa: number;
  ab: number;
  hits: number;
  doubles: number;
  triples: number;
  runs: number;
  bb: number;
  so: number;
  // Statcast metrics
  exitVelocityAvg: number;
  barrelRate: number;
  hardHitPct: number;
  woba: number;
  xwoba: number;
  kPct: number;
  bbPct: number;
  launchAngle: number;
  sprintSpeed: number;
  // Pitcher-specific (optional)
  era?: number;
  whip?: number;
  ip?: number;
  strikeouts?: number;
  walks?: number;
  fip?: number;
  xfip?: number;
  spinRate?: number;
}

export interface RecentGame {
  date: string;
  opponent: string;
  result: string;
  ab: number;
  hits: number;
  hr: number;
  rbi: number;
  bb: number;
  so: number;
  avg?: number;
  // Pitcher stats
  ip?: number;
  er?: number;
  k?: number;
  gameResult?: string;
}

export const mockPlayerProfiles: PlayerProfile[] = [
  {
    id: 'prop-1',
    name: 'Placeholder Hitter A',
    team: 'NYY',
    teamFull: 'New York Yankees',
    position: 'OF',
    number: '99',
    bats: 'R',
    throws: 'R',
    age: 28,
    height: '6\'2"',
    weight: '210 lbs',
    avg: 0.287,
    obp: 0.362,
    slg: 0.498,
    ops: 0.860,
    hr: 18,
    rbi: 62,
    sb: 8,
    pa: 312,
    ab: 278,
    hits: 80,
    doubles: 16,
    triples: 2,
    runs: 48,
    bb: 30,
    so: 68,
    exitVelocityAvg: 91.4,
    barrelRate: 11.2,
    hardHitPct: 44.8,
    woba: 0.358,
    xwoba: 0.371,
    kPct: 21.8,
    bbPct: 9.6,
    launchAngle: 14.2,
    sprintSpeed: 27.4,
  },
  {
    id: 'prop-2',
    name: 'Placeholder Pitcher B',
    team: 'LAD',
    teamFull: 'Los Angeles Dodgers',
    position: 'SP',
    number: '22',
    bats: 'L',
    throws: 'L',
    age: 26,
    height: '6\'4"',
    weight: '225 lbs',
    avg: 0.0,
    obp: 0.0,
    slg: 0.0,
    ops: 0.0,
    hr: 0,
    rbi: 0,
    sb: 0,
    pa: 0,
    ab: 0,
    hits: 0,
    doubles: 0,
    triples: 0,
    runs: 0,
    bb: 0,
    so: 0,
    exitVelocityAvg: 88.1,
    barrelRate: 5.4,
    hardHitPct: 32.1,
    woba: 0.0,
    xwoba: 0.0,
    kPct: 0.0,
    bbPct: 0.0,
    launchAngle: 0.0,
    sprintSpeed: 0.0,
    era: 2.84,
    whip: 1.08,
    ip: 82.1,
    strikeouts: 98,
    walks: 22,
    fip: 3.01,
    xfip: 3.14,
    spinRate: 2480,
  },
  {
    id: 'prop-3',
    name: 'Placeholder Hitter C',
    team: 'HOU',
    teamFull: 'Houston Astros',
    position: '3B',
    number: '5',
    bats: 'R',
    throws: 'R',
    age: 30,
    height: '6\'1"',
    weight: '205 lbs',
    avg: 0.261,
    obp: 0.328,
    slg: 0.441,
    ops: 0.769,
    hr: 12,
    rbi: 44,
    sb: 3,
    pa: 288,
    ab: 261,
    hits: 68,
    doubles: 14,
    triples: 1,
    runs: 38,
    bb: 24,
    so: 72,
    exitVelocityAvg: 89.2,
    barrelRate: 8.6,
    hardHitPct: 40.1,
    woba: 0.328,
    xwoba: 0.341,
    kPct: 25.0,
    bbPct: 8.3,
    launchAngle: 12.8,
    sprintSpeed: 26.8,
  },
  {
    id: 'prop-4',
    name: 'Placeholder Hitter D',
    team: 'ATL',
    teamFull: 'Atlanta Braves',
    position: '1B',
    number: '44',
    bats: 'L',
    throws: 'L',
    age: 27,
    height: '6\'3"',
    weight: '230 lbs',
    avg: 0.302,
    obp: 0.388,
    slg: 0.541,
    ops: 0.929,
    hr: 22,
    rbi: 71,
    sb: 2,
    pa: 330,
    ab: 291,
    hits: 88,
    doubles: 20,
    triples: 1,
    runs: 55,
    bb: 36,
    so: 58,
    exitVelocityAvg: 93.1,
    barrelRate: 14.8,
    hardHitPct: 49.2,
    woba: 0.392,
    xwoba: 0.401,
    kPct: 17.6,
    bbPct: 10.9,
    launchAngle: 16.4,
    sprintSpeed: 26.1,
  },
  {
    id: 'prop-5',
    name: 'Placeholder Pitcher E',
    team: 'CHC',
    teamFull: 'Chicago Cubs',
    position: 'SP',
    number: '34',
    bats: 'R',
    throws: 'R',
    age: 29,
    height: '6\'0"',
    weight: '195 lbs',
    avg: 0.0,
    obp: 0.0,
    slg: 0.0,
    ops: 0.0,
    hr: 0,
    rbi: 0,
    sb: 0,
    pa: 0,
    ab: 0,
    hits: 0,
    doubles: 0,
    triples: 0,
    runs: 0,
    bb: 0,
    so: 0,
    exitVelocityAvg: 87.4,
    barrelRate: 6.2,
    hardHitPct: 33.8,
    woba: 0.0,
    xwoba: 0.0,
    kPct: 0.0,
    bbPct: 0.0,
    launchAngle: 0.0,
    sprintSpeed: 0.0,
    era: 3.42,
    whip: 1.18,
    ip: 76.0,
    strikeouts: 82,
    walks: 28,
    fip: 3.68,
    xfip: 3.55,
    spinRate: 2310,
  },
];

export const mockRecentGames: Record<string, RecentGame[]> = {
  'prop-1': [
    { date: 'Jun 1', opponent: 'BOS', result: 'W 5-3', ab: 4, hits: 2, hr: 1, rbi: 2, bb: 0, so: 1 },
    { date: 'May 31', opponent: 'BOS', result: 'L 2-4', ab: 3, hits: 1, hr: 0, rbi: 0, bb: 1, so: 0 },
    { date: 'May 30', opponent: 'TOR', result: 'W 7-2', ab: 4, hits: 2, hr: 0, rbi: 1, bb: 0, so: 2 },
    { date: 'May 28', opponent: 'TOR', result: 'W 4-1', ab: 3, hits: 0, hr: 0, rbi: 0, bb: 1, so: 1 },
    { date: 'May 27', opponent: 'TOR', result: 'L 3-5', ab: 4, hits: 3, hr: 1, rbi: 3, bb: 0, so: 0 },
    { date: 'May 25', opponent: 'BAL', result: 'W 6-4', ab: 4, hits: 1, hr: 0, rbi: 1, bb: 1, so: 2 },
    { date: 'May 24', opponent: 'BAL', result: 'W 3-2', ab: 3, hits: 2, hr: 0, rbi: 0, bb: 1, so: 0 },
  ],
  'prop-2': [
    { date: 'Jun 1', opponent: 'SF', result: 'W 4-1', ab: 0, hits: 0, hr: 0, rbi: 0, bb: 0, so: 0, ip: 7.0, er: 1, k: 9, gameResult: 'W' },
    { date: 'May 26', opponent: 'SD', result: 'L 2-3', ab: 0, hits: 0, hr: 0, rbi: 0, bb: 0, so: 0, ip: 5.2, er: 3, k: 7, gameResult: 'L' },
    { date: 'May 21', opponent: 'COL', result: 'W 8-2', ab: 0, hits: 0, hr: 0, rbi: 0, bb: 0, so: 0, ip: 8.0, er: 2, k: 11, gameResult: 'W' },
    { date: 'May 16', opponent: 'ARI', result: 'W 5-0', ab: 0, hits: 0, hr: 0, rbi: 0, bb: 0, so: 0, ip: 7.1, er: 0, k: 10, gameResult: 'W' },
    { date: 'May 11', opponent: 'NYM', result: 'L 1-4', ab: 0, hits: 0, hr: 0, rbi: 0, bb: 0, so: 0, ip: 4.2, er: 4, k: 5, gameResult: 'L' },
  ],
  'prop-3': [
    { date: 'Jun 1', opponent: 'TEX', result: 'W 3-2', ab: 4, hits: 1, hr: 0, rbi: 1, bb: 0, so: 2 },
    { date: 'May 31', opponent: 'TEX', result: 'L 1-5', ab: 3, hits: 0, hr: 0, rbi: 0, bb: 1, so: 1 },
    { date: 'May 29', opponent: 'OAK', result: 'W 6-3', ab: 4, hits: 2, hr: 1, rbi: 2, bb: 0, so: 1 },
    { date: 'May 28', opponent: 'OAK', result: 'W 4-0', ab: 3, hits: 1, hr: 0, rbi: 0, bb: 1, so: 0 },
    { date: 'May 26', opponent: 'SEA', result: 'L 2-4', ab: 4, hits: 0, hr: 0, rbi: 0, bb: 0, so: 3 },
    { date: 'May 25', opponent: 'SEA', result: 'W 5-2', ab: 3, hits: 2, hr: 0, rbi: 1, bb: 1, so: 0 },
    { date: 'May 24', opponent: 'SEA', result: 'W 7-1', ab: 4, hits: 3, hr: 1, rbi: 3, bb: 0, so: 0 },
  ],
  'prop-4': [
    { date: 'Jun 1', opponent: 'PHI', result: 'W 5-3', ab: 4, hits: 2, hr: 1, rbi: 2, bb: 1, so: 0 },
    { date: 'May 31', opponent: 'PHI', result: 'W 4-2', ab: 3, hits: 1, hr: 0, rbi: 1, bb: 1, so: 1 },
    { date: 'May 29', opponent: 'MIA', result: 'W 8-1', ab: 4, hits: 3, hr: 2, rbi: 4, bb: 0, so: 0 },
    { date: 'May 28', opponent: 'MIA', result: 'L 3-5', ab: 4, hits: 1, hr: 0, rbi: 0, bb: 0, so: 2 },
    { date: 'May 26', opponent: 'WSH', result: 'W 6-2', ab: 3, hits: 2, hr: 1, rbi: 2, bb: 1, so: 0 },
    { date: 'May 25', opponent: 'WSH', result: 'W 4-1', ab: 4, hits: 2, hr: 0, rbi: 1, bb: 0, so: 1 },
    { date: 'May 24', opponent: 'WSH', result: 'W 9-3', ab: 4, hits: 3, hr: 1, rbi: 3, bb: 1, so: 0 },
  ],
  'prop-5': [
    { date: 'Jun 1', opponent: 'MIL', result: 'L 2-4', ab: 0, hits: 0, hr: 0, rbi: 0, bb: 0, so: 0, ip: 5.1, er: 4, k: 6, gameResult: 'L' },
    { date: 'May 27', opponent: 'STL', result: 'W 3-1', ab: 0, hits: 0, hr: 0, rbi: 0, bb: 0, so: 0, ip: 6.2, er: 1, k: 8, gameResult: 'W' },
    { date: 'May 22', opponent: 'CIN', result: 'W 5-2', ab: 0, hits: 0, hr: 0, rbi: 0, bb: 0, so: 0, ip: 7.0, er: 2, k: 9, gameResult: 'W' },
    { date: 'May 17', opponent: 'PIT', result: 'L 1-3', ab: 0, hits: 0, hr: 0, rbi: 0, bb: 0, so: 0, ip: 5.0, er: 3, k: 5, gameResult: 'L' },
    { date: 'May 12', opponent: 'MIL', result: 'W 4-0', ab: 0, hits: 0, hr: 0, rbi: 0, bb: 0, so: 0, ip: 8.0, er: 0, k: 10, gameResult: 'W' },
  ],
};
