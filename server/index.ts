/**
 * Express server entrypoint.
 *
 * Hosts the JSON API consumed by the Next.js frontend when
 * NEXT_PUBLIC_API_MODE=fetch. Run with: `npm run server` (dev, tsx) or
 * `npm start` from /server after `npm run build` (prod, compiled).
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { registerRoutes } from './routes';
import { initDb } from './services/db';

const app = express();
const PORT = Number(process.env.SERVER_PORT || process.env.PORT || 5050);

// Origins allowed to call the API. The deployed Vercel frontend plus local dev.
// CORS_ORIGIN (comma-separated) can extend this at runtime without a code change.
const allowedOrigins = [
  'https://mlbshell.vercel.app',
  'http://localhost:3000',
  'http://localhost:4028',
  ...(process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / non-browser requests (curl, health checks) where
      // origin is undefined, plus any explicitly allow-listed origin.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Global rate limiter — caps abusive bursts across all routes.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

registerRoutes(app);

// Ensure database schema exists before accepting traffic, then listen.
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.info(`[server] MLBShell API listening on port ${PORT}`);
      console.info(`[server] CORS origins: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((err) => {
    console.error('[server] Failed to initialize database:', err);
    process.exit(1);
  });

export default app;
