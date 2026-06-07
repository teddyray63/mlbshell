/**
 * FetchAdapter — live HTTP adapter using NEXT_PUBLIC_API_BASE_URL.
 * Activated when NEXT_PUBLIC_API_MODE=fetch.
 *
 * Talks to the Express backend in /server. The JWT is sent via the
 * Authorization: Bearer header (held in memory by the client store).
 */

class FetchAdapter {
  constructor(config = {}) {
    this.baseUrl = config?.baseUrl || '';
    this.mlbApiKey = config?.mlbApiKey || '';
    this.weatherKey = config?.weatherKey || '';
    this.authToken = null;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  setCurrentUser() {
    /* no-op: server resolves the user from the Bearer token */
  }

  _headers() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;
    return headers;
  }

  async _get(path, params = {}) {
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(params)?.forEach(([k, v]) => {
      if (v != null) url?.searchParams?.set(k, v);
    });
    const res = await fetch(url?.toString(), {
      headers: this._headers(),
    });
    if (!res?.ok) {
      throw new Error(`FetchAdapter: ${res.status} ${res.statusText} — ${path}`);
    }
    const json = await res?.json();
    return json?.data !== undefined ? json.data : json;
  }

  async _send(method, path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this._headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      throw new Error(json?.error || `FetchAdapter: ${res.status} — ${path}`);
    }
    return json?.data !== undefined ? json.data : json;
  }

  async getPlayers() {
    return this._get('/api/players');
  }

  async getGames(date) {
    return this._get('/api/games', { date });
  }

  async getMatchup(gameId, date) {
    return this._get(`/api/matchup/${gameId}`, { date });
  }

  async getStatcastLeaderboard(stat = 'barrel') {
    return this._get('/api/matchup/leaderboard/statcast', { stat });
  }

  async getHRTargets(options = {}) {
    return this._get('/api/hr-targets', options);
  }

  async getDeepDive(playerId) {
    return this._get(`/api/deep-dive/${encodeURIComponent(playerId)}`);
  }

  async getDeepDiveList() {
    return this._get('/api/deep-dive');
  }

  async getPlayerPage(playerId) {
    return this._get(`/api/players/${encodeURIComponent(playerId)}`);
  }

  async getStatsPage(date) {
    return this._get('/api/stats', { date });
  }

  async getPropLines(gameId) {
    return this._get('/api/player-props', { gameId });
  }

  async getPropCalculations() {
    return this._get('/api/player-props');
  }

  async getPropCalculation(playerId) {
    const all = await this.getPropCalculations();
    return Array.isArray(all) ? all.find((c) => c.playerId === playerId) || null : null;
  }

  async getAdvancedStats(playerId, options = {}) {
    return this._get(`/api/analytics/advanced-stats`, { playerId, ...options });
  }

  async getAnalytics() {
    return this._get('/api/analytics/advanced-stats');
  }

  async getBettingLines(gameId) {
    return this._get(`/api/betting/${gameId}`);
  }

  async getWeather(venue) {
    return this._get(`/api/weather/${encodeURIComponent(venue)}`);
  }

  async getAllWeather() {
    return this._get('/api/weather');
  }

  async getParkFactors(parkId) {
    return this._get(`/api/matchup/park/${encodeURIComponent(parkId)}/factors`);
  }

  async getTeamRankings(division) {
    return this._get('/api/team-rankings', { division });
  }

  async getSavedEdges() {
    return this._get('/api/saved-edges');
  }

  async saveEdge(edge) {
    return this._send('POST', '/api/saved-edges', edge);
  }

  async deleteEdge(id) {
    return this._send('DELETE', `/api/saved-edges/${id}`);
  }

  async login(email, password) {
    return this._send('POST', '/api/auth/login', { email, password });
  }

  async register(email, password) {
    return this._send('POST', '/api/auth/register', { email, password });
  }

  async logout() {
    return this._send('POST', '/api/auth/logout');
  }
}

export default FetchAdapter;
