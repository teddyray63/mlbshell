/**
 * GET /api/team-rankings?division= — standings, optionally filtered by division.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { mockTeamRankings } from '../../shared/mockSeed';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const division = req.query.division ? String(req.query.division) : '';
    const rankings =
      division && division !== 'All'
        ? mockTeamRankings.filter((t) => t.division === division)
        : mockTeamRankings;
    ok(res, rankings);
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

export default router;
