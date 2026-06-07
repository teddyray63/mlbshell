/**
 * db — Postgres persistence layer (pg).
 *
 * Railway has an ephemeral filesystem, so SQLite data would reset on every
 * redeploy. This uses Railway's Postgres addon instead (connection string in
 * the DATABASE_URL env var) so users and saved edges survive redeploys.
 *
 * Tables:
 *   users(id, email, password_hash, created_at)
 *   saved_edges(id, user_id, prop_id, player, prop, line, direction, edge,
 *               confidence, saved_at, notes)
 *
 * Columns are snake_case in Postgres and aliased back to the camelCase shape of
 * the shared `User` / `SavedEdge` types on read. All helpers are async.
 */

import { Pool } from 'pg';
import type { User, SavedEdge } from '../../shared/types';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fail loudly at startup rather than on the first query.
  console.warn('[db] DATABASE_URL is not set — database operations will fail.');
}

export const pool = new Pool({
  connectionString,
  // Railway/managed Postgres requires TLS; allow self-signed in that context.
  ssl: process.env.PGSSL === 'disable' ? undefined : { rejectUnauthorized: false },
});

/** Creates tables if they don't already exist. Called once on server startup. */
export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_edges (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id),
      prop_id    TEXT NOT NULL,
      player     TEXT,
      prop       TEXT,
      line       REAL,
      direction  TEXT,
      edge       REAL,
      confidence TEXT,
      saved_at   TEXT NOT NULL,
      notes      TEXT
    );
  `);
  console.info('[db] Postgres schema ready (users, saved_edges)');
}

// ─── User helpers ─────────────────────────────────────────────────────────

const USER_COLS = 'id, email, password_hash AS "passwordHash", created_at AS "createdAt"';

export async function createUser(user: User): Promise<User> {
  await pool.query(
    `INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)`,
    [user.id, user.email, user.passwordHash, user.createdAt]
  );
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { rows } = await pool.query(`SELECT ${USER_COLS} FROM users WHERE email = $1`, [email]);
  return rows[0] as User | undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { rows } = await pool.query(`SELECT ${USER_COLS} FROM users WHERE id = $1`, [id]);
  return rows[0] as User | undefined;
}

// ─── Saved-edge helpers (always user-scoped) ──────────────────────────────

const EDGE_COLS =
  'id, user_id AS "userId", prop_id AS "propId", player, prop, line, direction, edge, confidence, saved_at AS "savedAt", notes';

export async function getSavedEdges(userId: string): Promise<SavedEdge[]> {
  const { rows } = await pool.query(
    `SELECT ${EDGE_COLS} FROM saved_edges WHERE user_id = $1 ORDER BY saved_at DESC`,
    [userId]
  );
  return rows as SavedEdge[];
}

export async function addSavedEdge(userId: string, edge: SavedEdge): Promise<SavedEdge> {
  await pool.query(
    `INSERT INTO saved_edges
       (id, user_id, prop_id, player, prop, line, direction, edge, confidence, saved_at, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      edge.id,
      userId,
      edge.propId,
      edge.player,
      edge.prop,
      edge.line,
      edge.direction,
      edge.edge,
      edge.confidence,
      edge.savedAt,
      edge.notes ?? null,
    ]
  );
  return edge;
}

/** Deletes only if the edge belongs to the user. Returns true if a row was removed. */
export async function deleteSavedEdge(userId: string, id: string): Promise<boolean> {
  const result = await pool.query(`DELETE FROM saved_edges WHERE id = $1 AND user_id = $2`, [
    id,
    userId,
  ]);
  return (result.rowCount ?? 0) > 0;
}

export default pool;
