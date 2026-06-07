/**
 * Shared Types — MLB Analytics Shell
 *
 * TODO: migrate shared type definitions from existing Vite app
 * TODO: align these interfaces with your existing API response shapes
 *
 * These types are shared between /client and /server.
 * Place backend-specific types in /server/types/
 * Place frontend-specific types in /client/src/types/
 */

import type { ConfidenceLevel } from '../constants';

// ─── Game ─────────────────────────────────────────────────────────────────────

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  gameTime: string;
  venue: string;
  status: 'scheduled' | 'live' | 'final' | 'postponed';
  inning?: string;
  homeOdds?: number;
  awayOdds?: number;
  overUnder?: number;
}

// ─── Player ───────────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  bats?: 'L' | 'R' | 'S';
  throws?: 'L' | 'R';
}

// ─── Player Prop ──────────────────────────────────────────────────────────────

export interface PlayerProp {
  id: string;
  playerId: string;
  player: string;
  team: string;
  opponent: string;
  gameId: string;
  prop: string;
  line: number;
  overOdds: number;
  underOdds: number;
  projection?: number;
  edge?: number;
  hitRate?: number;
  sampleSize?: number;
  // Statcast enrichment (Baseball Savant)
  handedness?: 'L' | 'R' | 'S';
  exitVelo?: number;
  barrelPct?: number;
  hardHitPct?: number;
  xwoba?: number;
  whiffPct?: number;
  l5PaPerG?: number;
  nearHr?: number;
  hrFbPct?: number;
  pulledAirPct?: number;
  hitRateHits?: number;
  hitRateGames?: number;
  edgeVsRHP?: number;
  edgeVsLHP?: number;
  parkFactor?: number;
}

// ─── Statcast ─────────────────────────────────────────────────────────────────

/** Batter Statcast metrics (Baseball Savant leaderboards). */
export interface BatterStatcast {
  playerId: string;
  name?: string;
  year: number;
  pa?: number;
  ba?: number;
  slg?: number;
  woba?: number;
  xwoba?: number;
  xba?: number;
  xslg?: number;
  exitVelo?: number;
  barrelPct?: number;
  hardHitPct?: number;
  launchAngle?: number;
  kPct?: number;
  bbPct?: number;
}

/** Pitcher Statcast / season metrics. */
export interface PitcherStatcast {
  playerId: string;
  name?: string;
  year: number;
  ip?: number;
  bf?: number;
  baa?: number;
  woba?: number;
  slg?: number;
  iso?: number;
  whip?: number;
  hr?: number;
  hr9?: number;
  bbPct?: number;
  whiffPct?: number;
  kPct?: number;
  putawayPct?: number;
  swstrPct?: number;
  k9?: number;
  firstPitchStrikePct?: number;
}

/** A single split row (Season / vsLHB / vsRHB) for a pitcher table. */
export interface PitcherSplit extends PitcherStatcast {
  split: 'Season' | 'vsLHB' | 'vsRHB';
}

/** One pitch type in a pitcher's arsenal. */
export interface PitchArsenalEntry {
  pitchType: string;
  pitchName: string;
  count?: number;
  usagePct?: number;
  bbe?: number;
  ba?: number;
  woba?: number;
  slg?: number;
  iso?: number;
  hr?: number;
  bbPct?: number;
  whiffPct?: number;
  kPct?: number;
  putawayPct?: number;
  swstrPct?: number;
  velo?: number;
  exitVelo?: number;
  launchAngle?: number;
  hardHitPct?: number;
}

/** Park factor rating for a venue. */
export interface ParkFactor {
  venue: string;
  parkFactor: number;
  hrFactor: number;
  runsFactor: number;
  hrRateL3: number[];
}

/** A batter row in the matchup engine table. */
export interface MatchupBatter {
  playerId: string;
  name: string;
  team: string;
  handedness: 'L' | 'R' | 'S';
  battingOrder?: number;
  odds?: number;
  pa?: number;
  l5PaPerG?: number;
  hr?: number;
  nearHr?: number;
  ba?: number;
  obp?: number;
  slg?: number;
  iso?: number;
  woba?: number;
  bbPct?: number;
  whiffPct?: number;
  kPct?: number;
  swstrPct?: number;
}

