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
