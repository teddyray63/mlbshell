/**
 * Auth routes — register, login, logout. Issues a JWT returned in the response
 * body; the client holds it in memory (Zustand) and sends it on the
 * Authorization: Bearer header. No cookie is set, avoiding CSRF surface and
 * clear-text token storage in the browser cookie jar.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { ok, fail, msg } from './respond';
import { loginUser, registerUser } from '../services/authService';

const router = Router();

// Stricter limiter for credential endpoints to throttle brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { data: null, error: 'Too many attempts, please try again later.' },
});

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    const result = await registerUser(email, password);
    ok(res, result);
  } catch (e) {
    fail(res, 400, msg(e));
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    const result = await loginUser(email, password);
    ok(res, result);
  } catch (e) {
    fail(res, 401, msg(e));
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  ok(res, { success: true });
});

export default router;
