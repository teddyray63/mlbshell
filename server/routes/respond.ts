/**
 * Response helpers — uniform { data, error } envelope used by all routes.
 */

import type { Response } from 'express';

export function ok<T>(res: Response, data: T): void {
  res.json({ data, error: null });
}

export function fail(res: Response, status: number, error: string): void {
  res.status(status).json({ data: null, error });
}

export function msg(e: unknown): string {
  return e instanceof Error ? e.message : 'Unexpected server error';
}
