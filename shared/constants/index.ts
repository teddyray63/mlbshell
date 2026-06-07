/**
 * Shared Constants — MLB Analytics Shell
 *
 * TODO: migrate constants from existing Vite app (teams list, API endpoints, etc.)
 */

export const MLB_TEAMS = [
  'ARI',
  'ATL',
  'BAL',
  'BOS',
  'CHC',
  'CWS',
  'CIN',
  'CLE',
  'COL',
  'DET',
  'HOU',
  'KC',
  'LAA',
  'LAD',
  'MIA',
  'MIL',
  'MIN',
  'NYM',
  'NYY',
  'OAK',
  'PHI',
  'PIT',
  'SD',
  'SF',
  'SEA',
  'STL',
  'TB',
  'TEX',
  'TOR',
  'WSH',
] as const;

export type MLBTeam = (typeof MLB_TEAMS)[number];

export const PROP_TYPES = [
  'Hits',
  'Total Bases',
  'RBIs',
  'Runs Scored',
  'Home Runs',
  'Strikeouts (Batter)',
  'Strikeouts (Pitcher)',
  'Walks',
  'Innings Pitched',
  'Earned Runs',
  'Hits Allowed',
] as const;

export type PropType = (typeof PROP_TYPES)[number];

export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

// TODO: update API_ENDPOINTS to match your existing backend routes
export const API_ENDPOINTS = {
  games: '/api/games',
  playerProps: '/api/player-props',
  weather: '/api/weather',
  teamRankings: '/api/team-rankings',
  savedEdges: '/api/saved-edges',
  analytics: '/api/analytics',
  matchup: '/api/matchup',
} as const;
