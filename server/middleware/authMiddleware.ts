/**
 * authMiddleware — protects routes that require an authenticated user.
 *
 * Reads the JWT from the Authorization Bearer header, verifies it, and attaches
 * the resolved user to req.user. Responds 401 when the token is missing or
 * invalid.
 */

import type { Request, Response, NextFunction } from 'express';
import type { PublicUser } from '../../shared/types';
import { getUserFromToken } from '../services/authService';

export interface AuthedRequest extends Request {
  user?: PublicUser;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export async function authMiddleware(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ data: null, error: 'Authentication required' });
    return;
  }
  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ data: null, error: 'Invalid or expired session' });
    return;
  }
  req.user = user;
  next();
}

export default authMiddleware;
