import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for server-side
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  return null;
}

function setCached(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// MLB Stats API free endpoint
const MLB_API = 'https://statsapi.mlb.com/api/v1';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const cacheKey = `games:${date}`;

  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached as object, cached: true });
  }

  try {
    const res = await fetch(
      `${MLB_API}/schedule?sportId=1&date=${date}&hydrate=team,linescore,odds`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) throw new Error(`MLB API error: ${res.status}`);
    const json = await res.json();

    const games = (json.dates?.[0]?.games ?? []).map((g: Record<string, unknown>) => {
      const away = (g.teams as Record<string, Record<string, Record<string, string>>>)?.away?.team?.abbreviation ?? '';
      const home = (g.teams as Record<string, Record<string, Record<string, string>>>)?.home?.team?.abbreviation ?? '';
      const awayFull = (g.teams as Record<string, Record<string, Record<string, string>>>)?.away?.team?.name ?? '';
      const homeFull = (g.teams as Record<string, Record<string, Record<string, string>>>)?.home?.team?.name ?? '';
      const status = (g.status as Record<string, string>)?.abstractGameState?.toLowerCase() ?? 'scheduled';
      const gameTime = g.gameDate ? new Date(g.gameDate as string).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET' : 'TBD';
      const venue = (g.venue as Record<string, string>)?.name ?? '';
      const linescore = g.linescore as Record<string, unknown> | undefined;
      const awayScore = (linescore?.teams as Record<string, Record<string, number>>)?.away?.runs;
      const homeScore = (linescore?.teams as Record<string, Record<string, number>>)?.home?.runs;
      const inning = linescore ? `${(linescore.isTopInning ? 'T' : 'B')}${linescore.currentInning}` : undefined;

      return {
        id: String(g.gamePk),
        awayTeam: away,
        homeTeam: home,
        awayTeamFull: awayFull,
        homeTeamFull: homeFull,
        time: gameTime,
        venue,
        status: status === 'live' ? 'live' : status === 'final' ? 'final' : 'scheduled',
        awayScore,
        homeScore,
        inning,
      };
    });

    const result = { games, date, fetchedAt: new Date().toISOString() };
    setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Fallback to mock data
    const fallback = {
      games: [
        { id: 'game-1', awayTeam: 'BOS', homeTeam: 'NYY', time: '1:05 PM ET', venue: 'Yankee Stadium', status: 'scheduled' },
        { id: 'game-2', awayTeam: 'SF', homeTeam: 'LAD', time: '4:10 PM ET', venue: 'Dodger Stadium', status: 'scheduled' },
        { id: 'game-3', awayTeam: 'TEX', homeTeam: 'HOU', time: '7:10 PM ET', venue: 'Minute Maid Park', status: 'scheduled' },
        { id: 'game-4', awayTeam: 'PHI', homeTeam: 'ATL', time: '7:20 PM ET', venue: 'Truist Park', status: 'scheduled' },
        { id: 'game-5', awayTeam: 'MIL', homeTeam: 'CHC', time: '7:40 PM ET', venue: 'Wrigley Field', status: 'scheduled' },
      ],
      date,
      fetchedAt: new Date().toISOString(),
      error: message,
      fallback: true,
    };
    return NextResponse.json(fallback);
  }
}
