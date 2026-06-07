---
name: testing-mlbshell
description: Test the MLBShell MLB prop-betting app (Next.js + Express) end-to-end. Use when verifying UI/data changes to matchup-engine, player-props, prop-cheatsheet, prop-analyzer, visual-analytics, weather-park, or the auth/prop-calc/cache backend.
---

# Testing MLBShell

Next.js 15 (App Router) frontend + Express backend. Frontend talks to the backend via an adapter selected by `NEXT_PUBLIC_API_MODE` (`fetch` = real backend, `mock` = synthesized data). Both adapters return identical shapes, so component/render/filter/CSV logic is mode-independent — you can verify UI behavior in whichever mode has the data you need.

## Running locally

- Install: `npm install`
- Backend (Express, real MLB + Statcast data): `PORT=5055 npm run server` (logs to a file, e.g. `/tmp/server.log`, so you can grep cache logs)
- Frontend in fetch mode: `NEXT_PUBLIC_API_MODE=fetch npm run dev` (default port 4028) — talks to backend at `http://localhost:5055`
- Frontend in mock mode: run a second instance on another port with `NEXT_PUBLIC_API_MODE=mock` (e.g. 4029). If the global `next` binary isn't found, use `./node_modules/.bin/next dev -p <port>`.

## Login

Register/login via the UI. Working test account used previously: `tester@example.com` / `Test1234!`. Auth is Bearer-only JWT; unauthenticated users are redirected to `/login`.

## Data sources (no API keys)

- MLB Stats API: `https://statsapi.mlb.com/api/v1` (schedule, pitchers, batters, standings)
- Baseball Savant / Statcast: `https://baseballsavant.mlb.com` (park factors, barrel%, exit velo, xwOBA, arsenals)

## Known limitation — empty batter table in fetch mode

The MLB Stats API does NOT post lineups for games that haven't been played yet. `server/services/mlbDataService.ts` intentionally leaves the opposing-batter array empty until lineups are confirmed, so `/matchup-engine` shows an empty batter table (header reads "Projected Lineup" instead of "Lineup Confirmed") for any future-dated slate. This is expected, not a bug. To test the batter table's color-coding, RHB/LHB filters, and CSV export, use **mock mode**, where 10 batter rows synthesize. If a future change adds an active-roster fallback, the table may populate pre-lineup — re-check this behavior.

## What to verify

- **Stat color-coding** (`src/utils/statColorCoder.ts`): cells get `stat-green`/`stat-yellow`/`stat-red` backgrounds by exact thresholds, with batter vs pitcher perspective. Spot-check known values (e.g. Barrel% >12% green, 6-12% yellow, <6% red; Exit Velo >92 green, 88-92 yellow, <88 red; xwOBA >.370 green, .320-.370 yellow, <.320 red).
- **New columns** present per page: player-props (Exit Velo, Barrel%, Hard Hit%, xwOBA, vs RHP, vs LHP, Whiff%); prop-cheatsheet (Exit Velo, Barrel%, xwOBA, Park Factor `PF ###` badge).
- **Filters**: handedness chips (vs RHP/vs LHP, RHB/LHB) change the row set.
- **CSV export**: matchup-engine batter table "CSV" button downloads a file (`matchup-<AWAY>-<HOME>-batters.csv`) reflecting the active filter. Verify contents with `cat ~/Downloads/<file>.csv`.
- **Charts** (visual-analytics): xwOBA Leaders, Barrel% Leaders, Exit Velocity Distribution (newer), Pitcher Profile radar, Line Movement all render.
- **weather-park**: each venue card shows weather + a "Savant Park Factors" block (HR/Runs badges + 3-season HR/game mini chart).
- **Cache logging** (backend): `grep -iE "cache (HIT|MISS)" /tmp/server.log` shows `[cache] HIT/MISS <key> (hits=N misses=M)` per-key counters. Per-type TTLs: weather 10m, hitting 30m, statcast 60m, pitcher splits 30m, schedule/lineups 15m, standings 60m.

## Compile gates

`npx tsc --noEmit`, `npm run lint` (warnings-only is OK, exit 0), `npm run build` should all pass.

## Devin Secrets Needed

None for local testing — both MLB data sources are free/no-auth and login uses a locally-created account. (`VERCEL_TOKEN` is only relevant for deploying, not testing.)
