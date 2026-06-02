/**
 * Mock Data — MLB Analytics Shell
 *
 * TODO: Replace all mock data with real API calls via apiClient
 * TODO: migrate data shapes to match your existing Vite app's API response types
 *
 * Usage:
 *   import { mockGames, mockPlayerProps, mockWeather, mockAnalyticsCards } from '@/data/mockData';
 */

// ─── Games ────────────────────────────────────────────────────────────────────

export interface MockGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'final';
  inning?: string;
  homeOdds?: number;
  awayOdds?: number;
  overUnder?: number;
}

export const mockGames: MockGame[] = [
  {
    id: 'game-1',
    homeTeam: 'NYY',
    awayTeam: 'BOS',
    time: '1:05 PM',
    venue: 'Yankee Stadium',
    status: 'scheduled',
    homeOdds: -145,
    awayOdds: +125,
    overUnder: 9.0,
  },
  {
    id: 'game-2',
    homeTeam: 'LAD',
    awayTeam: 'SF',
    time: '4:10 PM',
    venue: 'Dodger Stadium',
    status: 'scheduled',
    homeOdds: -165,
    awayOdds: +140,
    overUnder: 8.5,
  },
  {
    id: 'game-3',
    homeTeam: 'HOU',
    awayTeam: 'TEX',
    homeScore: 3,
    awayScore: 2,
    time: 'LIVE',
    venue: 'Minute Maid Park',
    status: 'live',
    inning: 'T7',
  },
  {
    id: 'game-4',
    homeTeam: 'ATL',
    awayTeam: 'PHI',
    homeScore: 5,
    awayScore: 3,
    time: 'F',
    venue: 'Truist Park',
    status: 'final',
  },
  {
    id: 'game-5',
    homeTeam: 'CHC',
    awayTeam: 'MIL',
    time: '7:40 PM',
    venue: 'Wrigley Field',
    status: 'scheduled',
    homeOdds: +110,
    awayOdds: -130,
    overUnder: 8.0,
  },
];

// ─── Player Props ─────────────────────────────────────────────────────────────

export interface MockPlayerProp {
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
}

export const mockPlayerProps: MockPlayerProp[] = [
  {
    id: 'prop-1',
    player: 'Placeholder Hitter A',
    team: 'NYY',
    opponent: 'BOS',
    prop: 'Hits',
    line: 1.5,
    overOdds: -115,
    underOdds: -105,
    projection: 1.8,
    edge: 7.2,
    hitRate: 0.64,
  },
  {
    id: 'prop-2',
    player: 'Placeholder Pitcher B',
    team: 'LAD',
    opponent: 'SF',
    prop: 'Strikeouts',
    line: 7.5,
    overOdds: -120,
    underOdds: +100,
    projection: 8.1,
    edge: 5.8,
    hitRate: 0.58,
  },
  {
    id: 'prop-3',
    player: 'Placeholder Hitter C',
    team: 'HOU',
    opponent: 'TEX',
    prop: 'Total Bases',
    line: 2.5,
    overOdds: +105,
    underOdds: -125,
    projection: 2.3,
    edge: -3.1,
    hitRate: 0.44,
  },
  {
    id: 'prop-4',
    player: 'Placeholder Hitter D',
    team: 'ATL',
    opponent: 'PHI',
    prop: 'RBIs',
    line: 0.5,
    overOdds: -140,
    underOdds: +115,
    projection: 0.9,
    edge: 9.4,
    hitRate: 0.71,
  },
  {
    id: 'prop-5',
    player: 'Placeholder Pitcher E',
    team: 'CHC',
    opponent: 'MIL',
    prop: 'Innings Pitched',
    line: 5.5,
    overOdds: -110,
    underOdds: -110,
    projection: 5.8,
    edge: 2.1,
    hitRate: 0.52,
  },
];

// ─── Weather ──────────────────────────────────────────────────────────────────

export interface MockWeather {
  id: string;
  venue: string;
  city: string;
  gameId: string;
  temp: number;
  feelsLike: number;
  windSpeed: number;
  windDir: string;
  humidity: number;
  condition: string;
  precipitation: number;
  parkFactor: number;
  windImpact: 'boost' | 'suppress' | 'neutral';
}

export const mockWeather: MockWeather[] = [
  {
    id: 'wx-1',
    venue: 'Yankee Stadium',
    city: 'New York, NY',
    gameId: 'game-1',
    temp: 72,
    feelsLike: 70,
    windSpeed: 12,
    windDir: 'Out to CF',
    humidity: 55,
    condition: 'Partly Cloudy',
    precipitation: 0,
    parkFactor: 1.08,
    windImpact: 'boost',
  },
  {
    id: 'wx-2',
    venue: 'Dodger Stadium',
    city: 'Los Angeles, CA',
    gameId: 'game-2',
    temp: 78,
    feelsLike: 76,
    windSpeed: 6,
    windDir: 'In from LF',
    humidity: 42,
    condition: 'Clear',
    precipitation: 0,
    parkFactor: 0.96,
    windImpact: 'suppress',
  },
  {
    id: 'wx-3',
    venue: 'Minute Maid Park',
    city: 'Houston, TX',
    gameId: 'game-3',
    temp: 85,
    feelsLike: 91,
    windSpeed: 0,
    windDir: 'Dome',
    humidity: 68,
    condition: 'Dome',
    precipitation: 0,
    parkFactor: 1.02,
    windImpact: 'neutral',
  },
  {
    id: 'wx-4',
    venue: 'Wrigley Field',
    city: 'Chicago, IL',
    gameId: 'game-5',
    temp: 65,
    feelsLike: 62,
    windSpeed: 18,
    windDir: 'Out to CF',
    humidity: 61,
    condition: 'Overcast',
    precipitation: 10,
    parkFactor: 1.12,
    windImpact: 'boost',
  },
];

// ─── Analytics Cards ──────────────────────────────────────────────────────────

export interface MockAnalyticsCard {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description?: string;
}

export const mockAnalyticsCards: MockAnalyticsCard[] = [
  {
    id: 'card-1',
    label: 'Games Today',
    value: '15',
    change: '+2 vs yesterday',
    trend: 'up',
    description: 'Total MLB games scheduled today',
  },
  {
    id: 'card-2',
    label: 'Avg Over/Under',
    value: '8.7',
    change: '-0.3 vs season avg',
    trend: 'down',
    description: 'Average total runs line across all games',
  },
  {
    id: 'card-3',
    label: 'High-Edge Props',
    value: '24',
    change: '+6 vs yesterday',
    trend: 'up',
    description: 'Props with edge > 5%',
  },
  {
    id: 'card-4',
    label: 'Weather Alerts',
    value: '3',
    change: 'Wind > 15mph',
    trend: 'neutral',
    description: 'Games with significant weather impact',
  },
];
