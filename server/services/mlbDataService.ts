/**
 * MLB Data Service — fetches live data from the public MLB Stats API
 * (statsapi.mlb.com) and normalizes it into shared/types shapes.
 *
 * All outbound calls go through the TTL cache (schedule 30min, stats 15min).
 */

import type { Game } from '../../shared/types';
import type { GameStatLog } from '../../shared/propMath';
import { cache, TTL } from '../cache';
import { normalizeSchedule, normalizeGameLog } from '../adapters';

const MLB_API_BASE = process.env.MLB_API_BASE || 'https://statsapi.mlb.com/api/v1';

type Json = Record<string, unknown>;

async function getJson(url: string): Promise<Json> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`MLB Stats API ${res.status} ${res.statusText} — ${url}`);
  }
  return (await res.json()) as Json;
}

export const mlbDataService = {
  /** Game schedule for a given date (YYYY-MM-DD). Cached for 30 minutes. */
  async getSchedule(date: string): Promise<Game[]> {
    const day = date || new Date().toISOString().slice(0, 10);
    return cache.wrap(`schedule:${day}`, TTL.schedule, async () => {
      const url = `${MLB_API_BASE}/schedule?sportId=1&date=${day}&hydrate=team,venue,linescore`;
      const raw = await getJson(url);
      return normalizeSchedule(raw);
    });
  },

  /**
   * Per-game stat log for a player. Cached for 15 minutes.
   * statKey is an MLB stat field, e.g. "hits", "homeRuns", "totalBases".
   */
  async getPlayerStats(playerId: string, statKey = 'hits'): Promise<GameStatLog[]> {
    return cache.wrap(`stats:${playerId}:${statKey}`, TTL.stats, async () => {
      const url = `${MLB_API_BASE}/people/${playerId}/stats?stats=gameLog&group=hitting`;
      const raw = await getJson(url);
      return normalizeGameLog(raw, statKey);
    });
  },

  /**
   * Odds are not available from the MLB Stats API.
   * TODO: integrate a paid odds provider once an ODDS_API_KEY is configured.
   */
  async getOdds(_gameId: string): Promise<null> {
    return null;
  },
};

export default mlbDataService;