/** Full matchup payload for a single game. */
export interface MatchupGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  gameTime: string;
  overUnder?: number;
  overUnderOverOdds?: number;
  overUnderUnderOdds?: number;
  lineupConfirmed: boolean;
  // Betting market (propfinder-style game header)
  homeMoneyline?: number;
  awayMoneyline?: number;
  homeRunLine?: number;
  homeRunLineOdds?: number;
  awayRunLine?: number;
  awayRunLineOdds?: number;
  homeRecord?: string;
  awayRecord?: string;
  weather: WeatherCondition | null;
  parkFactor: ParkFactor | null;
  pitchers: MatchupPitcher[];
  batters: MatchupBatter[];
}

export interface MatchupPitcher {
  playerId: string;
  name: string;
  team: string;
  throws: 'L' | 'R';
  hrRiskVsLHB?: 'high' | 'medium' | 'low';
  hrRiskVsRHB?: 'high' | 'medium' | 'low';
  splits: PitcherSplit[];
  arsenal: PitchArsenalEntry[];
}

// ─── Weather ──────────────────────────────────────────────────────────────────

export interface WeatherCondition {
  id: string;
  venue: string;
  city: string;
  gameId: string;
  temp: number;
  feelsLike: number;
  windSpeed: number;
  windDir: string;
  humidity: number;
  condition: string;
  precipitation: number;
  parkFactor: number;
  windImpact: 'boost' | 'suppress' | 'neutral';
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsCard {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description?: string;
}

// ─── Team Ranking ─────────────────────────────────────────────────────────────

export interface TeamRanking {
  id: string;
  rank: number;
  team: string;
  teamName: string;
  division: string;
  wins: number;
  losses: number;
  pct: string;
  gamesBack: string;
  runsScored: number;
  runsAllowed: number;
  runDiff: number;
  streak?: string;
  lastTen?: string;
}

// ─── Prop Calculation ─────────────────────────────────────────────────────────

export interface PropCalculation {
  playerId: string;
  statType: string;
  historicalAvg: number;
  projectedValue: number;
  edge: number;
  confidence: ConfidenceLevel;
  sampleSize: number;
  modelVersion: string;
  // Extended fields surfaced in the UI (Prop Analyzer deep-dive, cheatsheet)
  player?: string;
  team?: string;
  opponent?: string;
  gameId?: string;
  line?: number;
  hitRate?: number;
  ev?: number;
  weightedAvg?: number;
  parkAdjustment?: number;
  direction?: 'over' | 'under';
  overOdds?: number;
  underOdds?: number;
  gameLog?: GameLogEntry[];
  // Statcast enrichment + per-split breakdown (Prop Analyzer deep-dive)
  handedness?: 'L' | 'R' | 'S';
  position?: string;
  statcast?: BatterStatcast;
  splitRows?: BatterSplitRow[];
  pitchVulnerability?: PitchVulnerability[];
  // Flat Statcast fields (player-props table columns, set by enrichCalculation)
  exitVelo?: number;
  barrelPct?: number;
  hardHitPct?: number;
  xwoba?: number;
  whiffPct?: number;
  edgeVsRHP?: number;
  edgeVsLHP?: number;
  parkFactor?: number;
  // Extended prop-board / analyzer columns (propfinder / doinksports parity)
  l5PaPerG?: number;
  nearHr?: number;
  hrFbPct?: number;
  pulledAirPct?: number;
  /** Hits (value ≥ line) within the last 10 logged games — numerator for the "7/10" fraction. */
  hitRateHits?: number;
  /** Denominator (logged games considered, ≤10) for the hit-rate fraction. */
  hitRateGames?: number;
  opposingPitcher?: string;
  batterVsPitcher?: BatterVsPitcher;
  pitcherPanel?: PitcherPanelSplit[];
  bestLines?: BestLine[];
}

/** Historical batter-vs-pitcher head-to-head (MLB Stats API vsPlayer split). */
export interface BatterVsPitcher {
  pitcher: string;
  sinceYear: number;
  ab: number;
  h: number;
  hr: number;
  avg: number;
  slg: number;
  kPct: number;
  brlPct: number;
}

/** One split row in the Prop Analyzer pitcher panel ('26 Season / Home / Away / vsRHB / vsLHB). */
export interface PitcherPanelSplit {
  split: string;
  era: number;
  whip: number;
  oba: number;
  kPct: number;
  k9: number;
  hr9: number;
  brlPct: number;
}

/** A sportsbook line for the best-lines strip. */
export interface BestLine {
  book: string;
  line: number;
  overOdds: number;
  underOdds: number;
}

/** A pitcher row on the HR Targets page (gameday-insights Homerun Targets). */
export interface HRTargetPitcher {
  playerId: string;
  name: string;
  team: string;
  opp: string;
  gameTime: string;
  throws: 'L' | 'R';
  abs: number;
  hr: number;
  absPerHr: number;
  hr9: number;
  barrelPct: number;
  hardHitPct: number;
  hrFbPct: number;
  flyBallPct: number;
  pulledAirPct: number;
}

/** Season-stat row for the Player Deep Dive page (moonshots player page). */
export interface PitcherSeasonStats {
  season: string;
  g: number;
  gs: number;
  w: number;
  l: number;
  ip: number;
  r: number;
  er: number;
  h: number;
  k: number;
  bb: number;
  hr: number;
  era: number;
  h9: number;
  k9: number;
  bb9: number;
  hr9: number;
}

/** Advanced-split row (vs L / vs R / Total / % Rank) for the Player Deep Dive page. */
export interface PitcherAdvancedSplit {
  split: string;
  ip?: number;
  kPct: number;
  bbPct: number;
  woba: number;
  xwoba: number;
  iso: number;
  barPerPa: number;
  barPerBbe: number;
  babip: number;
  gbPct: number;
  ldPct: number;
  fbPct: number;
  puPct: number;
  hard95Pct: number;
  aev: number;
  ala: number;
  hrFb: number;
}

/** Game-log row for the Player Deep Dive page. */
export interface PitcherGameLogRow {
  date: string;
  opp: string;
  home: boolean;
  started: boolean;
  dkPts: number;
  pitchCount: number;
  ip: number;
  r: number;
  er: number;
  h: number;
  bb: number;
  k: number;
  hr: number;
  velo: number;
  swstrPct: number;
  whiffPct: number;
  woba: number;
  xwoba: number;
  iso: number;
}

/** Full Player Deep Dive payload. */
export interface PitcherDeepDive {
  playerId: string;
  name: string;
  team: string;
  throws: 'L' | 'R';
  season: PitcherSeasonStats[];
  advancedSplits: PitcherAdvancedSplit[];
  gameLog: PitcherGameLogRow[];
}

/** One row in the Prop Analyzer stat breakdown table (Season / Last N / vs pitcher). */
export interface BatterSplitRow {
  split: string;
  avg?: number;
  woba?: number;
  xwoba?: number;
  slg?: number;
  exitVelo?: number;
  barrelPct?: number;
  hardHitPct?: number;
  launchAngle?: number;
  kPct?: number;
  bbPct?: number;
}

/** How a batter fares against a given pitch type. */
export interface PitchVulnerability {
  pitchType: string;
  whiffPct: number;
  woba: number;
  verdict: 'struggles' | 'succeeds' | 'neutral';
}

export interface GameLogEntry {
  date: string;
  opponent: string;
  value: number;
  line?: number;
  hit?: boolean;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  cards: AnalyticsCard[];
  barrelRate: { name: string; pct: number }[];
  lineMovement: { time: string; over: number; under: number }[];
  pitcherRadar: { metric: string; value: number; league: number }[];
  wobaTrend: { date: string; woba: number }[];
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

/** Public user shape returned to the client (never includes passwordHash). */
export type PublicUser = Omit<User, 'passwordHash'>;

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// ─── Saved Edge ───────────────────────────────────────────────────────────────

export interface SavedEdge {
  id: string;
  propId: string;
  player: string;
  prop: string;
  line: number;
  direction: 'over' | 'under';
  edge: number;
  confidence: 'high' | 'medium' | 'low';
  savedAt: string;
  notes?: string;
}
