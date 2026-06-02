/**
 * MLB Data Service — MLB Analytics Shell
 *
 * TODO: migrate MLB data fetching logic from existing Vite backend services
 * TODO: connect to your MLB API provider (e.g. MLB Stats API, Sportradar, etc.)
 *
 * This service is responsible for:
 * - Fetching game schedules
 * - Fetching player stats
 * - Fetching odds data
 * - Normalizing data shapes for the frontend
 */

// TODO: import your HTTP client or SDK here
// import axios from 'axios';

const MLB_API_KEY = process.env.MLB_API_KEY || '';
const MLB_API_BASE = process.env.MLB_API_BASE_URL || 'https://statsapi.mlb.com/api/v1';

void MLB_API_KEY;
void MLB_API_BASE;

export const mlbDataService = {
  async getSchedule(_date: string) {
    // TODO: migrate schedule fetching from existing Vite backend
    console.warn('[mlbDataService] getSchedule not yet implemented');
    return [];
  },

  async getPlayerStats(_playerId: string) {
    // TODO: migrate player stats fetching from existing Vite backend
    console.warn('[mlbDataService] getPlayerStats not yet implemented');
    return null;
  },

  async getOdds(_gameId: string) {
    // TODO: migrate odds fetching from existing Vite backend
    console.warn('[mlbDataService] getOdds not yet implemented');
    return null;
  },
};
