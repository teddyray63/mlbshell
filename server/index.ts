/**
 * Express server entrypoint.
 *
 * Hosts the JSON API consumed by the Next.js frontend when
 * NEXT_PUBLIC_API_MODE=fetch. Run with: `npm run server`.
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { registerRoutes } from './routes';

const app = express();
const PORT = Number(process.env.SERVER_PORT || process.env.PORT || 5050);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:4028';

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok' }, error: null });
});

registerRoutes(app);

app.listen(PORT, () => {
  console.info(`[server] MLBShell API listening on http://localhost:${PORT}`);
  console.info(`[server] CORS origin: ${CLIENT_ORIGIN}`);
});

export default app;
