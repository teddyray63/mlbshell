/**
 * MockAdapter — returns realistic, self-consistent mock data for all API methods.
 * Default adapter when NEXT_PUBLIC_API_MODE is unset or "mock".
 *
 * Prop calculations are produced by the shared engine (shared/propMath) so the
 * frontend consumes real calculateProps output even in mock mode. Auth and
 * saved-edges are persisted client-side in localStorage and scoped per user.
 */

import { buildPropCalculations } from '../../../shared/propMath';
import { enrichCalculation, enrichPlayerProp } from '../../../shared/enrich';
import { buildGateVerdicts } from '../../../shared/gateLogic';
import {
  mockGameList,
  mockWeatherList,
  mockPlayerPropInputs,
  mockTeamRankings,
  mockSavedEdgesSeed,
  mockAnalyticsData,
  mockPlayerEnrichment,
} from '../../data/mockProps';
import {
  buildMockMatchup,
  buildMockHRTargets,
  buildMockDeepDive,
  buildMockDeepDiveList,
  buildMockPlayerPage,
  buildMockStatsPage,
} from '../../data/mockMatchup';

const EDGES_KEY = (userId) => `mlbshell:saved-edges:${userId || 'guest'}`;

function readEdges(userId) {
  if (typeof window === 'undefined') return [...mockSavedEdgesSeed];
  try {
    const raw = window.localStorage.getItem(EDGES_KEY(userId));
    if (raw) return JSON.parse(raw);
    // Seed first-time users so the page isn't empty.
    window.localStorage.setItem(EDGES_KEY(userId), JSON.stringify(mockSavedEdgesSeed));
    return [...mockSavedEdgesSeed];
  } catch {
    return [...mockSavedEdgesSeed];
  }
}

function writeEdges(userId, edges) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EDGES_KEY(userId), JSON.stringify(edges));
  } catch {
    /* ignore quota errors */
  }
}

