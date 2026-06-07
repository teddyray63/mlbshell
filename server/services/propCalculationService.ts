/**
 * propCalculationService — server-side wrapper around the shared prop engine.
 *
 * calculateProps(players, games, weather) returns PropCalculation[] sorted by
 * edge% descending. Results are memoized per player + stat + date so repeated
 * requests within the same day don't recompute.
 */

import { calculatePlayerProp, type PlayerPropInput } from '../../shared/propMath';
import type { Game, WeatherCondition, PropCalculation } from '../../shared/types';

const memo = new Map<string, PropCalculation>();

export function clearPropMemo(): void {
  memo.clear();
}

export function calculateProps(
  players: PlayerPropInput[],
  games: Game[],
  weather: WeatherCondition[],
  asOf: Date = new Date()
): PropCalculation[] {
  void games; // reserved for venue/date enrichment

  const windImpactByGame: Record<string, WeatherCondition['windImpact']> = {};
  for (const wx of weather) windImpactByGame[wx.gameId] = wx.windImpact;

  const dateKey = asOf.toISOString().slice(0, 10);

  const results = players.map((p) => {
    const key = `${p.playerId}:${p.statType}:${dateKey}`;
    const cached = memo.get(key);
    if (cached) return cached;
    const calc = calculatePlayerProp(p, windImpactByGame, asOf);
    memo.set(key, calc);
    return calc;
  });

  return results.sort((a, b) => b.edge - a.edge);
}

export default calculateProps;
