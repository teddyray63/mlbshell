/**
 * db — SQLite persistence layer (better-sqlite3).
 *
 * Tables:
 *   users(id, email, passwordHash, createdAt)
 *   saved_edges(id, userId, propId, player, prop, line, direction, edge,
 *               confidence, savedAt, notes)
 *
 * Exports a singleton `db` client plus typed helpers used by authService and
 * the saved-edges routes.
 */

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import type { User, SavedEdge } from '../../shared/types';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'server', 'data', 'mlbshell.db');

// Ensure the parent directory exists before opening the database file.
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    email        TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS saved_edges (
    id         TEXT PRIMARY KEY,
    userId     TEXT NOT NULL,
    propId     TEXT NOT NULL,
    player     TEXT,
    prop       TEXT,
    line       REAL,
    direction  TEXT,
    edge       REAL,
    confidence TEXT,
    savedAt    TEXT NOT NULL,
    notes      TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

// ─── User helpers ─────────────────────────────────────────────────────────

export function createUser(user: User): User {
  db.prepare(
    `INSERT INTO users (id, email, passwordHash, createdAt) VALUES (@id, @email, @passwordHash, @createdAt)`
  ).run(user);
  return user;
}

export function getUserByEmail(email: string): User | undefined {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User | undefined;
}

export function getUserById(id: string): User | undefined {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | undefined;
}

// ─── Saved-edge helpers (always user-scoped) ──────────────────────────────

export function getSavedEdges(userId: string): SavedEdge[] {
  return db
    .prepare(`SELECT * FROM saved_edges WHERE userId = ? ORDER BY savedAt DESC`)
    .all(userId) as SavedEdge[];
}

export function addSavedEdge(userId: string, edge: SavedEdge): SavedEdge {
  db.prepare(
    `INSERT INTO saved_edges
       (id, userId, propId, player, prop, line, direction, edge, confidence, savedAt, notes)
     VALUES
       (@id, @userId, @propId, @player, @prop, @line, @direction, @edge, @confidence, @savedAt, @notes)`
  ).run({
    id: edge.id,
    userId,
    propId: edge.propId,
    player: edge.player,
    prop: edge.prop,
    line: edge.line,
    direction: edge.direction,
    edge: edge.edge,
    confidence: edge.confidence,
    savedAt: edge.savedAt,
    notes: edge.notes ?? null,
  });
  return edge;
}

/** Deletes only if the edge belongs to the user. Returns true if a row was removed. */
export function deleteSavedEdge(userId: string, id: string): boolean {
  const result = db.prepare(`DELETE FROM saved_edges WHERE id = ? AND userId = ?`).run(id, userId);
  return result.changes > 0;
}

export default db;
