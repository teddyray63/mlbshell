/**
 * statcastService.ts
 * Centralized service layer for fetching MLB Statcast data.
 * All data flows through the internal Next.js API route (/api/statcast/leaderboard)
 * which proxies Baseball Savant to avoid CORS and enable server-side caching.
 */

export interface StatcastPlayer {
  id: string;
  name: string;
  team: string;
  position: string;
  pa: number;
  ab: number;
  avg: number | null;
  obp: number | null;
  slg: number | null;
  woba: number | null;
  xwoba: number | null;
  exitVelocityAvg: number | null;
  barrelRate: number | null;
  hardHitPct: number | null;
  kPct: number | null;
  bbPct: number | null;
  iso: number | null;
  babip: number | null;
}

export interface StatcastLeaderboardResult {
  players: StatcastPlayer[];
  year: string;
  fetchedAt: string;
}

export interface StatcastKPIs {
  avgExitVelocity: number | null;
  barrelPct: number | null;
  hardHitPct: number | null;
  woba: number | null;
  xwoba: number | null;
  kPct: number | null;
}

export interface WobaTrendPoint {
  date: string;
  woba: number;
}

export interface BattedBallPoint {
  name: string;
  pct: number;
}

export interface StatcastFetchOptions {
  year?: string;
  min?: string;
  type?: 'batter' | 'pitcher';
}

function avg(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return null;
  return parseFloat((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(3));
}

/**
 * Fetch the full Statcast hitter leaderboard from our internal API route.
 */
export async function fetchStatcastLeaderboard(
  options: StatcastFetchOptions = {}
): Promise<StatcastLeaderboardResult> {
  const year = options.year || new Date().getFullYear().toString();
  const min = options.min || '50';
  const type = options.type || 'batter';

  const params = new URLSearchParams({ year, min, type });
  const res = await fetch(`/api/statcast/leaderboard?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Statcast API error: ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data as StatcastLeaderboardResult;
}

/**
 * Derive aggregate KPI values from the leaderboard (league-wide averages).
 */
export function deriveKPIs(players: StatcastPlayer[]): StatcastKPIs {
  if (players.length === 0) {
    return {
      avgExitVelocity: null,
      barrelPct: null,
      hardHitPct: null,
      woba: null,
      xwoba: null,
      kPct: null,
    };
  }

  return {
    avgExitVelocity: avg(players.map((p) => p.exitVelocityAvg)),
    barrelPct: avg(players.map((p) => p.barrelRate)),
    hardHitPct: avg(players.map((p) => p.hardHitPct)),
    woba: avg(players.map((p) => p.woba)),
    xwoba: avg(players.map((p) => p.xwoba)),
    kPct: avg(players.map((p) => p.kPct)),
  };
}

/**
 * Build a synthetic wOBA trend series from the leaderboard snapshot.
 * Groups players into PA-weighted buckets to simulate a rolling trend.
 * In production, replace with a time-series endpoint.
 */
export function buildWobaTrendFromLeaderboard(players: StatcastPlayer[]): WobaTrendPoint[] {
  if (players.length === 0) return [];

  // Sort by wOBA descending, take top 50 for trend simulation
  const sorted = [...players]
    .filter((p) => p.woba !== null)
    .sort((a, b) => (b.woba ?? 0) - (a.woba ?? 0))
    .slice(0, 50);

  // Create 8 synthetic trend points using rolling averages of player subsets
  const chunkSize = Math.max(1, Math.floor(sorted.length / 8));
  const months = ['Apr 1', 'Apr 15', 'May 1', 'May 15', 'Jun 1', 'Jun 15', 'Jul 1', 'Jul 15'];

  return months.map((date, i) => {
    const start = Math.min(i * chunkSize, sorted.length - chunkSize);
    const chunk = sorted.slice(start, start + chunkSize);
    const wobaAvg = avg(chunk.map((p) => p.woba)) ?? 0.320;
    return { date, woba: parseFloat(wobaAvg.toFixed(3)) };
  });
}

/**
 * Build batted ball profile distribution from leaderboard data.
 * Uses hard hit %, barrel %, and derived estimates for contact types.
 */
export function buildBattedBallProfile(players: StatcastPlayer[]): BattedBallPoint[] {
  if (players.length === 0) {
    return [
      { name: 'Groundball', pct: 0.38 },
      { name: 'Line Drive', pct: 0.24 },
      { name: 'Fly Ball', pct: 0.29 },
      { name: 'Pop Up', pct: 0.09 },
    ];
  }

  const avgBarrel = avg(players.map((p) => p.barrelRate)) ?? 8;
  const avgHardHit = avg(players.map((p) => p.hardHitPct)) ?? 38;

  // Derive approximate distribution from Statcast averages
  const flyBall = parseFloat(((avgHardHit / 100) * 0.55).toFixed(3));
  const lineDrive = parseFloat(((avgBarrel / 100) * 2.5).toFixed(3));
  const popup = parseFloat((0.08 + (1 - avgHardHit / 100) * 0.05).toFixed(3));
  const groundball = parseFloat((1 - flyBall - lineDrive - popup).toFixed(3));

  return [
    { name: 'Groundball', pct: Math.max(0.1, groundball) },
    { name: 'Line Drive', pct: Math.max(0.05, lineDrive) },
    { name: 'Fly Ball', pct: Math.max(0.1, flyBall) },
    { name: 'Pop Up', pct: Math.max(0.02, popup) },
  ];
}
