/**
 * Saved Edges routes (auth protected, always user-scoped).
 *   GET    /api/saved-edges      — list the authenticated user's edges
 *   POST   /api/saved-edges      — save an edge for the authenticated user
 *   DELETE /api/saved-edges/:id  — delete one of the user's edges
 */

import { Router } from 'express';
import type { Response } from 'express';
import { ok, fail, msg } from './respond';
import { authMiddleware, type AuthedRequest } from '../middleware/authMiddleware';
import { getSavedEdges, addSavedEdge, deleteSavedEdge } from '../services/db';
import type { SavedEdge } from '../../shared/types';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthedRequest, res: Response) => {
  try {
    ok(res, getSavedEdges(req.user!.id));
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

router.post('/', (req: AuthedRequest, res: Response) => {
  try {
    const body = (req.body ?? {}) as Partial<SavedEdge>;
    if (!body.propId) return fail(res, 400, 'propId is required');
    const edge: SavedEdge = {
      id: body.id || `edge-${Date.now()}`,
      propId: body.propId,
      player: body.player ?? '',
      prop: body.prop ?? '',
      line: body.line ?? 0,
      direction: body.direction ?? 'over',
      edge: body.edge ?? 0,
      confidence: body.confidence ?? 'low',
      savedAt: body.savedAt || new Date().toISOString(),
      notes: body.notes,
    };
    ok(res, addSavedEdge(req.user!.id, edge));
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

router.delete('/:id', (req: AuthedRequest, res: Response) => {
  try {
    const removed = deleteSavedEdge(req.user!.id, String(req.params.id));
    if (!removed) return fail(res, 404, 'Edge not found');
    ok(res, { success: true });
  } catch (e) {
    fail(res, 500, msg(e));
  }
});

export default router;
