/**
 * GET /api/gate-filter — runs today's prop slate through the Six-Gate Filter
 * System and returns PropVerdict[] (nuclear plays first).
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { getGateVerdicts } from '../services/gateFilterService';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const verdicts = await getGateVerdicts();
    ok(res, verdicts);
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

export default router;
