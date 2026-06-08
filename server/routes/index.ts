/**
 * Server Routes — registers all API route modules on the Express app.
 */

import type { Express } from 'express';
import authRouter from './auth';
import gamesRouter from './games';
import playerPropsRouter from './playerProps';
import weatherRouter from './weather';
import teamRankingsRouter from './teamRankings';
import savedEdgesRouter from './savedEdges';
import analyticsRouter from './analytics';
import matchupRouter from './matchup';
import extrasRouter from './extras';
import playersRouter from './players';
import statsRouter from './stats';
import gateFilterRouter from './gateFilter';

export const registerRoutes = (app: Express): void => {
  app.use('/api/auth', authRouter);
  app.use('/api/games', gamesRouter);
  app.use('/api/player-props', playerPropsRouter);
  app.use('/api/weather', weatherRouter);
  app.use('/api/team-rankings', teamRankingsRouter);
  app.use('/api/saved-edges', savedEdgesRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/matchup', matchupRouter);
  app.use('/api/players', playersRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/gate-filter', gateFilterRouter);
  app.use('/api', extrasRouter);
  console.info(
    '[Routes] Registered: auth, games, player-props, weather, team-rankings, saved-edges, analytics, matchup, players, stats, gate-filter, extras'
  );
};

export default registerRoutes;
