/**
 * propMath — pure, framework-free prop-betting calculations.
 *
 * Lives in /shared so it can be consumed by BOTH the Next.js client
 * (src/api/adapters/mock.js) and the Express backend
 * (server/services/propCalculationService.ts) without violating the
 * src/ ↔ server/ isolation rule. All formulas are defined here exactly once.
 */

import type { Game, GameLogEntry, PropCalculation, WeatherCondition } from './types';
import type { ConfidenceLevel } from './constants';

export const MODEL_VERSION = 'v1.0.0';

/** Props whose projection is boosted/suppressed by wind. */
export const POWER_PROPS = ['Home Runs', 'Total Bases'];

export function isPowerProp(prop: string): boolean {
  return POWER_PROPS.includes(prop);
}

// ─── Inputs ─────────────────────────────────────────────────────────────────

export interface GameStatLog {
  date: string; // ISO date string
  opponent: string;
  value: number; // the player's stat value in that game
}

export interface PlayerPropInput {
  playerId: string;
  player: string;
  team: string;
  opponent: string;
  gameId: string;
  statType: string; // prop type, e.g. "Hits"
  line: number;
  overOdds: number;
  underOdds: number;
  log: GameStatLog[]; // game-by-game history (any order)
}

// ─── Atomic formulas ────────────────────────────────────────────────────────

/** Hit Rate: hits (value ≥ line) in last 10 games / 10. */
export function calcHitRate(log: GameStatLog[], line: number): number {
  const last10 = [...log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  if (last10.length === 0) return 0;
  const hits = last10.filter((g) => g.value >= line).length;
  return hits / 10;
}

/**
 * Projection: weighted average over the last 30 days where games within the
 * most recent 15-day half are weighted 2× versus older games.
 */
export function calcProjection(log: GameStatLog[], asOf: Date): number {
  const cutoff30 = new Date(asOf.getTime() - 30 * 24 * 60 * 60 * 1000);
  const cutoff15 = new Date(asOf.getTime() - 15 * 24 * 60 * 60 * 1000);
  const window = log.filter((g) => new Date(g.date) >= cutoff30);
  if (window.length === 0) {
    return log.length ? log.reduce((s, g) => s + g.value, 0) / log.length : 0;
  }
  let weightedSum = 0;
  let weightTotal = 0;
  for (const g of window) {
    const weight = new Date(g.date) >= cutoff15 ? 2 : 1;
    weightedSum += g.value * weight;
    weightTotal += weight;
  }
  return weightTotal === 0 ? 0 : weightedSum / weightTotal;
}

/** Edge%: ((projection - line) / line) * 100. */
export function calcEdge(projection: number, line: number): number {
  if (line === 0) return 0;
  return ((projection - line) / line) * 100;
}

/** Confidence tier from sample size and absolute edge. */
export function calcConfidence(sampleSize: number, edge: number): ConfidenceLevel {
  const absEdge = Math.abs(edge);
  if (sampleSize > 20 && absEdge > 7) return 'high';
  if (sampleSize > 10 && absEdge > 4) return 'medium';
  return 'low';
}

/**
 * Expected Value.
 * oddsDecimal = 100/|odds| when odds are negative, or odds/100 + 1 when positive.
 * EV = (hitRate * oddsDecimal) - (1 - hitRate)
 */
export function americanToDecimal(americanOdds: number): number {
  if (americanOdds < 0) return 100 / Math.abs(americanOdds);
  return americanOdds / 100 + 1;
}

export function calcEV(hitRate: number, americanOdds: number): number {
  const oddsDecimal = americanToDecimal(americanOdds);
  return hitRate * oddsDecimal - (1 - hitRate);
}

/** Park/Weather adjustment factor for power props. */
export function parkAdjustmentFactor(
  prop: string,
  windImpact: WeatherCondition['windImpact'] | undefined
): number {
  if (!isPowerProp(prop)) return 1;
  if (windImpact === 'boost') return 1.08;
  if (windImpact === 'suppress') return 0.93;
  return 1;
}

// ─── Orchestration ──────────────────────────────────────────────────────────

function toGameLog(log: GameStatLog[], line: number): GameLogEntry[] {
  return [...log]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
    .map((g) => ({
      date: g.date,
      opponent: g.opponent,
      value: g.value,
      line,
      hit: g.value >= line,
    }));
}

/**
 * Build a full PropCalculation for a single player prop input.
 */
export function calculatePlayerProp(
  input: PlayerPropInput,
  windImpactByGame: Record<string, WeatherCondition['windImpact']>,
  asOf: Date,
  gameById?: Record<string, Game>
): PropCalculation {
  const { log, line, statType } = input;

  const hitRate = calcHitRate(log, line);
  const rawProjection = calcProjection(log, asOf);
  const windImpact = windImpactByGame[input.gameId];
  const adjustment = parkAdjustmentFactor(statType, windImpact);
  const projectedValue = rawProjection * adjustment;

  const window30 = log.filter(
    (g) => new Date(g.date) >= new Date(asOf.getTime() - 30 * 24 * 60 * 60 * 1000)
  );
  const sampleSize = window30.length || log.length;
  const historicalAvg = log.length ? log.reduce((s, g) => s + g.value, 0) / log.length : 0;

  const edge = calcEdge(projectedValue, line);
  const direction: 'over' | 'under' = edge >= 0 ? 'over' : 'under';
  const odds = direction === 'over' ? input.overOdds : input.underOdds;
  const directionHitRate = direction === 'over' ? hitRate : 1 - hitRate;
  const ev = calcEV(directionHitRate, odds);
  const confidence = calcConfidence(sampleSize, edge);

  const game = gameById?.[input.gameId];

  return {
    playerId: input.playerId,
    statType,
    historicalAvg: round(historicalAvg, 3),
    projectedValue: round(projectedValue, 3),
    edge: round(edge, 1),
    confidence,
    sampleSize,
    modelVersion: MODEL_VERSION,
    player: input.player,
    team: input.team,
    opponent: input.opponent,
    gameId: input.gameId,
    gameTime: game?.gameTime,
    homeTeam: game?.homeTeam,
    awayTeam: game?.awayTeam,
    line,
    hitRate: round(hitRate, 3),
    ev: round(ev, 3),
    weightedAvg: round(rawProjection, 3),
    parkAdjustment: adjustment,
    direction,
    overOdds: input.overOdds,
    underOdds: input.underOdds,
    gameLog: toGameLog(log, line),
  };
}

/**
 * calculateProps core: returns PropCalculation[] sorted by edge% descending.
 * Shared by the server's propCalculationService and the client mock adapter.
 */
export function buildPropCalculations(
  players: PlayerPropInput[],
  games: Game[],
  weather: WeatherCondition[],
  asOf: Date = new Date()
): PropCalculation[] {
  const windImpactByGame: Record<string, WeatherCondition['windImpact']> = {};
  for (const wx of weather) windImpactByGame[wx.gameId] = wx.windImpact;
  const gameById: Record<string, Game> = {};
  for (const g of games) gameById[g.id] = g;

  return players
    .map((p) => calculatePlayerProp(p, windImpactByGame, asOf, gameById))
    .sort((a, b) => b.edge - a.edge);
}

function round(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
