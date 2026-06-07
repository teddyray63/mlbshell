/**
 * GET /api/players/:playerId — full player-page payload (header, season line,
 * batter game log, opposing pitcher log, batter-vs-pitcher, best lines).
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { playersService } from '../services/playersService';

const router = Router();

router.get('/:playerId', async (req: Request, res: Response) => {
  try {
    const playerId = String(req.params.playerId);
    if (!/^\d+$/.test(playerId)) return fail(res, 400, 'Invalid player id');
    const payload = await playersService.getPlayerPage(playerId);
    return ok(res, payload);
  } catch (e) {
    return fail(res, 500, msg(e));
  }
});

export default router;
