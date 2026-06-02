/**
 * MockAdapter — returns static mock data for all API methods.
 * Default adapter when NEXT_PUBLIC_API_MODE is unset or "mock".
 *
 * TODO: Replace individual method bodies with real data calls when
 *       switching to FetchAdapter or a live data provider.
 */

class MockAdapter {
  constructor(config = {}) {
    this.config = config;
  }

  async getPlayers() {
    // TODO: Replace with real player endpoint
    return [];
  }

  async getGames(date) {
    // TODO: Replace with real games endpoint
    return [];
  }

  async getMatchup(pitcherId, batterId) {
    // TODO: Replace with real matchup endpoint
    return null;
  }

  async getPropLines(gameId) {
    // TODO: Replace with real prop lines endpoint
    return [];
  }

  async getAdvancedStats(playerId, options = {}) {
    // TODO: Replace with real advanced stats endpoint
    return null;
  }

  async getBettingLines(gameId) {
    // TODO: Replace with real betting lines endpoint
    return [];
  }

  async getWeather(venue) {
    // TODO: Replace with real weather endpoint
    return null;
  }

  async getParkFactors(parkId) {
    // TODO: Replace with real park factors endpoint
    return null;
  }
}

export default MockAdapter;