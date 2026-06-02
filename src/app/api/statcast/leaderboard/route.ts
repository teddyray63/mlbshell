'use server';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Statcast Leaderboard Proxy Route
 * Fetches from Baseball Savant custom leaderboard CSV endpoint and returns parsed JSON.
 * Endpoint: GET /api/statcast/leaderboard?year=2026&min=50&type=batter
 */

const SAVANT_BASE = 'https://baseballsavant.mlb.com';

// Columns we request from the custom leaderboard
const COLUMNS = [
  'player_id',
  'player_name',
  'team_id',
  'team_name',
  'position',
  'pa',
  'ab',
  'avg',
  'obp',
  'slg',
  'woba',
  'xwoba',
  'exit_velocity_avg',
  'barrel_batted_rate',
  'hard_hit_percent',
  'k_percent',
  'bb_percent',
  'iso',
  'babip',
].join(',');

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });
    return row;
  });
}

function safeNum(val: string | undefined, decimals = 3): number | null {
  if (!val || val === '' || val === 'null' || val === 'NA') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : parseFloat(n.toFixed(decimals));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const min = searchParams.get('min') || '50';
  const type = searchParams.get('type') || 'batter';

  // Baseball Savant custom leaderboard CSV URL
  const savantUrl =
    `${SAVANT_BASE}/leaderboard/custom?` +
    new URLSearchParams({
      year,
      type,
      min,
      sort: 'woba',
      sortDir: 'desc',
      csv: 'true',
    }).toString();

  try {
    const response = await fetch(savantUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MLBShell/1.0; +https://mlbshell4085.builtwithrocket.new)',
        Accept: 'text/csv,text/plain,*/*',
      },
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Baseball Savant returned ${response.status}`, players: [] },
        { status: 502 }
      );
    }

    const csv = await response.text();
    const rows = parseCSV(csv);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data returned from Statcast', players: [] }, { status: 502 });
    }

    const players = rows
      .filter((r) => r.player_name && r.player_name !== '')
      .map((r) => ({
        id: r.player_id || r.mlbam_id || '',
        name: r.player_name || r.name || '',
        team: r.team_name_abbrev || r.team_id || '',
        position: r.pos || r.position || '',
        pa: parseInt(r.pa || '0', 10),
        ab: parseInt(r.ab || '0', 10),
        avg: safeNum(r.avg, 3),
        obp: safeNum(r.obp, 3),
        slg: safeNum(r.slg, 3),
        woba: safeNum(r.woba, 3),
        xwoba: safeNum(r.xwoba, 3),
        exitVelocityAvg: safeNum(r.exit_velocity_avg, 1),
        barrelRate: safeNum(r.barrel_batted_rate, 1),
        hardHitPct: safeNum(r.hard_hit_percent, 1),
        kPct: safeNum(r.k_percent, 1),
        bbPct: safeNum(r.bb_percent, 1),
        iso: safeNum(r.iso, 3),
        babip: safeNum(r.babip, 3),
      }));

    return NextResponse.json({ players, year, fetchedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message, players: [] }, { status: 500 });
  }
}
