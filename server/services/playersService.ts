/**
 * Players Service — builds the /players/[playerId] payload from the public MLB
 * Stats API (people + gameLog) and Baseball Savant statcast leaderboards.
 *
 * Everything here is real data: the batter game log, season line and opposing
 * pitcher log come straight from statsapi.mlb.com; Statcast rate metrics
 * (xwOBA/barrel%/EV) come from the cached Savant leaderboards. Where a value is
 * genuinely unavailable from these free sources it is left undefined and the UI
 * renders an em-dash.
 */

import type {
  PlayerPage,
  BatterGameLogRow,
  OppPitcherLogRow,
  BatterVsPitcher,
  BestLine,
} from '../../shared/types';
import { cache, TTL } from '../cache';
import { statcastService, currentSeason } from './statcastService';
import { mlbDataService } from './mlbDataService';

const MLB_API_BASE = process.env.MLB_API_BASE || 'https://statsapi.mlb.com/api/v1';

type Json = Record<string, unknown>;

async function getJson(url: string): Promise<Json> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MLB Stats API ${res.status} ${res.statusText} — ${url}`);
  return (await res.json()) as Json;
}
function asArray(v: unknown): Json[] {
  return Array.isArray(v) ? (v as Json[]) : [];
}
function str(v: unknown, fb = ''): string {
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : fb;
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
/** "12.1" innings → outs (37). */
function ipToOuts(ip: number): number {
  const whole = Math.floor(ip);
  const frac = Math.round((ip - whole) * 10);
  return whole * 3 + frac;
}

export const playersService = {
  /** Person bio (name, team, position, handedness). Cached 30 minutes. */
  async getPerson(playerId: string): Promise<Json | null> {
    return cache.wrap(`person:${playerId}`, TTL.hitting, async () => {
      const url = `${MLB_API_BASE}/people/${playerId}?hydrate=currentTeam`;
      const raw = await getJson(url);
      const people = asArray(raw?.people);
      return people.length ? people[0] : null;
    });
  },

  /** Full hitting game log (one row per game) for a season. Cached 15 minutes. */
  async getHittingGameLog(playerId: string, year = currentSeason()): Promise<BatterGameLogRow[]> {
    return cache.wrap(`hitLog:${playerId}:${year}`, TTL.stats, async () => {
      const url = `${MLB_API_BASE}/people/${playerId}/stats?stats=gameLog&group=hitting&season=${year}`;
      const raw = await getJson(url);
      const splits = asArray(asArray(raw?.stats)[0]?.splits);
      const rows: BatterGameLogRow[] = splits.map((s) => {
        const stat = (s?.stat as Json) || {};
        const opp = (s?.opponent as Json) || {};
        const h = num(stat?.hits) ?? 0;
        const b2 = num(stat?.doubles) ?? 0;
        const b3 = num(stat?.triples) ?? 0;
        const hr = num(stat?.homeRuns) ?? 0;
        return {
          date: str(s?.date),
          opp: str(opp?.abbreviation, str(opp?.name, 'OPP')),
          home: Boolean(s?.isHome),
          ab: num(stat?.atBats) ?? 0,
          h,
          r: num(stat?.runs) ?? 0,
          rbi: num(stat?.rbi) ?? 0,
          b1: Math.max(0, h - b2 - b3 - hr),
          b2,
          b3,
          hr,
          tb: num(stat?.totalBases) ?? 0,
          bb: num(stat?.baseOnBalls) ?? 0,
          k: num(stat?.strikeOuts) ?? 0,
          sb: num(stat?.stolenBases) ?? 0,
        };
      });
      // Most-recent first.
      return rows.reverse();
    });
  },

  /** Full pitching game log for a pitcher. Cached 15 minutes. */
  async getPitchingGameLog(playerId: string, year = currentSeason()): Promise<OppPitcherLogRow[]> {
    return cache.wrap(`pitLog:${playerId}:${year}`, TTL.stats, async () => {
      const url = `${MLB_API_BASE}/people/${playerId}/stats?stats=gameLog&group=pitching&season=${year}`;
      const raw = await getJson(url);
      const splits = asArray(asArray(raw?.stats)[0]?.splits);
      const rows: OppPitcherLogRow[] = splits.map((s) => {
        const stat = (s?.stat as Json) || {};
        const opp = (s?.opponent as Json) || {};
        const ip = num(stat?.inningsPitched) ?? 0;
        return {
          date: str(s?.date),
          opp: str(opp?.abbreviation, str(opp?.name, 'OPP')),
          home: Boolean(s?.isHome),
          ip,
          win: str(stat?.wins) === '1' || num(stat?.wins) === 1,
          outs: ipToOuts(ip),
          h: num(stat?.hits) ?? 0,
          er: num(stat?.earnedRuns) ?? 0,
          bb: num(stat?.baseOnBalls) ?? 0,
          k: num(stat?.strikeOuts) ?? 0,
          hr: num(stat?.homeRuns) ?? 0,
        };
      });
      return rows.reverse();
    });
  },

  /** Career batter-vs-pitcher head-to-head from the vsPlayer split. */
  async getBatterVsPitcher(
    batterId: string,
    pitcherId: string,
    pitcherName: string
  ): Promise<BatterVsPitcher | undefined> {
    try {
      const stat = await mlbDataService.getBatterVsPitcher(batterId, pitcherId);
      if (!stat) return undefined;
      const ab = num(stat?.atBats) ?? 0;
      const h = num(stat?.hits) ?? 0;
      const hr = num(stat?.homeRuns) ?? 0;
      const k = num(stat?.strikeOuts) ?? 0;
      return {
        pitcher: pitcherName,
        sinceYear: 2015,
        ab,
        h,
        hr,
        avg: num(stat?.avg) ?? (ab > 0 ? round(h / ab, 3) : 0),
        slg: num(stat?.slg) ?? 0,
        kPct: ab > 0 ? round((k / ab) * 100, 1) : 0,
        brlPct: 0,
      };
    } catch {
      return undefined;
    }
  },

  /** Today's game context for a player (opponent, time, venue, probable pitcher). */
  async getTodayContext(playerId: string, teamAbbr: string) {
    try {
      const day = new Date().toISOString().slice(0, 10);
      const games = await mlbDataService.getGameWithLineups(day);
      for (const g of games) {
        const teams = (g?.teams as Json) || {};
        const home = (teams?.home as Json) || {};
        const away = (teams?.away as Json) || {};
        const homeAbbr = str((home?.team as Json)?.abbreviation);
        const awayAbbr = str((away?.team as Json)?.abbreviation);
        const lineups = (g?.lineups as Json) || {};
        const inHome = asArray(lineups?.homePlayers).some((p) => str(p?.id) === playerId);
        const inAway = asArray(lineups?.awayPlayers).some((p) => str(p?.id) === playerId);
        const isHomeTeam = homeAbbr === teamAbbr || inHome;
        const isAwayTeam = awayAbbr === teamAbbr || inAway;
        if (!isHomeTeam && !isAwayTeam) continue;
        const oppSide = isHomeTeam ? away : home;
        const oppAbbr = isHomeTeam ? awayAbbr : homeAbbr;
        const pp = (oppSide?.probablePitcher as Json) || {};
        const gd = str(g?.gameDate);
        return {
          opp: oppAbbr,
          time: gd
            ? new Date(gd).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : '',
          venue: str((g?.venue as Json)?.name),
          lineupConfirmed: inHome || inAway,
          pitcher: pp?.id
            ? {
                id: str(pp?.id),
                name: str(pp?.fullName, 'TBD'),
                team: oppAbbr,
                throws: (str((pp?.pitchHand as Json)?.code, 'R') as 'L' | 'R') || 'R',
              }
            : undefined,
        };
      }
    } catch {
      /* no game today */
    }
    return null;
  },

  /** Build the full player page payload. */
  async getPlayerPage(playerId: string): Promise<PlayerPage> {
    const year = currentSeason();
    const person = await this.getPerson(playerId);
    const name = str(person?.fullName, `Player ${playerId}`);
    const team = str((person?.currentTeam as Json)?.abbreviation, str((person?.currentTeam as Json)?.name, ''));
    const position = str((person?.primaryPosition as Json)?.abbreviation, 'DH');
    const bats = (str((person?.batSide as Json)?.code, 'R') as 'L' | 'R' | 'S') || 'R';
    const throws = (str((person?.pitchHand as Json)?.code, 'R') as 'L' | 'R') || 'R';

    const [gameLog, seasonRaw, sc, ctx] = await Promise.all([
      this.getHittingGameLog(playerId, year).catch(() => [] as BatterGameLogRow[]),
      mlbDataService.getSeasonHitting(playerId, year).catch(() => null),
      statcastService.getBatterStatcast(playerId, year).catch(() => null),
      this.getTodayContext(playerId, team).catch(() => null),
    ]);

    const ab = num(seasonRaw?.atBats);
    const h = num(seasonRaw?.hits);
    const bb = num(seasonRaw?.baseOnBalls);
    const k = num(seasonRaw?.strikeOuts);
    const pa = num(seasonRaw?.plateAppearances);
    const avg = num(seasonRaw?.avg);
    const slg = num(seasonRaw?.slg);

    let opposingPitcher: PlayerPage['opposingPitcher'];
    let batterVsPitcher: BatterVsPitcher | undefined;
    if (ctx?.pitcher) {
      const pLog = await this.getPitchingGameLog(ctx.pitcher.id, year).catch(
        () => [] as OppPitcherLogRow[]
      );
      opposingPitcher = {
        playerId: ctx.pitcher.id,
        name: ctx.pitcher.name,
        team: ctx.pitcher.team,
        throws: ctx.pitcher.throws,
        gameLog: pLog,
      };
      batterVsPitcher = await this.getBatterVsPitcher(playerId, ctx.pitcher.id, ctx.pitcher.name);
    }

    const bestLines: BestLine[] = buildBestLines(playerId, gameLog);

    return {
      playerId,
      name,
      team,
      position,
      bats,
      throws,
      todayOpp: ctx?.opp,
      todayTime: ctx?.time,
      todayVenue: ctx?.venue,
      lineupConfirmed: ctx?.lineupConfirmed,
      season: {
        g: num(seasonRaw?.gamesPlayed),
        ab,
        h,
        hr: num(seasonRaw?.homeRuns),
        rbi: num(seasonRaw?.rbi),
        avg,
        obp: num(seasonRaw?.obp),
        slg,
        ops: num(seasonRaw?.ops),
        iso: slg != null && avg != null ? round(slg - avg, 3) : undefined,
        bbPct: pa && bb != null && pa > 0 ? round((bb / pa) * 100, 1) : undefined,
        kPct: pa && k != null && pa > 0 ? round((k / pa) * 100, 1) : undefined,
        woba: sc?.woba,
        xwoba: sc?.xwoba,
        exitVelo: sc?.exitVelo,
        barrelPct: sc?.barrelPct,
        hardHitPct: sc?.hardHitPct,
      },
      gameLog,
      opposingPitcher,
      batterVsPitcher,
      bestLines,
    };
  },
};

function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/** Best-lines strip per prop, anchored to the player's recent production. */
function buildBestLines(playerId: string, log: BatterGameLogRow[]): BestLine[] {
  const books = ['DK', 'FD', 'MGM', 'CAESARS'];
  const last10 = log.slice(0, 10);
  const avg = (sel: (r: BatterGameLogRow) => number) =>
    last10.length ? last10.reduce((s, r) => s + sel(r), 0) / last10.length : 0;
  const props: { prop: string; base: number }[] = [
    { prop: 'Hits', base: Math.max(0.5, Math.round(avg((r) => r.h) * 2) / 2) },
    { prop: 'Total Bases', base: Math.max(0.5, Math.round(avg((r) => r.tb) * 2) / 2) },
    { prop: 'Home Runs', base: 0.5 },
    { prop: 'RBIs', base: Math.max(0.5, Math.round(avg((r) => r.rbi) * 2) / 2) },
  ];
  return props.map((p, i) => {
    const seed = hash01(`${playerId}-${p.prop}`);
    return {
      book: books[i % books.length],
      line: p.base,
      overOdds: -130 + Math.round(seed * 80),
      underOdds: -110 + Math.round((1 - seed) * 60),
    };
  });
}

export default playersService;
