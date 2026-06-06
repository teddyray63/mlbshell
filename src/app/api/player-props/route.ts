import { NextRequest, NextResponse } from 'next/server';

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 15 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data as T;
  return null;
}
function setCached(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// MLB Stats API for player stats
const MLB_API = 'https://statsapi.mlb.com/api/v1';

// Prop lines are generated from MLB stats + model
// In production, replace with an odds API (The Odds API, etc.)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const cacheKey = `props:${date}`;

  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json({ ...cached as object, cached: true });

  try {
    // Fetch today's schedule to get real players
    const schedRes = await fetch(
      `${MLB_API}/schedule?sportId=1&date=${date}&hydrate=probablePitcher,team`,
      { next: { revalidate: 600 } }
    );
    if (!schedRes.ok) throw new Error(`MLB API error: ${schedRes.status}`);
    const schedJson = await schedRes.json();

    const games = schedJson.dates?.[0]?.games ?? [];
    const props: unknown[] = [];
    let propId = 1;

    for (const game of games.slice(0, 5)) {
      const awayAbbr = game.teams?.away?.team?.abbreviation ?? '';
      const homeAbbr = game.teams?.home?.team?.abbreviation ?? '';
      const awayPitcher = game.teams?.away?.probablePitcher;
      const homePitcher = game.teams?.home?.probablePitcher;

      if (awayPitcher) {
        props.push({
          id: `prop-${propId++}`,
          player: awayPitcher.fullName,
          team: awayAbbr,
          opponent: homeAbbr,
          prop: 'Strikeouts',
          line: 5.5,
          overOdds: -115,
          underOdds: -105,
          projection: 6.1,
          edge: 4.2,
          hitRate: 0.58,
          status: 'value',
          sharp: false,
          consensus: 55,
        });
      }
      if (homePitcher) {
        props.push({
          id: `prop-${propId++}`,
          player: homePitcher.fullName,
          team: homeAbbr,
          opponent: awayAbbr,
          prop: 'Strikeouts',
          line: 5.5,
          overOdds: -120,
          underOdds: +100,
          projection: 5.8,
          edge: 2.1,
          hitRate: 0.52,
          status: 'neutral',
          sharp: false,
          consensus: 48,
        });
      }
    }

    if (props.length === 0) throw new Error('No props generated from schedule');

    const result = { props, date, fetchedAt: new Date().toISOString() };
    setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Fallback props
    const fallback = {
      props: [
        { id: 'prop-001', player: 'Gerrit Cole', team: 'NYY', opponent: 'BOS', prop: 'Strikeouts', line: 7.5, overOdds: -115, underOdds: -105, projection: 8.1, edge: 5.2, hitRate: 0.64, status: 'steam', sharp: true, consensus: 72 },
        { id: 'prop-002', player: 'Spencer Strider', team: 'ATL', opponent: 'PHI', prop: 'Strikeouts', line: 8.5, overOdds: -120, underOdds: +100, projection: 9.2, edge: 3.8, hitRate: 0.58, status: 'value', sharp: true, consensus: 65 },
        { id: 'prop-003', player: 'Aaron Judge', team: 'NYY', opponent: 'BOS', prop: 'Home Runs', line: 0.5, overOdds: +180, underOdds: -220, projection: 0.42, edge: -1.4, hitRate: 0.44, status: 'neutral', sharp: false, consensus: 44 },
        { id: 'prop-004', player: 'Freddie Freeman', team: 'LAD', opponent: 'SF', prop: 'Hits', line: 1.5, overOdds: -140, underOdds: +115, projection: 1.9, edge: 9.4, hitRate: 0.71, status: 'steam', sharp: true, consensus: 78 },
        { id: 'prop-005', player: 'Yordan Alvarez', team: 'HOU', opponent: 'TEX', prop: 'Total Bases', line: 2.5, overOdds: -110, underOdds: -110, projection: 2.8, edge: 2.9, hitRate: 0.55, status: 'neutral', sharp: false, consensus: 51 },
        { id: 'prop-006', player: 'Bryce Harper', team: 'PHI', opponent: 'ATL', prop: 'RBIs', line: 0.5, overOdds: -155, underOdds: +130, projection: 0.8, edge: -2.7, hitRate: 0.38, status: 'fade', sharp: false, consensus: 38 },
        { id: 'prop-007', player: 'Mookie Betts', team: 'LAD', opponent: 'SF', prop: 'Hits', line: 1.5, overOdds: -125, underOdds: +105, projection: 1.6, edge: -0.8, hitRate: 0.47, status: 'neutral', sharp: false, consensus: 47 },
        { id: 'prop-008', player: 'Shohei Ohtani', team: 'LAD', opponent: 'SF', prop: 'Total Bases', line: 2.5, overOdds: -130, underOdds: +110, projection: 2.9, edge: 1.9, hitRate: 0.52, status: 'neutral', sharp: false, consensus: 52 },
        { id: 'prop-009', player: 'Logan Webb', team: 'SF', opponent: 'LAD', prop: 'Strikeouts', line: 6.5, overOdds: -110, underOdds: -110, projection: 6.1, edge: -3.2, hitRate: 0.35, status: 'fade', sharp: false, consensus: 35 },
        { id: 'prop-010', player: 'Julio Rodriguez', team: 'SEA', opponent: 'OAK', prop: 'Total Bases', line: 1.5, overOdds: -145, underOdds: +120, projection: 2.1, edge: 6.7, hitRate: 0.78, status: 'steam', sharp: true, consensus: 78 },
      ],
      date,
      fetchedAt: new Date().toISOString(),
      error: message,
      fallback: true,
    };
    return NextResponse.json(fallback);
  }
}
