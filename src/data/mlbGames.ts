/**
 * mlbGames.ts — Centralized MLB Games Dataset/Service
 * Provides today's and upcoming games data with fallback mock data.
 */

export interface MLBGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  homeScore?: number;
  awayScore?: number;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'final' | 'postponed';
  inning?: string;
  homeOdds?: number;
  awayOdds?: number;
  overUnder?: number;
  homePitcher?: string;
  awayPitcher?: string;
  date: string; // YYYY-MM-DD
}

import { MLB_TEAM_FULL_NAMES } from './mlbPlayers';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const MOCK_GAMES: MLBGame[] = [
  {
    id: 'game-nyy-bos',
    homeTeam: 'NYY',
    awayTeam: 'BOS',
    homeTeamFull: MLB_TEAM_FULL_NAMES['NYY'],
    awayTeamFull: MLB_TEAM_FULL_NAMES['BOS'],
    time: '1:05 PM',
    venue: 'Yankee Stadium',
    status: 'scheduled',
    homeOdds: -145,
    awayOdds: 125,
    overUnder: 9.0,
    homePitcher: 'Gerrit Cole',
    awayPitcher: 'Garrett Crochet',
    date: todayStr(),
  },
  {
    id: 'game-lad-sf',
    homeTeam: 'LAD',
    awayTeam: 'SF',
    homeTeamFull: MLB_TEAM_FULL_NAMES['LAD'],
    awayTeamFull: MLB_TEAM_FULL_NAMES['SF'],
    time: '4:10 PM',
    venue: 'Dodger Stadium',
    status: 'scheduled',
    homeOdds: -165,
    awayOdds: 140,
    overUnder: 8.5,
    homePitcher: 'Tyler Glasnow',
    awayPitcher: 'Logan Webb',
    date: todayStr(),
  },
  {
    id: 'game-hou-tex',
    homeTeam: 'HOU',
    awayTeam: 'TEX',
    homeTeamFull: MLB_TEAM_FULL_NAMES['HOU'],
    awayTeamFull: MLB_TEAM_FULL_NAMES['TEX'],
    homeScore: 3,
    awayScore: 2,
    time: 'LIVE',
    venue: 'Minute Maid Park',
    status: 'live',
    inning: 'T7',
    homePitcher: 'Framber Valdez',
    awayPitcher: 'Nathan Eovaldi',
    date: todayStr(),
  },
  {
    id: 'game-atl-phi',
    homeTeam: 'ATL',
    awayTeam: 'PHI',
    homeTeamFull: MLB_TEAM_FULL_NAMES['ATL'],
    awayTeamFull: MLB_TEAM_FULL_NAMES['PHI'],
    homeScore: 5,
    awayScore: 3,
    time: 'F',
    venue: 'Truist Park',
    status: 'final',
    homePitcher: 'Chris Sale',
    awayPitcher: 'Zack Wheeler',
    date: todayStr(),
  },
  {
    id: 'game-chc-mil',
    homeTeam: 'CHC',
    awayTeam: 'MIL',
    homeTeamFull: MLB_TEAM_FULL_NAMES['CHC'],
    awayTeamFull: MLB_TEAM_FULL_NAMES['MIL'],
    time: '7:40 PM',
    venue: 'Wrigley Field',
    status: 'scheduled',
    homeOdds: 110,
    awayOdds: -130,
    overUnder: 8.0,
    homePitcher: 'Justin Steele',
    awayPitcher: 'Freddy Peralta',
    date: todayStr(),
  },
  {
    id: 'game-bal-tor',
    homeTeam: 'BAL',
    awayTeam: 'TOR',
    homeTeamFull: MLB_TEAM_FULL_NAMES['BAL'],
    awayTeamFull: MLB_TEAM_FULL_NAMES['TOR'],
    time: '7:05 PM',
    venue: 'Camden Yards',
    status: 'scheduled',
    homeOdds: -120,
    awayOdds: 100,
    overUnder: 8.5,
    homePitcher: 'Corbin Burnes',
    awayPitcher: 'Kevin Gausman',
    date: todayStr(),
  },
  {
    id: 'game-sea-min',
    homeTeam: 'SEA',
    awayTeam: 'MIN',
    homeTeamFull: MLB_TEAM_FULL_NAMES['SEA'],
    awayTeamFull: MLB_TEAM_FULL_NAMES['MIN'],
    time: '9:40 PM',
    venue: 'T-Mobile Park',
    status: 'scheduled',
    homeOdds: -105,
    awayOdds: -115,
    overUnder: 7.5,
    homePitcher: 'George Kirby',
    awayPitcher: 'Pablo López',
    date: todayStr(),
  },
  {
    id: 'game-sd-ari',
    homeTeam: 'SD',
    awayTeam: 'ARI',
    homeTeamFull: MLB_TEAM_FULL_NAMES['SD'],
    awayTeamFull: MLB_TEAM_FULL_NAMES['ARI'],
    time: '9:40 PM',
    venue: 'Petco Park',
    status: 'scheduled',
    homeOdds: -130,
    awayOdds: 110,
    overUnder: 8.0,
    homePitcher: 'Dylan Cease',
    awayPitcher: 'Zac Gallen',
    date: todayStr(),
  },
  {
    id: 'game-cle-det',
    homeTeam: 'CLE',
    awayTeam: 'DET',
    homeTeamFull: MLB_TEAM_FULL_NAMES['CLE'],
    awayTeamFull: MLB_TEAM_FULL_NAMES['DET'],
    time: '6:40 PM',
    venue: 'Progressive Field',
    status: 'scheduled',
    homeOdds: -110,
    awayOdds: -110,
    overUnder: 7.5,
    homePitcher: 'Shane Bieber',
    awayPitcher: 'Tarik Skubal',
    date: todayStr(),
  },
  {
    id: 'game-nym-wsh',
    homeTeam: 'NYM',
    awayTeam: 'WSH',
    homeTeamFull: MLB_TEAM_FULL_NAMES['NYM'],
    awayTeamFull: MLB_TEAM_FULL_NAMES['WSH'],
    time: '7:10 PM',
    venue: 'Citi Field',
    status: 'scheduled',
    homeOdds: -150,
    awayOdds: 130,
    overUnder: 8.5,
    homePitcher: 'Kodai Senga',
    awayPitcher: 'MacKenzie Gore',
    date: todayStr(),
  },
];

/**
 * Fetch today's games — tries API first, falls back to mock data
 */
export async function fetchTodaysGames(): Promise<MLBGame[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`/api/games?date=${today}`);
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    if (json.games && json.games.length > 0) {
      return json.games.map((g: MLBGame) => ({
        ...g,
        homeTeamFull: MLB_TEAM_FULL_NAMES[g.homeTeam] ?? g.homeTeam,
        awayTeamFull: MLB_TEAM_FULL_NAMES[g.awayTeam] ?? g.awayTeam,
        date: today,
      }));
    }
  } catch {
    // fall through to mock
  }
  return MOCK_GAMES;
}

/**
 * Get game label for display
 */
export function getGameLabel(game: MLBGame): string {
  return `${game.awayTeam} @ ${game.homeTeam}`;
}

/**
 * Get games involving a specific team
 */
export function getGamesByTeam(games: MLBGame[], team: string): MLBGame[] {
  return games.filter((g) => g.homeTeam === team || g.awayTeam === team);
}
