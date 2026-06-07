/**
 * GET /api/games?date=YYYY-MM-DD — live MLB schedule (falls back to seed data).
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { mlbDataService } from '../services/mlbDataService';
import { mockGameList } from '../../shared/mockSeed';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const date = String(req.query.date || '');
    const games = await mlbDataService.getSchedule(date).catch(() => []);
    ok(res, games.length ? games : mockGameList);
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

export default router;
