/**
 * FetchAdapter — live HTTP adapter using NEXT_PUBLIC_API_BASE_URL.
 * Activated when NEXT_PUBLIC_API_MODE=fetch.
 *
 * TODO: Implement each method body with real fetch calls.
 *       All scraping/heavy processing must live in /server or Next.js API routes.
 */

class FetchAdapter {
  constructor(config = {}) {
    this.baseUrl    = config?.baseUrl    || '';
    this.mlbApiKey  = config?.mlbApiKey  || '';
    this.weatherKey = config?.weatherKey || '';
  }

  async _get(path, params = {}) {
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(params)?.forEach(([k, v]) => url?.searchParams?.set(k, v));
    const res = await fetch(url?.toString(), {
      headers: {
        'Authorization': `Bearer ${this.mlbApiKey}`,
        'Content-Type':  'application/json',
      },
    });
    if (!res?.ok) throw new Error(`FetchAdapter: ${res.status} ${res.statusText} — ${path}`);
    return res?.json();
  }

  async getPlayers() {
    // TODO: return this._get('/players');
    return [];
  }

  async getGames(date) {
    // TODO: return this._get('/games', { date });
    return [];
  }

  async getMatchup(pitcherId, batterId) {
    // TODO: return this._get(`/matchup/${pitcherId}/${batterId}`);
    return null;
  }

  async getPropLines(gameId) {
    // TODO: return this._get(`/props/${gameId}`);
    return [];
  }

  async getAdvancedStats(playerId, options = {}) {
    // TODO: return this._get(`/stats/advanced/${playerId}`, options);
    return null;
  }

  async getBettingLines(gameId) {
    // TODO: return this._get(`/betting/${gameId}`);
    return [];
  }

  async getWeather(venue) {
    // TODO: return this._get('/weather', { venue });
    return null;
  }

  async getParkFactors(parkId) {
    // TODO: return this._get(`/park/${parkId}/factors`);
    return null;
  }
}

export default FetchAdapter;