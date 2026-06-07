/**
 * GET /api/player-props?gameId= — runs calculateProps and returns the
 * resulting PropCalculation[] sorted by edge% descending.
 *
 * Live odds are not available from the MLB Stats API, so the seed prop universe
 * is used as input; calculations are produced by the real engine.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { calculateProps } from '../services/propCalculationService';
import { mockPlayerPropInputs, mockGameList, mockWeatherList } from '../../shared/mockSeed';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const calcs = calculateProps(mockPlayerPropInputs, mockGameList, mockWeatherList);
    const gameId = req.query.gameId ? String(req.query.gameId) : '';
    ok(res, gameId ? calcs.filter((c) => c.gameId === gameId) : calcs);
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

export default router;
