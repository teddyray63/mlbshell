/**
 * MockAdapter — returns static mock data for all API methods.
 * Used as fallback when NEXT_PUBLIC_API_MODE is unset or "mock".
 * All data is realistic MLB data for demo/development purposes.
 */

const MOCK_PLAYERS = [
  { id: 'p-aaron-judge', name: 'Aaron Judge', team: 'NYY', position: 'RF', bats: 'R', throws: 'R' },
  { id: 'p-freddie-freeman', name: 'Freddie Freeman', team: 'LAD', position: '1B', bats: 'L', throws: 'R' },
  { id: 'p-shohei-ohtani', name: 'Shohei Ohtani', team: 'LAD', position: 'DH', bats: 'L', throws: 'R' },
  { id: 'p-yordan-alvarez', name: 'Yordan Alvarez', team: 'HOU', position: 'DH', bats: 'L', throws: 'R' },
  { id: 'p-bryce-harper', name: 'Bryce Harper', team: 'PHI', position: '1B', bats: 'L', throws: 'R' },
  { id: 'p-gerrit-cole', name: 'Gerrit Cole', team: 'NYY', position: 'SP', bats: 'R', throws: 'R' },
  { id: 'p-spencer-strider', name: 'Spencer Strider', team: 'ATL', position: 'SP', bats: 'R', throws: 'R' },
  { id: 'p-julio-rodriguez', name: 'Julio Rodriguez', team: 'SEA', position: 'CF', bats: 'R', throws: 'R' },
];

const MOCK_GAMES_DATA = [
  { id: 'game-nyy-bos', homeTeam: 'NYY', awayTeam: 'BOS', time: '1:05 PM ET', venue: 'Yankee Stadium', status: 'scheduled', homeOdds: -145, awayOdds: 125, overUnder: 9.0 },
  { id: 'game-lad-sf', homeTeam: 'LAD', awayTeam: 'SF', time: '4:10 PM ET', venue: 'Dodger Stadium', status: 'scheduled', homeOdds: -165, awayOdds: 140, overUnder: 8.5 },
  { id: 'game-hou-tex', homeTeam: 'HOU', awayTeam: 'TEX', homeScore: 3, awayScore: 2, time: 'LIVE', venue: 'Minute Maid Park', status: 'live', inning: 'T7' },
  { id: 'game-atl-phi', homeTeam: 'ATL', awayTeam: 'PHI', homeScore: 5, awayScore: 3, time: 'F', venue: 'Truist Park', status: 'final' },
  { id: 'game-chc-mil', homeTeam: 'CHC', awayTeam: 'MIL', time: '7:40 PM ET', venue: 'Wrigley Field', status: 'scheduled', homeOdds: 110, awayOdds: -130, overUnder: 8.0 },
];

const MOCK_PROPS = [
  { id: 'prop-001', player: 'Gerrit Cole', team: 'NYY', opponent: 'BOS', prop: 'Strikeouts', line: 7.5, overOdds: -115, underOdds: -105, projection: 8.1, edge: 5.2, hitRate: 0.64, status: 'steam', sharp: true, consensus: 72 },
  { id: 'prop-002', player: 'Spencer Strider', team: 'ATL', opponent: 'PHI', prop: 'Strikeouts', line: 8.5, overOdds: -120, underOdds: 100, projection: 9.2, edge: 3.8, hitRate: 0.58, status: 'value', sharp: true, consensus: 65 },
  { id: 'prop-003', player: 'Aaron Judge', team: 'NYY', opponent: 'BOS', prop: 'Home Runs', line: 0.5, overOdds: 180, underOdds: -220, projection: 0.42, edge: -1.4, hitRate: 0.44, status: 'neutral', sharp: false, consensus: 44 },
  { id: 'prop-004', player: 'Freddie Freeman', team: 'LAD', opponent: 'SF', prop: 'Hits', line: 1.5, overOdds: -140, underOdds: 115, projection: 1.9, edge: 9.4, hitRate: 0.71, status: 'steam', sharp: true, consensus: 78 },
  { id: 'prop-005', player: 'Yordan Alvarez', team: 'HOU', opponent: 'TEX', prop: 'Total Bases', line: 2.5, overOdds: -110, underOdds: -110, projection: 2.8, edge: 2.9, hitRate: 0.55, status: 'neutral', sharp: false, consensus: 51 },
  { id: 'prop-006', player: 'Bryce Harper', team: 'PHI', opponent: 'ATL', prop: 'RBIs', line: 0.5, overOdds: -155, underOdds: 130, projection: 0.8, edge: -2.7, hitRate: 0.38, status: 'fade', sharp: false, consensus: 38 },
  { id: 'prop-007', player: 'Mookie Betts', team: 'LAD', opponent: 'SF', prop: 'Hits', line: 1.5, overOdds: -125, underOdds: 105, projection: 1.6, edge: -0.8, hitRate: 0.47, status: 'neutral', sharp: false, consensus: 47 },
  { id: 'prop-008', player: 'Shohei Ohtani', team: 'LAD', opponent: 'SF', prop: 'Total Bases', line: 2.5, overOdds: -130, underOdds: 110, projection: 2.9, edge: 1.9, hitRate: 0.52, status: 'neutral', sharp: false, consensus: 52 },
  { id: 'prop-009', player: 'Logan Webb', team: 'SF', opponent: 'LAD', prop: 'Strikeouts', line: 6.5, overOdds: -110, underOdds: -110, projection: 6.1, edge: -3.2, hitRate: 0.35, status: 'fade', sharp: false, consensus: 35 },
  { id: 'prop-010', player: 'Julio Rodriguez', team: 'SEA', opponent: 'OAK', prop: 'Total Bases', line: 1.5, overOdds: -145, underOdds: 120, projection: 2.1, edge: 6.7, hitRate: 0.78, status: 'steam', sharp: true, consensus: 78 },
];

