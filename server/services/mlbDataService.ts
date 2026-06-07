/**
 * MLB Data Service — fetches live data from the public MLB Stats API
 * (statsapi.mlb.com) and normalizes it into shared/types shapes.
 *
 * All outbound calls go through the TTL cache (schedule 30min, lineups 15min,
 * stats 15min, hitting 30min, pitcherSplits 30min, standings 60min).
 */

import type {
  Game,
  MatchupBatter,
  MatchupGame,
  MatchupPitcher,
  PitcherSplit,
  WeatherCondition,
} from '../../shared/types';
import type { GameStatLog } from '../../shared/propMath';
import { cache, TTL } from '../cache';
import { normalizeSchedule, normalizeGameLog } from '../adapters';
import { statcastService, currentSeason } from './statcastService';

const MLB_API_BASE = process.env.MLB_API_BASE || 'https://statsapi.mlb.com/api/v1';

type Json = Record<string, unknown>;

async function getJson(url: string): Promise<Json> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`MLB Stats API ${res.status} ${res.statusText} — ${url}`);
  }
  return (await res.json()) as Json;
}

function asArray(v: unknown): Json[] {
  return Array.isArray(v) ? (v as Json[]) : [];
}
function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : fallback;
}
function num(v: unknown): number | undefined {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v !== '') {
    const x = Number(v);
    return Number.isFinite(x) ? x : undefined;
  }
  return undefined;
}
function round(v: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}

