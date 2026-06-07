/**
 * GET /api/weather        — all venue weather conditions
 * GET /api/weather/:venue — weather for a single venue
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { cache, TTL } from '../cache';
import { mockWeatherList } from '../../shared/mockSeed';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const all = await cache.wrap('weather:all', TTL.weather, async () => mockWeatherList);
    ok(res, all);
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

router.get('/:venue', async (req: Request, res: Response) => {
  try {
    const venue = decodeURIComponent(String(req.params.venue));
    const wx = await cache.wrap(`weather:${venue}`, TTL.weather, async () =>
      mockWeatherList.find((w) => w.venue === venue)
    );
    if (!wx) return fail(res, 404, 'Venue not found');
    ok(res, wx);
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

export default router;
