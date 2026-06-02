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

// ─── Game ─────────────────────────────────────────────────────────────────────

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
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