/** Map a windImpact heuristic from temp/wind/condition. */
function deriveWindImpact(
  temp: number,
  windSpeed: number,
  condition: string
): WeatherCondition['windImpact'] {
  const c = condition.toLowerCase();
  if (c.includes('roof') || c.includes('dome')) return 'neutral';
  if (windSpeed >= 10 && temp >= 75) return 'boost';
  if (windSpeed >= 12) return 'suppress';
  return 'neutral';
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
   * Schedule hydrated with weather, probable pitchers and lineups.
   * Cached for 15 minutes (lineups change as cards are confirmed).
   */
  async getGameWithLineups(date: string): Promise<Json[]> {
    const day = date || new Date().toISOString().slice(0, 10);
    return cache.wrap(`lineups:${day}`, TTL.lineups, async () => {
      const url = `${MLB_API_BASE}/schedule?sportId=1&date=${day}&hydrate=weather,probablePitcher,lineups,venue,team`;
      const raw = await getJson(url);
      const dates = asArray(raw?.dates);
      return dates.length ? asArray(dates[0]?.games) : [];
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

  /** Season hitting stat line for a batter. Cached 30 minutes. */
  async getSeasonHitting(playerId: string, year = currentSeason()): Promise<Json | null> {
    return cache.wrap(`hitting:${playerId}:${year}`, TTL.hitting, async () => {
      const url = `${MLB_API_BASE}/people/${playerId}/stats?stats=season&group=hitting&season=${year}`;
      const raw = await getJson(url);
      const splits = asArray(asArray(raw?.stats)[0]?.splits);
      return splits.length ? (splits[0].stat as Json) : null;
    });
  },

  /**
   * Pitcher Season / vsLHB / vsRHB splits. Cached 30 minutes.
   * statSplits provides BF, BAA, WHIP, HR, K, BB, IP — we derive the rate stats;
   * wOBA/WHIFF% are augmented from Savant arsenal aggregates where available.
   */
  async getPitcherSplits(pitcherId: string, year = currentSeason()): Promise<PitcherSplit[]> {
    return cache.wrap(`pitcherSplits:${pitcherId}:${year}`, TTL.pitcherSplits, async () => {
      const url = `${MLB_API_BASE}/people/${pitcherId}/stats?stats=season,statSplits&group=pitching&sitCodes=vl,vr&season=${year}`;
      const raw = await getJson(url);
      const statsBlocks = asArray(raw?.stats);

      const seasonBlock = statsBlocks.find((b) => (b?.type as Json)?.displayName === 'season');
      const splitBlock = statsBlocks.find((b) => (b?.type as Json)?.displayName === 'statSplits');

      const rows: PitcherSplit[] = [];

      const seasonSplit = asArray(seasonBlock?.splits)[0];
      if (seasonSplit)
        rows.push(toPitcherSplit('Season', seasonSplit.stat as Json, year, pitcherId));

      for (const sp of asArray(splitBlock?.splits)) {
        const code = (sp?.split as Json)?.code;
        if (code === 'vl') rows.push(toPitcherSplit('vsLHB', sp.stat as Json, year, pitcherId));
        if (code === 'vr') rows.push(toPitcherSplit('vsRHB', sp.stat as Json, year, pitcherId));
      }

      // Augment season-level wOBA / WHIFF% / putaway from Savant arsenal.
      try {
        const sc = await statcastService.getPitcherStatcast(pitcherId, year);
        for (const r of rows) {
          if (r.woba == null) r.woba = sc.woba;
          if (r.whiffPct == null) r.whiffPct = sc.whiffPct;
        }
      } catch {
        /* Savant augmentation is best-effort */
      }

      return rows;
    });
  },

  /** Pitch arsenal (delegates to Savant). */
  async getPitchArsenal(pitcherId: string, year = currentSeason()) {
    return statcastService.getPitchArsenal(pitcherId, year);
  },

  /**
   * Head-to-head batter vs pitcher line (career). Cached with the stats TTL.
   */
  async getBatterVsPitcher(batterId: string, pitcherId: string): Promise<Json | null> {
    return cache.wrap(`bvp:${batterId}:${pitcherId}`, TTL.stats, async () => {
      const url = `${MLB_API_BASE}/people/${batterId}/stats?stats=vsPlayer&group=hitting&opposingPlayerId=${pitcherId}`;
      const raw = await getJson(url);
      const splits = asArray(asArray(raw?.stats)[0]?.splits);
      return splits.length ? (splits[splits.length - 1].stat as Json) : null;
    });
  },

  /**
   * Full matchup payload for one game: pitchers (with splits + arsenal), the
   * batting lineups (with Statcast enrichment), weather and park factor.
   */
  async getMatchup(gameId: string, date?: string): Promise<MatchupGame | null> {
    const day = date || new Date().toISOString().slice(0, 10);
    const games = await this.getGameWithLineups(day);
    const game = games.find((g) => String(g?.gamePk) === String(gameId));
    if (!game) return null;

    const teams = (game?.teams as Json) || {};
    const home = (teams?.home as Json) || {};
    const away = (teams?.away as Json) || {};
    const homeTeam = (home?.team as Json) || {};
    const awayTeam = (away?.team as Json) || {};
    const venueName = str((game?.venue as Json)?.name, 'Unknown Venue');
    const weatherRaw = (game?.weather as Json) || {};
    const lineups = (game?.lineups as Json) || {};

    const temp = num(weatherRaw?.temp) ?? 0;
    const windField = str(weatherRaw?.wind, '0 mph');
    const windSpeed = num(windField.split(' ')[0]) ?? 0;
    const condition = str(weatherRaw?.condition, 'Clear');
    const homeAbbr = str(homeTeam?.abbreviation, 'HOME');
    const awayAbbr = str(awayTeam?.abbreviation, 'AWAY');

    const parkFactor = await statcastService.getParkFactors(venueName);

    const weather: WeatherCondition | null = Object.keys(weatherRaw).length
      ? {
          id: `wx-${gameId}`,
          venue: venueName,
          city: venueName,
          gameId: String(gameId),
          temp,
          feelsLike: temp,
          windSpeed,
          windDir: windField.split(',')[1]?.trim() || 'None',
          humidity: 0,
          condition,
          precipitation: 0,
          parkFactor: parkFactor?.parkFactor ?? 100,
          windImpact: deriveWindImpact(temp, windSpeed, condition),
        }
      : null;

    // Probable pitchers
    const pitchers: MatchupPitcher[] = [];
    for (const side of [away, home]) {
      const pp = (side?.probablePitcher as Json) || {};
      const pid = str(pp?.id);
      if (!pid) continue;
      const sideTeam = side === home ? homeAbbr : awayAbbr;
      const [splits, arsenal] = await Promise.all([
        this.getPitcherSplits(pid).catch(() => []),
        this.getPitchArsenal(pid).catch(() => []),
      ]);
      const vL = splits.find((s) => s.split === 'vsLHB');
      const vR = splits.find((s) => s.split === 'vsRHB');
      pitchers.push({
        playerId: pid,
        name: str(pp?.fullName, 'TBD'),
        team: sideTeam,
        throws: (str((pp?.pitchHand as Json)?.code, 'R') as 'L' | 'R') || 'R',
        hrRiskVsLHB: hrRisk(vL?.hr9),
        hrRiskVsRHB: hrRisk(vR?.hr9),
        splits,
        arsenal,
      });
    }

    // Batters from confirmed lineups (fallback: empty until lineups post).
    const batters: MatchupBatter[] = [];
    const homeIds = asArray(lineups?.homePlayers).map((p) => str(p?.id));
    const awayIds = asArray(lineups?.awayPlayers).map((p) => str(p?.id));
    const lineupConfirmed = homeIds.length > 0 || awayIds.length > 0;

    const board = await statcastService.getBatterLeaderboard().catch(() => []);
    const scById = new Map(board.map((b) => [b.playerId, b]));

    const pushBatters = (players: Json[], teamAbbr: string) => {
      players.forEach((p, idx) => {
        const pid = str(p?.id);
        const sc = scById.get(pid);
        batters.push({
          playerId: pid,
          name: str(p?.fullName, 'Unknown'),
          team: teamAbbr,
          handedness: (str((p?.batSide as Json)?.code, 'R') as 'L' | 'R' | 'S') || 'R',
          battingOrder: idx + 1,
          pa: sc?.pa,
          hr: undefined,
          ba: sc?.ba,
          slg: sc?.slg,
          woba: sc?.woba,
          iso: sc?.slg != null && sc?.ba != null ? round(sc.slg - sc.ba, 3) : undefined,
        });
      });
    };
    pushBatters(asArray(lineups?.awayPlayers), awayAbbr);
    pushBatters(asArray(lineups?.homePlayers), homeAbbr);

    return {
      gameId: String(gameId),
      homeTeam: homeAbbr,
      awayTeam: awayAbbr,
      venue: venueName,
      gameTime: str(game?.gameDate),
      overUnder: undefined,
      lineupConfirmed,
      weather,
      parkFactor,
      pitchers,
      batters,
    };
  },

  /**
   * Odds are not available from the MLB Stats API.
   * TODO: integrate a paid odds provider once an ODDS_API_KEY is configured.
   */
  async getOdds(_gameId: string): Promise<null> {
    return null;
  },
};

function hrRisk(hr9?: number): 'high' | 'medium' | 'low' | undefined {
  if (hr9 == null) return undefined;
  if (hr9 >= 1.4) return 'high';
  if (hr9 >= 1.0) return 'medium';
  return 'low';
}

/** Convert an MLB pitching stat line into a typed PitcherSplit row. */
function toPitcherSplit(
  split: PitcherSplit['split'],
  stat: Json,
  year: number,
  playerId: string
): PitcherSplit {
  const ip = num(stat?.inningsPitched) ?? 0;
  const bf = num(stat?.battersFaced) ?? 0;
  const k = num(stat?.strikeOuts) ?? 0;
  const bb = num(stat?.baseOnBalls) ?? 0;
  const hr = num(stat?.homeRuns) ?? 0;
  const baa = num(stat?.avg);
  const slg = num(stat?.slg);
  return {
    split,
    playerId,
    year,
    ip,
    bf,
    baa,
    slg,
    iso: slg != null && baa != null ? round(slg - baa, 3) : undefined,
    whip: num(stat?.whip),
    hr,
    hr9: ip > 0 ? round((hr / ip) * 9, 2) : undefined,
    bbPct: bf > 0 ? round((bb / bf) * 100, 1) : undefined,
    kPct: bf > 0 ? round((k / bf) * 100, 1) : undefined,
    k9: ip > 0 ? round((k / ip) * 9, 1) : undefined,
  };
}

export default mlbDataService;
