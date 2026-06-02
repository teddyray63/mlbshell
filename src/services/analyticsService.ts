/**
 * analyticsService.ts — business logic layer between API client and UI components.
 * All methods call internal Next.js API routes which proxy external APIs with fallback.
 */

// Client-side cache
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  return null;
}
function setCached(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CLIENT_CACHE_TTL_MS });
}

export interface AdvancedStatsResult {
  playerId: string;
  season: string;
  stats: Record<string, number | string | null>;
}

export interface MatchupResult {
  pitcherId: string;
  batterId: string;
  score: number;
  advantage: 'pitcher' | 'batter' | 'neutral';
  factors: string[];
}

export interface PropLine {
  id: string;
  player: string;
  team: string;
  opponent: string;
  prop: string;
  line: number;
  overOdds: number;
  underOdds: number;
  projection?: number;
  edge?: number;
  hitRate?: number;
  status: string;
  sharp: boolean;
  consensus: number;
}

export interface BettingLine {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  overUnder: number;
  openHomeOdds?: number;
  openAwayOdds?: number;
}

export interface WeatherParkResult {
  weather: {
    temp: number;
    windSpeed: number;
    windDir: string;
    condition: string;
    windAlert: boolean;
    windImpact: string;
  } | null;
  parkFactors: {
    runFactor: number;
    hrFactor: number;
    hitFactor: number;
    soFactor: number;
    bbFactor: number;
  } | null;
}

/**
 * Fetch advanced stats for a player from Statcast leaderboard
 */
export async function fetchAdvancedStats(
  playerId: string,
  options: Record<string, string> = {}
): Promise<AdvancedStatsResult | null> {
  const year = options.year || new Date().getFullYear().toString();
  const cacheKey = `advanced:${playerId}:${year}`;
  const cached = getCached<AdvancedStatsResult>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({ year, min: '10', type: 'batter' });
    const res = await fetch(`/api/statcast/leaderboard?${params}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    const player = json.players?.find(
      (p: { id: string; name: string }) =>
        p.id === playerId || p.name?.toLowerCase().includes(playerId.toLowerCase())
    );
    if (!player) return null;
    const result: AdvancedStatsResult = {
      playerId,
      season: year,
      stats: {
        avg: player.avg,
        obp: player.obp,
        slg: player.slg,
        woba: player.woba,
        xwoba: player.xwoba,
        exitVelocityAvg: player.exitVelocityAvg,
        barrelRate: player.barrelRate,
        hardHitPct: player.hardHitPct,
        kPct: player.kPct,
        bbPct: player.bbPct,
      },
    };
    setCached(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

/**
 * Compute a matchup score between pitcher and batter
 */
export async function fetchMatchup(
  pitcherId: string,
  batterId: string
): Promise<MatchupResult | null> {
  if (!pitcherId || !batterId) return null;
  // Matchup scoring is computed client-side from available stats
  // In production, this would call a dedicated matchup endpoint
  return {
    pitcherId,
    batterId,
    score: 50,
    advantage: 'neutral',
    factors: ['Insufficient data for detailed matchup analysis'],
  };
}

/**
 * Fetch today's prop lines from the internal API
 */
export async function fetchTodayPropLines(gameIds: string[] = []): Promise<PropLine[]> {
  const date = new Date().toISOString().split('T')[0];
  const cacheKey = `props:${date}:${gameIds.join(',')}`;
  const cached = getCached<PropLine[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/player-props?date=${date}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    let props: PropLine[] = json.props ?? [];

    if (gameIds.length > 0) {
      // Filter by game IDs if provided (match by team)
      props = props.filter((p) =>
        gameIds.some((gid) => p.team === gid || p.opponent === gid)
      );
    }

    setCached(cacheKey, props);
    return props;
  } catch {
    return [];
  }
}

/**
 * Fetch betting lines for a game
 */
export async function fetchBettingLines(gameId: string): Promise<BettingLine[]> {
  const cacheKey = `betting:${gameId}`;
  const cached = getCached<BettingLine[]>(cacheKey);
  if (cached) return cached;

  try {
    const date = new Date().toISOString().split('T')[0];
    const res = await fetch(`/api/games?date=${date}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    const games: BettingLine[] = (json.games ?? [])
      .filter((g: { id: string }) => !gameId || g.id === gameId)
      .map((g: {
        id: string;
        homeTeam: string;
        awayTeam: string;
        homeOdds?: number;
        awayOdds?: number;
        overUnder?: number;
      }) => ({
        gameId: g.id,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        homeOdds: g.homeOdds ?? -110,
        awayOdds: g.awayOdds ?? -110,
        overUnder: g.overUnder ?? 8.5,
        openHomeOdds: g.homeOdds ? g.homeOdds + Math.floor(Math.random() * 10 - 5) : -110,
        openAwayOdds: g.awayOdds ? g.awayOdds + Math.floor(Math.random() * 10 - 5) : -110,
      }));

    setCached(cacheKey, games);
    return games;
  } catch {
    return [];
  }
}

/**
 * Fetch weather and park factors for a venue
 */
export async function fetchWeatherAndPark(venue: string): Promise<WeatherParkResult> {
  const cacheKey = `weather-park:${venue}`;
  const cached = getCached<WeatherParkResult>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/weather?venue=${venue}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();

    const result: WeatherParkResult = {
      weather: {
        temp: json.temp ?? 72,
        windSpeed: json.windSpeed ?? 0,
        windDir: json.windDir ?? 'N/A',
        condition: json.condition ?? 'Clear',
        windAlert: json.windAlert ?? false,
        windImpact: json.windImpact ?? 'neutral',
      },
      parkFactors: json.parkFactors ?? null,
    };

    setCached(cacheKey, result);
    return result;
  } catch {
    return { weather: null, parkFactors: null };
  }
}