class MockAdapter {
  constructor(config = {}) {
    this.config = config;
  }

  async getPlayers() {
    return MOCK_PLAYERS;
  }

  async getGames(date) {
    return MOCK_GAMES_DATA?.map(g => ({ ...g, date: date || new Date()?.toISOString()?.split('T')?.[0] }));
  }

  async getMatchup(pitcherId, batterId) {
    return {
      pitcherId,
      batterId,
      score: 52,
      advantage: 'neutral',
      factors: ['Mock matchup data — connect live API for real analysis'],
    };
  }

  async getPropLines(gameId) {
    if (!gameId) return MOCK_PROPS;
    const game = MOCK_GAMES_DATA?.find(g => g?.id === gameId);
    if (!game) return MOCK_PROPS;
    return MOCK_PROPS?.filter(p => p?.team === game?.homeTeam || p?.team === game?.awayTeam);
  }

  async getAdvancedStats(playerId, options = {}) {
    const player = MOCK_PLAYERS?.find(p => p?.id === playerId);
    if (!player) return null;
    return {
      playerId,
      season: options?.year || new Date()?.getFullYear()?.toString(),
      stats: {
        avg: 0.278,
        obp: 0.358,
        slg: 0.488,
        woba: 0.368,
        xwoba: 0.374,
        exitVelocityAvg: 91.2,
        barrelRate: 12.4,
        hardHitPct: 46.1,
        kPct: 22.4,
        bbPct: 10.2,
      },
    };
  }

  async getBettingLines(gameId) {
    const game = MOCK_GAMES_DATA?.find(g => g?.id === gameId);
    if (!game) return [];
    return [{
      gameId: game?.id,
      homeTeam: game?.homeTeam,
      awayTeam: game?.awayTeam,
      homeOdds: game?.homeOdds || -110,
      awayOdds: game?.awayOdds || -110,
      overUnder: game?.overUnder || 8.5,
      openHomeOdds: (game?.homeOdds || -110) + 5,
      openAwayOdds: (game?.awayOdds || -110) - 5,
    }];
  }

  async getWeather(venue) {
    return {
      venue: venue || 'Yankee Stadium',
      temp: 72,
      feelsLike: 70,
      windSpeed: 8,
      windDir: 'SW at 8 mph',
      humidity: 55,
      condition: 'Partly Cloudy',
      precipitation: 0,
      windAlert: false,
      windImpact: 'neutral',
    };
  }

  async getParkFactors(parkId) {
    const factors = {
      'yankee-stadium': { runFactor: 108, hrFactor: 121, hitFactor: 103, soFactor: 97, bbFactor: 101 },
      'dodger-stadium': { runFactor: 96, hrFactor: 91, hitFactor: 98, soFactor: 103, bbFactor: 98 },
      'wrigley-field': { runFactor: 112, hrFactor: 118, hitFactor: 106, soFactor: 94, bbFactor: 103 },
      'coors-field': { runFactor: 121, hrFactor: 116, hitFactor: 118, soFactor: 91, bbFactor: 106 },
    };
    return factors?.[parkId] || { runFactor: 100, hrFactor: 100, hitFactor: 100, soFactor: 100, bbFactor: 100 };
  }
}

export default MockAdapter;