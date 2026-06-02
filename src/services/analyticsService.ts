/**
 * analyticsService.ts — business logic layer between API client and UI components.
 * TODO: Implement each function body when connecting real data.
 * All scraping and heavy computation belongs in /server or Next.js API routes.
 */

import apiClient from '@/api/client';

export async function fetchAdvancedStats(playerId: string, options: Record<string, string> = {}) {
  // TODO: return apiClient.getAdvancedStats(playerId, options);
  return null;
}

export async function fetchMatchup(pitcherId: string, batterId: string) {
  // TODO: return apiClient.getMatchup(pitcherId, batterId);
  return null;
}

export async function fetchTodayPropLines(gameIds: string[]) {
  // TODO: return Promise.all(gameIds.map(id => apiClient.getPropLines(id)));
  return [];
}

export async function fetchBettingLines(gameId: string) {
  // TODO: return apiClient.getBettingLines(gameId);
  return [];
}

export async function fetchWeatherAndPark(venue: string) {
  // TODO: return Promise.all([apiClient.getWeather(venue), apiClient.getParkFactors(venue)]);
  return [null, null];
}