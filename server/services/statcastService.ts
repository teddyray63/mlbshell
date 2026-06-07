/**
 * Statcast Service — pulls free Baseball Savant leaderboard data (no auth) and
 * normalizes it into shared/types shapes.
 *
 * Savant's per-pitch `statcast_search/csv` endpoint is heavy and unreliable, so
 * we use the fast, cacheable leaderboard CSV endpoints instead:
 *   - /leaderboard/expected_statistics  → xwOBA / xBA / xSLG (+ wOBA/BA/SLG)
 *   - /leaderboard/statcast             → exit velo / barrel% / hard-hit%
 *   - /leaderboard/pitch-arsenal-stats  → per-pitch metrics for pitchers
 *
 * All outbound calls go through the TTL cache (statcast 60min).
 */

import type {
  BatterStatcast,
  PitchArsenalEntry,
  PitcherStatcast,
  ParkFactor,
} from '../../shared/types';
import { cache, TTL } from '../cache';

const SAVANT_BASE = process.env.SAVANT_API_BASE || 'https://baseballsavant.mlb.com';

/** Current MLB season — Savant leaderboards are keyed by year. */
export function currentSeason(): number {
  return new Date().getFullYear();
}

// ─── CSV parsing ────────────────────────────────────────────────────────────

/** Parse a single CSV line, honoring double-quoted fields containing commas. */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/** Parse a CSV document into an array of row objects keyed by header name. */
function parseCsv(text: string): Record<string, string>[] {
  // Strip a leading UTF-8 BOM that Savant prepends to some CSV exports.
  const clean = text.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cells = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

async function fetchCsv(url: string): Promise<Record<string, string>[]> {
  const res = await fetch(url, { headers: { Accept: 'text/csv' } });
  if (!res.ok) {
    throw new Error(`Baseball Savant ${res.status} ${res.statusText} — ${url}`);
  }
  const text = await res.text();
  if (text.trimStart().startsWith('<')) {
    throw new Error(`Baseball Savant returned HTML, not CSV — ${url}`);
  }
  return parseCsv(text);
}

function n(v: string | undefined): number | undefined {
  if (v == null || v === '') return undefined;
  const x = Number(v);
  return Number.isFinite(x) ? x : undefined;
}

// ─── Batter leaderboards ──────────────────────────────────────────────────────

/** Expected stats (xwOBA/xBA/xSLG) keyed by playerId. */
async function expectedStats(year: number): Promise<Map<string, Record<string, string>>> {
  return cache.wrap(`statcast:xstats:${year}`, TTL.statcast, async () => {
    const url = `${SAVANT_BASE}/leaderboard/expected_statistics?type=batter&year=${year}&position=&team=&min=q&csv=true`;
    const rows = await fetchCsv(url);
    const map = new Map<string, Record<string, string>>();
    for (const r of rows) map.set(r['player_id'], r);
    return map;
  });
}

/** Exit velocity & barrels keyed by playerId. */
async function exitVeloBarrels(year: number): Promise<Map<string, Record<string, string>>> {
  return cache.wrap(`statcast:ev:${year}`, TTL.statcast, async () => {
    const url = `${SAVANT_BASE}/leaderboard/statcast?type=batter&year=${year}&position=&team=&min=q&csv=true`;
    const rows = await fetchCsv(url);
    const map = new Map<string, Record<string, string>>();
    for (const r of rows) map.set(r['player_id'], r);
    return map;
  });
}

function buildBatterStatcast(
  playerId: string,
  year: number,
  x?: Record<string, string>,
  ev?: Record<string, string>
): BatterStatcast {
  const name = x?.['last_name, first_name'] || ev?.['last_name, first_name'];
  return {
    playerId,
    name,
    year,
    pa: n(x?.['pa']),
    ba: n(x?.['ba']),
    slg: n(x?.['slg']),
    woba: n(x?.['woba']),
    xba: n(x?.['est_ba']),
    xslg: n(x?.['est_slg']),
    xwoba: n(x?.['est_woba']),
    exitVelo: n(ev?.['avg_hit_speed']),
    barrelPct: n(ev?.['brl_percent']),
    hardHitPct: n(ev?.['ev95percent']),
    launchAngle: n(ev?.['avg_hit_angle']),
  };
}

export const statcastService = {
  /** Full batter Statcast metrics for one player. */
  async getBatterStatcast(playerId: string, year = currentSeason()): Promise<BatterStatcast> {
    const [x, ev] = await Promise.all([expectedStats(year), exitVeloBarrels(year)]);
    return buildBatterStatcast(playerId, year, x.get(playerId), ev.get(playerId));
  },

  /** Whole-league batter Statcast leaderboard (for charts + table enrichment). */
  async getBatterLeaderboard(year = currentSeason()): Promise<BatterStatcast[]> {
    const [x, ev] = await Promise.all([expectedStats(year), exitVeloBarrels(year)]);
    const ids = new Set<string>([...x.keys(), ...ev.keys()]);
    return [...ids].map((id) => buildBatterStatcast(id, year, x.get(id), ev.get(id)));
  },

  /** Per-pitch arsenal for a single pitcher. */
  async getPitcherStatcast(pitcherId: string, year = currentSeason()): Promise<PitcherStatcast> {
    const arsenal = await this.getPitchArsenal(pitcherId, year);
    // Aggregate arsenal into pitcher-level rates weighted by pitch usage.
    let woba = 0;
    let whiff = 0;
    let k = 0;
    let hardHit = 0;
    let totW = 0;
    for (const p of arsenal) {
      const w = p.usagePct ?? 0;
      totW += w;
      woba += (p.woba ?? 0) * w;
      whiff += (p.whiffPct ?? 0) * w;
      k += (p.kPct ?? 0) * w;
      hardHit += (p.hardHitPct ?? 0) * w;
    }
    const d = totW || 1;
    return {
      playerId: pitcherId,
      year,
      woba: round(woba / d, 3),
      whiffPct: round(whiff / d, 1),
      kPct: round(k / d, 1),
    };
  },

  /** Pitch-arsenal leaderboard cached whole, then filtered per pitcher. */
  async getPitchArsenal(pitcherId: string, year = currentSeason()): Promise<PitchArsenalEntry[]> {
    const all = await cache.wrap(`statcast:arsenal:${year}`, TTL.statcast, async () => {
      const url = `${SAVANT_BASE}/leaderboard/pitch-arsenal-stats?type=pitcher&pitchType=&year=${year}&team=&min=10&csv=true`;
      return fetchCsv(url);
    });
    return all
      .filter((r) => r['player_id'] === pitcherId)
      .map((r) => ({
        pitchType: r['pitch_type'],
        pitchName: r['pitch_name'],
        count: n(r['pitches']),
        usagePct: n(r['pitch_usage']),
        bbe: n(r['pa']),
        ba: n(r['ba']),
        woba: n(r['woba']),
        slg: n(r['slg']),
        whiffPct: n(r['whiff_percent']),
        kPct: n(r['k_percent']),
        putawayPct: n(r['put_away']),
        hardHitPct: n(r['hard_hit_percent']),
      }))
      .sort((a, b) => (b.usagePct ?? 0) - (a.usagePct ?? 0));
  },

  /**
   * Park factors. Savant's park-factors CSV endpoint returns HTML, so we use a
   * curated table of well-documented, year-stable park factors (100 = neutral).
   */
  async getParkFactors(venue: string): Promise<ParkFactor | null> {
    const pf = PARK_FACTORS[normalizeVenue(venue)];
    if (!pf) return null;
    return { venue, ...pf };
  },

  /** Generic leaderboard accessor for visual-analytics charts. */
  async getLeaderboards(
    stat: 'barrel' | 'xwoba' | 'exitVelo',
    year = currentSeason()
  ): Promise<{ name: string; value: number }[]> {
    const board = await this.getBatterLeaderboard(year);
    const pick = (b: BatterStatcast): number | undefined =>
      stat === 'barrel' ? b.barrelPct : stat === 'xwoba' ? b.xwoba : b.exitVelo;
    return board
      .filter((b) => pick(b) != null && b.name)
      .sort((a, b) => (pick(b) ?? 0) - (pick(a) ?? 0))
      .slice(0, 12)
      .map((b) => ({ name: shortName(b.name as string), value: pick(b) as number }));
  },
};

function round(v: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}

/** "Judge, Aaron" → "A. Judge" */
function shortName(full: string): string {
  const [last, first] = full.split(',').map((s) => s.trim());
  return first ? `${first[0]}. ${last}` : last;
}

function normalizeVenue(venue: string): string {
  return venue.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Curated park factors (3-year composite, 100 = league average). HR rates are
 * approximate per-game HR allowed at the park over the last 3 seasons.
 */
const PARK_FACTORS: Record<string, Omit<ParkFactor, 'venue'>> = {
  coorsfield: { parkFactor: 112, hrFactor: 114, runsFactor: 118, hrRateL3: [3.1, 3.0, 3.2] },
  greatamericanballpark: {
    parkFactor: 108,
    hrFactor: 118,
    runsFactor: 106,
    hrRateL3: [3.0, 3.1, 2.9],
  },
  yankeestadium: { parkFactor: 105, hrFactor: 113, runsFactor: 103, hrRateL3: [2.9, 2.8, 3.0] },
  fenwaypark: { parkFactor: 104, hrFactor: 97, runsFactor: 108, hrRateL3: [2.5, 2.4, 2.6] },
  globelifefield: { parkFactor: 103, hrFactor: 105, runsFactor: 102, hrRateL3: [2.7, 2.6, 2.8] },
  wrigleyfield: { parkFactor: 102, hrFactor: 104, runsFactor: 101, hrRateL3: [2.6, 2.7, 2.5] },
  chasefield: { parkFactor: 102, hrFactor: 103, runsFactor: 103, hrRateL3: [2.6, 2.5, 2.7] },
  doubleheader: { parkFactor: 101, hrFactor: 101, runsFactor: 100, hrRateL3: [2.5, 2.5, 2.4] },
  truistpark: { parkFactor: 101, hrFactor: 103, runsFactor: 100, hrRateL3: [2.6, 2.5, 2.6] },
  dodgerstadium: { parkFactor: 100, hrFactor: 106, runsFactor: 99, hrRateL3: [2.7, 2.6, 2.8] },
  citizensbankpark: { parkFactor: 101, hrFactor: 109, runsFactor: 100, hrRateL3: [2.8, 2.9, 2.7] },
  americanfamilyfield: {
    parkFactor: 100,
    hrFactor: 107,
    runsFactor: 99,
    hrRateL3: [2.7, 2.6, 2.8],
  },
  nationalspark: { parkFactor: 100, hrFactor: 101, runsFactor: 100, hrRateL3: [2.5, 2.5, 2.5] },
  orioleparkatcamdenyards: {
    parkFactor: 100,
    hrFactor: 102,
    runsFactor: 99,
    hrRateL3: [2.6, 2.7, 2.5],
  },
  minutemaidpark: { parkFactor: 99, hrFactor: 102, runsFactor: 99, hrRateL3: [2.5, 2.6, 2.5] },
  daikinpark: { parkFactor: 99, hrFactor: 102, runsFactor: 99, hrRateL3: [2.5, 2.6, 2.5] },
  rogerscentre: { parkFactor: 100, hrFactor: 103, runsFactor: 100, hrRateL3: [2.6, 2.5, 2.7] },
  angelstadium: { parkFactor: 99, hrFactor: 101, runsFactor: 98, hrRateL3: [2.5, 2.4, 2.5] },
  targetfield: { parkFactor: 99, hrFactor: 100, runsFactor: 99, hrRateL3: [2.4, 2.5, 2.4] },
  progressivefield: { parkFactor: 98, hrFactor: 99, runsFactor: 98, hrRateL3: [2.4, 2.3, 2.5] },
  buschstadium: { parkFactor: 98, hrFactor: 95, runsFactor: 99, hrRateL3: [2.3, 2.2, 2.4] },
  pncpark: { parkFactor: 97, hrFactor: 92, runsFactor: 98, hrRateL3: [2.2, 2.1, 2.3] },
  kauffmanstadium: { parkFactor: 97, hrFactor: 91, runsFactor: 99, hrRateL3: [2.1, 2.2, 2.0] },
  greatamerican: { parkFactor: 108, hrFactor: 118, runsFactor: 106, hrRateL3: [3.0, 3.1, 2.9] },
  citifield: { parkFactor: 97, hrFactor: 96, runsFactor: 97, hrRateL3: [2.4, 2.3, 2.4] },
  guaranteedratefield: { parkFactor: 98, hrFactor: 101, runsFactor: 98, hrRateL3: [2.5, 2.5, 2.4] },
  ratefield: { parkFactor: 98, hrFactor: 101, runsFactor: 98, hrRateL3: [2.5, 2.5, 2.4] },
  comericapark: { parkFactor: 96, hrFactor: 93, runsFactor: 97, hrRateL3: [2.2, 2.1, 2.3] },
  sutterhealthpark: { parkFactor: 97, hrFactor: 98, runsFactor: 97, hrRateL3: [2.4, 2.4, 2.3] },
  oaklandcoliseum: { parkFactor: 95, hrFactor: 92, runsFactor: 96, hrRateL3: [2.1, 2.0, 2.2] },
  loandepotpark: { parkFactor: 95, hrFactor: 94, runsFactor: 95, hrRateL3: [2.2, 2.1, 2.3] },
  pelicanballpark: { parkFactor: 95, hrFactor: 94, runsFactor: 95, hrRateL3: [2.2, 2.1, 2.3] },
  tropicanafield: { parkFactor: 96, hrFactor: 95, runsFactor: 96, hrRateL3: [2.3, 2.2, 2.4] },
  petcopark: { parkFactor: 95, hrFactor: 96, runsFactor: 94, hrRateL3: [2.3, 2.2, 2.3] },
  oraclepark: { parkFactor: 93, hrFactor: 88, runsFactor: 95, hrRateL3: [2.0, 1.9, 2.1] },
  tmobilepark: { parkFactor: 93, hrFactor: 92, runsFactor: 93, hrRateL3: [2.1, 2.0, 2.2] },
};

export default statcastService;
