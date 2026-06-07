/**
 * GET /api/analytics/advanced-stats — aggregate analytics dataset for the
 * visual-analytics charts and dashboard cards.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { cache, TTL } from '../cache';
import { mockAnalyticsData } from '../../shared/mockSeed';

const router = Router();

router.get('/advanced-stats', async (_req: Request, res: Response) => {
  try {
    const data = await cache.wrap('analytics:advanced', TTL.stats, async () => mockAnalyticsData);
    ok(res, data);
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

export default router;
