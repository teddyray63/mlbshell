# Railway Deployment — End-to-End Test Report

**PR:** https://github.com/teddyray63/mlbshell/pull/7
**Backend (Railway):** https://mlbshell-server-production.up.railway.app
**Frontend (Vercel):** https://mlbshell.vercel.app
**CI:** CodeQL ✅ · Analyze (javascript-typescript) ✅

All Step 7 checks passed against the **live** deployments (frontend in fetch mode → Railway backend → Railway Postgres).

---

## 1. Backend health

`GET /health` → `200 { "status": "ok", "timestamp": "2026-06-07T13:53:28.191Z" }`
Also reachable from the deployed frontend (browser `fetch`), confirming CORS allows `https://mlbshell.vercel.app`.

## 2. Frontend in fetch mode — "live" indicator + real schedule

Dashboard top-bar shows **live** (not mock); "Today's Games" is the real MLB slate (PIT @ ATL · Truist Park, CWS @ PHI · Citizens Bank Park, ...).

![Dashboard live + real schedule](https://app.devin.ai/attachments/2318a207-5b86-47ea-a2aa-e37043815fa5/screenshot_2c40107f67b0411ea2592e8031a24825.png)

## 3. /matchup-engine — real MLB + Statcast

Real gameIds, real pitchers (Bubba Chandler RHP, Bryce Elder RHP), color-coded pitcher splits (Season/vsLHB/vsRHB), Truist Park, Park Factor 101. Opposing-batters table empty = pre-existing behavior for future-dated games without confirmed lineups.

![Matchup engine fetch mode](https://app.devin.ai/attachments/b13ac403-a3f0-4f29-b590-c68e3b01f7e3/screenshot_8dffefb0f9fc46f883c08a135fa3d488.png)

## 4. /player-props — real Statcast columns

12 props sorted by edge%, color-coded Exit Velo / Barrel% / Hard Hit% / xwOBA / vs RHP / vs LHP / Whiff%.

![Player props](https://app.devin.ai/attachments/dbef4738-cead-4e87-bf52-fed10e0f3c83/screenshot_aed5d59292d547f6910b84bf58e22350.png)

## 5. /weather-park — real weather + park factors

5 venues with temp/wind/humidity, HR Boost/Suppress badges, Savant park factors, 3-season HR rates.

![Weather & park](https://app.devin.ai/attachments/e1d80745-550c-4cc6-8e44-ed4e76cdada7/screenshot_6ff4f50b6d6e45f186080ad7c2d45163.png)

## 6. Auth + saved-edge persistence (Postgres)

| Step | Result |
|------|--------|
| Register `railtest0607@mlbshell.com` on live site | User created in Postgres — real UUID `user-ed018f53-...` + JWT |
| `POST /api/saved-edges` (Aaron Judge HR) with user JWT | `200`, edge stored |
| `GET /api/saved-edges` | `200`, count=1, `userId` scoped |
| Fresh login (new token) → `GET /api/saved-edges` | count=1 — survives logout/login |
| **Trigger real Railway redeploy** (`serviceInstanceRedeploy` → `SUCCESS`) → login → `GET` | **count=1 — edge survived redeploy** |

```
saved-edges after redeploy:
{ "data": [ { "id": "edge-railtest-1780840335892", "userId": "user-ed018f53-66d4-471a-a142-18be87e00d0d",
  "player": "Aaron Judge", "prop": "Home Runs", "line": 0.5, "direction": "over",
  "edge": 51.2, "confidence": "high", "notes": "railway persistence test" } ], "error": null }
```

> The prop board has no UI control wired to `saveEdge`, so the create path was exercised via the live API with the registered user's JWT (pre-existing app gap, not introduced by this PR).

## Build/lint/type checks
`npm run build` ✅ · `npm run lint` ✅ · `tsc` ✅