class MockAdapter {
  constructor(config = {}) {
    this.config = config;
    this.authToken = null;
    this.currentUserId = null;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  setCurrentUser(userId) {
    this.currentUserId = userId;
  }

  async getPlayers() {
    return mockPlayerPropInputs.map((p) => ({
      id: p.playerId,
      name: p.player,
      team: p.team,
      position: p.statType.includes('Pitcher') ? 'P' : 'POS',
    }));
  }

  async getGames(_date) {
    return mockGameList;
  }

  /** Raw prop lines (PlayerProp shape) — optionally filtered by gameId. */
  async getPropLines(gameId) {
    const calcs = this._calcs();
    const lines = calcs.map((c) =>
      enrichPlayerProp(
        {
          id: `prop-${c.playerId}`,
          playerId: c.playerId,
          player: c.player,
          team: c.team,
          opponent: c.opponent,
          gameId: c.gameId,
          prop: c.statType,
          line: c.line,
          overOdds: c.overOdds,
          underOdds: c.underOdds,
          projection: c.projectedValue,
          edge: c.edge,
          hitRate: c.hitRate,
          sampleSize: c.sampleSize,
          l5PaPerG: c.l5PaPerG,
          nearHr: c.nearHr,
          hrFbPct: c.hrFbPct,
          pulledAirPct: c.pulledAirPct,
          hitRateHits: c.hitRateHits,
          hitRateGames: c.hitRateGames,
        },
        mockPlayerEnrichment[c.playerId]
      )
    );
    return gameId ? lines.filter((l) => l.gameId === gameId) : lines;
  }

  /** Full PropCalculation[] (calculateProps output), sorted by edge desc. */
  async getPropCalculations() {
    return this._calcs();
  }

  async getPropCalculation(playerId) {
    return this._calcs().find((c) => c.playerId === playerId) || null;
  }

  /** Full matchup payload synthesized from the seed (mirrors fetch-mode shape). */
  async getMatchup(gameId) {
    return buildMockMatchup(gameId);
  }

  /** HR Targets — probable pitchers ranked by HR/9. */
  async getHRTargets(_options = {}) {
    return buildMockHRTargets();
  }

  /** Player Deep Dive — pitcher season/advanced/game-log payload. */
  async getDeepDive(playerId) {
    return buildMockDeepDive(playerId);
  }

  /** Selectable pitchers for the Player Deep Dive search. */
  async getDeepDiveList() {
    return buildMockDeepDiveList();
  }

  /** Player page (header, season line, game logs) — synthesized for mock mode. */
  async getPlayerPage(playerId) {
    return buildMockPlayerPage(playerId);
  }

  /** Stats page (today's matchups, hitting, pitching, HR targets) — mock mode. */
  async getStatsPage(_date) {
    return buildMockStatsPage();
  }

  /** Six-Gate Filter verdicts for today's slate — mock mode. */
  async getGateVerdicts() {
    return buildGateVerdicts(this._calcs(), mockWeatherList, mockGameList);
  }

  /** Statcast leaderboard for visual-analytics charts. */
  async getStatcastLeaderboard(stat = 'barrel') {
    const items = Object.values(mockPlayerEnrichment)
      .map((e) => e.statcast)
      .filter(Boolean)
      .map((s) => ({
        name: shortName(s.name),
        value: stat === 'barrel' ? s.barrelPct : stat === 'xwoba' ? s.xwoba : s.exitVelo,
      }))
      .filter((x) => x.value != null)
      .sort((a, b) => b.value - a.value);
    return items;
  }

  _calcs() {
    if (!this._cachedCalcs) {
      this._cachedCalcs = buildPropCalculations(
        mockPlayerPropInputs,
        mockGameList,
        mockWeatherList,
        new Date()
      ).map((c) => enrichCalculation(c, mockPlayerEnrichment[c.playerId]));
    }
    return this._cachedCalcs;
  }

  async getAdvancedStats(_playerId, _options = {}) {
    return mockAnalyticsData;
  }

  async getAnalytics() {
    return mockAnalyticsData;
  }

  async getBettingLines(_gameId) {
    return mockAnalyticsData.lineMovement;
  }

  async getWeather(venue) {
    return mockWeatherList.find((w) => w.venue === venue) || null;
  }

  async getAllWeather() {
    return mockWeatherList;
  }

  async getParkFactors(parkId) {
    return buildMockMatchup.parkFactor(parkId);
  }

  async getTeamRankings(division) {
    if (!division || division === 'All') return mockTeamRankings;
    return mockTeamRankings.filter((t) => t.division === division);
  }

  // ─── Saved Edges (user-scoped) ────────────────────────────────────────────

  async getSavedEdges() {
    return readEdges(this.currentUserId);
  }

  async saveEdge(edge) {
    const edges = readEdges(this.currentUserId);
    const newEdge = {
      ...edge,
      id: edge.id || `edge-${Date.now()}`,
      savedAt: edge.savedAt || new Date().toISOString(),
    };
    const next = [newEdge, ...edges.filter((e) => e.id !== newEdge.id)];
    writeEdges(this.currentUserId, next);
    return newEdge;
  }

  async deleteEdge(id) {
    const edges = readEdges(this.currentUserId);
    writeEdges(
      this.currentUserId,
      edges.filter((e) => e.id !== id)
    );
    return { success: true };
  }

  // ─── Auth (client-side simulation) ────────────────────────────────────────

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const user = {
      id: `user-${btoaSafe(email)}`,
      email,
      createdAt: new Date().toISOString(),
    };
    const token = `mock.${btoaSafe(email)}.${Date.now()}`;
    this.setAuthToken(token);
    this.setCurrentUser(user.id);
    return { user, token };
  }

  async register(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    return this.login(email, password);
  }

  async logout() {
    this.setAuthToken(null);
    this.setCurrentUser(null);
    return { success: true };
  }
}

/** "Judge, Aaron" → "A. Judge" */
function shortName(full) {
  if (!full) return '';
  const [last, first] = full.split(',').map((s) => s.trim());
  return first ? `${first[0]}. ${last}` : last;
}

function btoaSafe(str) {
  try {
    if (typeof btoa === 'function')
      return btoa(str)
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 12);
    return Buffer.from(str)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 12);
  } catch {
    return String(str)
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 12);
  }
}

export default MockAdapter;
