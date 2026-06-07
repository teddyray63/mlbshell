/**
 * GET /api/player-props?gameId= — runs calculateProps and returns the
 * resulting PropCalculation[] sorted by edge% descending, enriched with live
 * Baseball Savant Statcast metrics (keyed by each seed player's real MLB id).
 *
 * Live odds are not available from the MLB Stats API, so the seed prop universe
 * is used as input; calculations are produced by the real engine.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { calculateProps } from '../services/propCalculationService';
import { statcastService } from '../services/statcastService';
import { enrichCalculation } from '../../shared/enrich';
import {
  mockPlayerPropInputs,
  mockGameList,
  mockWeatherList,
  mockPlayerEnrichment,
} from '../../shared/mockSeed';
import type { BatterStatcast } from '../../shared/types';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const calcs = calculateProps(mockPlayerPropInputs, mockGameList, mockWeatherList);

    // Pull the live batter leaderboard once and index by MLB id for enrichment.
    let liveById: Record<string, BatterStatcast> = {};
    try {
      const board = await statcastService.getBatterLeaderboard();
      liveById = Object.fromEntries(board.map((b) => [b.playerId, b]));
    } catch {
      /* leaderboard fetch is best-effort; fall back to baked snapshot */
    }

    const enriched = calcs.map((c) => {
      const enr = mockPlayerEnrichment[c.playerId];
      const live = enr ? liveById[enr.mlbId] : undefined;
      return enrichCalculation(c, enr, live);
    });

    const gameId = req.query.gameId ? String(req.query.gameId) : '';
    ok(res, gameId ? enriched.filter((c) => c.gameId === gameId) : enriched);
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

export default router;
