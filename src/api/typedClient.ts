/**
 * typedClient — typed view over the JS apiClient singleton so page components
 * get full type-safety on responses. The underlying adapter (mock/fetch) is
 * selected in client.js by NEXT_PUBLIC_API_MODE.
 */

import apiClient from './client';
import type {
  Game,
  PlayerProp,
  PropCalculation,
  WeatherCondition,
  TeamRanking,
  AnalyticsData,
  SavedEdge,
  PublicUser,
  MatchupGame,
  ParkFactor,
} from '../../shared/types';

export interface StatLeaderEntry {
  name: string;
  value: number;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export interface ApiClient {
  setAuthToken(token: string | null): void;
  setCurrentUser(userId: string | null): void;
  getGames(date?: string): Promise<Game[]>;
  getPropLines(gameId?: string): Promise<PlayerProp[]>;
  getPropCalculations(): Promise<PropCalculation[]>;
  getPropCalculation(playerId: string): Promise<PropCalculation | null>;
  getMatchup(gameId: string, date?: string): Promise<MatchupGame | null>;
  getStatcastLeaderboard(stat?: 'barrel' | 'xwoba' | 'exitVelo'): Promise<StatLeaderEntry[]>;
  getParkFactors(venue: string): Promise<ParkFactor | null>;
  getWeather(venue: string): Promise<WeatherCondition | null>;
  getAllWeather(): Promise<WeatherCondition[]>;
  getTeamRankings(division?: string): Promise<TeamRanking[]>;
  getAnalytics(): Promise<AnalyticsData>;
  getSavedEdges(): Promise<SavedEdge[]>;
  saveEdge(edge: Partial<SavedEdge>): Promise<SavedEdge>;
  deleteEdge(id: string): Promise<{ success: boolean }>;
  login(email: string, password: string): Promise<AuthResult>;
  register(email: string, password: string): Promise<AuthResult>;
  logout(): Promise<{ success: boolean }>;
}

const typedClient = apiClient as unknown as ApiClient;

export default typedClient;
