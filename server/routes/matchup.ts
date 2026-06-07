/**
 * Matchup routes — full game matchup data sourced from live MLB Stats API +
 * Baseball Savant Statcast.
 *
 *   GET /api/matchup/:gameId                            — full MatchupGame
 *   GET /api/matchup/:gameId/pitcher/:pitcherId/arsenal — pitch arsenal
 *   GET /api/matchup/:gameId/batters                    — batter table rows
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { mlbDataService } from '../services/mlbDataService';
import { statcastService } from '../services/statcastService';

const router = Router();

// Specific routes must precede the `/:gameId` wildcard.
router.get('/leaderboard/statcast', async (req: Request, res: Response) => {
  try {
    const stat = String(req.query.stat || 'barrel') as 'barrel' | 'xwoba' | 'exitVelo';
    const board = await statcastService.getLeaderboards(stat);
    return ok(res, board);
  } catch (e) {
    return fail(res, 500, msg(e));
  }
});

router.get('/park/:venue/factors', async (req: Request, res: Response) => {
  try {
    const pf = await statcastService.getParkFactors(String(req.params.venue));
    if (!pf) return fail(res, 404, 'No park factor for that venue');
    return ok(res, pf);
  } catch (e) {
    return fail(res, 500, msg(e));
  }
});

router.get('/:gameId', async (req: Request, res: Response) => {
  try {
    const date = req.query.date ? String(req.query.date) : undefined;
    const matchup = await mlbDataService.getMatchup(String(req.params.gameId), date);
    if (!matchup) return fail(res, 404, 'Matchup not found for that game');
    return ok(res, matchup);
  } catch (e) {
    return fail(res, 500, msg(e));
  }
});

router.get('/:gameId/pitcher/:pitcherId/arsenal', async (req: Request, res: Response) => {
  try {
    const arsenal = await mlbDataService.getPitchArsenal(String(req.params.pitcherId));
    return ok(res, arsenal);
  } catch (e) {
    return fail(res, 500, msg(e));
  }
});

router.get('/:gameId/batters', async (req: Request, res: Response) => {
  try {
    const date = req.query.date ? String(req.query.date) : undefined;
    const matchup = await mlbDataService.getMatchup(String(req.params.gameId), date);
    if (!matchup) return fail(res, 404, 'Matchup not found for that game');
    return ok(res, matchup.batters);
  } catch (e) {
    return fail(res, 500, msg(e));
  }
});

export default router;
