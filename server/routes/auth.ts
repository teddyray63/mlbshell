/**
 * Auth routes — register, login, logout. Issues a JWT stored in an httpOnly
 * cookie and also returned in the body so the client can hold it in memory.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { ok, fail, msg } from './respond';
import { loginUser, registerUser } from '../services/authService';

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

router.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    const result = registerUser(email, password);
    res.cookie('token', result.token, COOKIE_OPTS);
    ok(res, result);
  } catch (e) {
    fail(res, 400, msg(e));
  }
});

router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    const result = loginUser(email, password);
    res.cookie('token', result.token, COOKIE_OPTS);
    ok(res, result);
  } catch (e) {
    fail(res, 401, msg(e));
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', { path: '/' });
  ok(res, { success: true });
});

export default router;
