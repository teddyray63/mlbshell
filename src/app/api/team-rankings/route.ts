import { NextRequest, NextResponse } from 'next/server';

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  return null;
}
function setCached(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// MLB Stats API
const MLB_API = 'https://statsapi.mlb.com/api/v1';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const season = searchParams.get('season') || new Date().getFullYear().toString();
  const division = searchParams.get('division') || 'all';
  const cacheKey = `standings:${season}:${division}`;

  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json({ ...cached as object, cached: true });

  try {
    const res = await fetch(
      `${MLB_API}/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason&hydrate=team,division,league`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) throw new Error(`MLB API error: ${res.status}`);
    const json = await res.json();

    const divisionMap: Record<string, string> = {
      '201': 'AL East', '202': 'AL Central', '200': 'AL West',
      '204': 'NL East', '205': 'NL Central', '203': 'NL West',
    };

    const teams: unknown[] = [];
    let rank = 1;
    for (const record of (json.records ?? [])) {
      const divName = divisionMap[String(record.division?.id)] ?? record.division?.name ?? '';
      for (const tr of (record.teamRecords ?? [])) {
        teams.push({
          rank: rank++,
          team: tr.team?.name ?? '',
          abbrev: tr.team?.abbreviation ?? '',
          division: divName,
          wins: tr.wins ?? 0,
          losses: tr.losses ?? 0,
          pct: tr.winningPercentage ?? '.000',
          gb: tr.gamesBack === '-' ? '-' : tr.gamesBack ?? '-',
          rs: tr.runsScored ?? 0,
          ra: tr.runsAllowed ?? 0,
          streak: tr.streak?.streakCode ?? '',
          last10: tr.records?.splitRecords?.find((s: Record<string, string>) => s.type === 'lastTen')?.wins + '-' + tr.records?.splitRecords?.find((s: Record<string, string>) => s.type === 'lastTen')?.losses ?? '',
        });
      }
    }

    const result = { teams, season, fetchedAt: new Date().toISOString() };
    setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const fallback = {
      teams: [
        { rank: 1, team: 'Los Angeles Dodgers', abbrev: 'LAD', division: 'NL West', wins: 42, losses: 20, pct: '.677', gb: '-', rs: 312, ra: 198, streak: 'W3', last10: '7-3' },
        { rank: 2, team: 'Atlanta Braves', abbrev: 'ATL', division: 'NL East', wins: 38, losses: 24, pct: '.613', gb: '4.0', rs: 289, ra: 221, streak: 'W1', last10: '6-4' },
        { rank: 3, team: 'New York Yankees', abbrev: 'NYY', division: 'AL East', wins: 37, losses: 25, pct: '.597', gb: '5.0', rs: 278, ra: 230, streak: 'L1', last10: '5-5' },
        { rank: 4, team: 'Houston Astros', abbrev: 'HOU', division: 'AL West', wins: 36, losses: 26, pct: '.581', gb: '6.0', rs: 265, ra: 240, streak: 'W2', last10: '6-4' },
        { rank: 5, team: 'Philadelphia Phillies', abbrev: 'PHI', division: 'NL East', wins: 35, losses: 27, pct: '.565', gb: '7.0', rs: 258, ra: 245, streak: 'W1', last10: '5-5' },
        { rank: 6, team: 'Baltimore Orioles', abbrev: 'BAL', division: 'AL East', wins: 34, losses: 28, pct: '.548', gb: '8.0', rs: 248, ra: 238, streak: 'L2', last10: '4-6' },
        { rank: 7, team: 'Minnesota Twins', abbrev: 'MIN', division: 'AL Central', wins: 33, losses: 29, pct: '.532', gb: '9.0', rs: 241, ra: 242, streak: 'W1', last10: '5-5' },
      ],
      season,
      fetchedAt: new Date().toISOString(),
      error: message,
      fallback: true,
    };
    return NextResponse.json(fallback);
  }
}
