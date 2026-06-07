/**
 * GET /api/stats?date=YYYY-MM-DD — combined GameDay-Insights style stats payload
 * (today's matchups, hitting stats, pitching stats, HR targets).
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { statsPageService } from '../services/statsPageService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const date = req.query.date ? String(req.query.date) : undefined;
    const payload = await statsPageService.getStatsPage(date);
    return ok(res, payload);
  } catch (e) {
    return fail(res, 500, msg(e));
  }
});

export default router;
