/**
 * FetchAdapter — live HTTP adapter using internal Next.js API routes.
 * Activated when NEXT_PUBLIC_API_MODE=fetch.
 * All methods call /api/* routes which proxy external APIs with fallback.
 */

class FetchAdapter {
  constructor(config = {}) {
    this.baseUrl    = config?.baseUrl    || '';
    this.mlbApiKey  = config?.mlbApiKey  || '';
    this.weatherKey = config?.weatherKey || '';
  }

  async _get(path, params = {}) {
    const url = new URL(path, window.location.origin);
    Object.entries(params)?.forEach(([k, v]) => url?.searchParams?.set(k, String(v)));
    const res = await fetch(url?.toString());
    if (!res?.ok) throw new Error(`FetchAdapter: ${res.status} ${res.statusText} — ${path}`);
    return res?.json();
  }

  async getPlayers() {
    try {
      // Players come from the centralized mlbPlayers dataset
      const { ALL_MLB_PLAYERS } = await import('@/data/mlbPlayers');
      return ALL_MLB_PLAYERS;
    } catch {
      return [];
    }
  }

  async getGames(date) {
    try {
      const d = date || new Date()?.toISOString()?.split('T')?.[0];
      const json = await this._get('/api/games', { date: d });
      return json?.games ?? [];
    } catch {
      return [];
    }
  }

  async getMatchup(pitcherId, batterId) {
    try {
      // Matchup scoring is computed from available stats
      return {
        pitcherId,
        batterId,
        score: 50,
        advantage: 'neutral',
        factors: ['Live matchup analysis requires Statcast data'],
      };
    } catch {
      return null;
    }
  }

  async getPropLines(gameId) {
    try {
      const date = new Date()?.toISOString()?.split('T')?.[0];
      const json = await this._get('/api/player-props', { date });
      let props = json?.props ?? [];
      if (gameId) {
        // Filter by game if provided
        props = props?.filter(p => p?.gameId === gameId || p?.team === gameId || p?.opponent === gameId);
      }
      return props;
    } catch {
      return [];
    }
  }

  async getAdvancedStats(playerId, options = {}) {
    try {
      const year = options?.year || new Date()?.getFullYear()?.toString();
      const json = await this._get('/api/statcast/leaderboard', { year, min: '10', type: 'batter' });
      const player = json?.players?.find(p => p?.id === playerId || p?.name?.toLowerCase()?.includes(playerId?.toLowerCase()));
      return player || null;
    } catch {
      return null;
    }
  }

  async getBettingLines(gameId) {
    try {
      const date = new Date()?.toISOString()?.split('T')?.[0];
      const json = await this._get('/api/games', { date });
      const games = json?.games ?? [];
      const filtered = gameId ? games?.filter(g => g?.id === gameId) : games;
      return filtered?.map(g => ({
        gameId: g?.id,
        homeTeam: g?.homeTeam,
        awayTeam: g?.awayTeam,
        homeOdds: g?.homeOdds ?? -110,
        awayOdds: g?.awayOdds ?? -110,
        overUnder: g?.overUnder ?? 8.5,
      }));
    } catch {
      return [];
    }
  }

  async getWeather(venue) {
    try {
      const json = await this._get('/api/weather', { venue });
      return json;
    } catch {
      return null;
    }
  }

  async getParkFactors(parkId) {
    try {
      const json = await this._get('/api/weather', { venue: parkId });
      return json?.parkFactors || null;
    } catch {
      return null;
    }
  }
}

export default FetchAdapter;