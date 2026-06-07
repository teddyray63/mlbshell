/**
 * MLB Stats API adapters — normalize raw statsapi.mlb.com responses into the
 * shared/types shapes the rest of the app consumes.
 */

import type { Game } from '../../shared/types';
import type { GameStatLog } from '../../shared/propMath';

type Json = Record<string, unknown>;

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}
function num(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

function mapStatus(abstract: string): Game['status'] {
  switch (abstract) {
    case 'Live':
      return 'live';
    case 'Final':
      return 'final';
    case 'Preview':
      return 'scheduled';
    default:
      return 'scheduled';
  }
}

/**
 * Normalize the MLB `schedule` endpoint response into Game[].
 * Shape: { dates: [ { games: [ ... ] } ] }
 */
export function normalizeSchedule(raw: Json): Game[] {
  const dates = Array.isArray(raw?.dates) ? (raw.dates as Json[]) : [];
  const games: Game[] = [];
  for (const date of dates) {
    const dayGames = Array.isArray(date?.games) ? (date.games as Json[]) : [];
    for (const g of dayGames) {
      const teams = (g?.teams as Json) || {};
      const home = (teams?.home as Json) || {};
      const away = (teams?.away as Json) || {};
      const homeTeam = (home?.team as Json) || {};
      const awayTeam = (away?.team as Json) || {};
      const status = (g?.status as Json) || {};
      const venue = (g?.venue as Json) || {};
      const gameDate = str(g?.gameDate);

      games.push({
        id: String(g?.gamePk ?? ''),
        homeTeam: str(homeTeam?.abbreviation, str(homeTeam?.name, 'TBD')),
        awayTeam: str(awayTeam?.abbreviation, str(awayTeam?.name, 'TBD')),
        homeScore: num(home?.score),
        awayScore: num(away?.score),
        date: gameDate.slice(0, 10),
        gameTime: gameDate,
        venue: str(venue?.name, 'Unknown Venue'),
        status: mapStatus(str(status?.abstractGameState, 'Preview')),
      });
    }
  }
  return games;
}

/**
 * Normalize a MLB `people/{id}/stats?stats=gameLog` response into GameStatLog[]
 * for the given stat key (e.g. "hits", "homeRuns", "totalBases").
 * Shape: { stats: [ { splits: [ { date, opponent:{abbreviation}, stat:{...} } ] } ] }
 */
export function normalizeGameLog(raw: Json, statKey: string): GameStatLog[] {
  const stats = Array.isArray(raw?.stats) ? (raw.stats as Json[]) : [];
  const splits = stats.length && Array.isArray(stats[0]?.splits) ? (stats[0].splits as Json[]) : [];
  return splits.map((s) => {
    const opp = (s?.opponent as Json) || {};
    const stat = (s?.stat as Json) || {};
    return {
      date: str(s?.date),
      opponent: str(opp?.abbreviation, str(opp?.name, 'OPP')),
      value: num(stat?.[statKey]) ?? 0,
    };
  });
}
