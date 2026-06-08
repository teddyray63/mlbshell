# Test Plan — Real MLB + Statcast data across 6 pages (PR #5)

Frontend runs in **fetch mode** (`NEXT_PUBLIC_API_MODE=fetch`, base `http://localhost:5055`) against the live Express backend, which pulls real data from statsapi.mlb.com + baseballsavant.mlb.com. Logged in as `tester@example.com`.

Backend already verified via curl: cache HIT/MISS logging works, real games (824916 ATL/PIT 2026-06-07), real barrel% leaderboard (Judge 21.7), real pitcher splits (Bubba Chandler).

## Tests

### T1 — /matchup-engine renders real game + color-coded pitcher/batter tables + CSV
- Navigate to /matchup-engine.
- PASS: Game header shows a real Away @ Home matchup with venue + weather strip. Pitcher splits table shows numeric cells with **green/yellow/red backgrounds** (not all white/plain). Batter table renders rows with handedness + color-coded stat cells.
- Click filter tab "RHB" → only RHB batters remain (row count drops vs "All").
- Click "Export CSV" → a `.csv` file downloads.
- FAIL if: cells have no color backgrounds, tables empty, or CSV button does nothing.

### T2 — /player-props has new Statcast columns + color coding + filters
- Navigate to /player-props.
- PASS: Table header includes `Exit Velo`, `Barrel%`, `Hard Hit%`, `xwOBA`, `vs RHP`, `vs LHP`, `Whiff%`. Those stat cells are color-coded green/yellow/red. Clicking "Barrel%" header sorts rows (order changes).
- Click matchup "vs LHP" chip → row set changes (filters).
- FAIL if: new columns absent or cells uncolored.

### T3 — /prop-cheatsheet adds Exit Velo / Barrel% / xwOBA / Park Factor
- Navigate to /prop-cheatsheet.
- PASS: Header includes `Exit Velo`, `Barrel%`, `xwOBA`, `Park Factor`. Park Factor column shows a `PF ###` badge; stat cells color-coded.
- FAIL if: columns missing or PF badge absent.

### T4 — /prop-analyzer deep dive shows stat breakdown + pitch vulnerability
- Navigate to /prop-analyzer (default player or via row click).
- PASS: Player header with position + handedness badge; "Stat Breakdown" table with rows Season/Last 30/Last 15/Last 7/vs Today's Pitcher, color-coded; "Pitch Vulnerability" cards with verdict badges.
- FAIL if: breakdown table or pitch vulnerability section missing.

### T5 — /visual-analytics charts wired to real Statcast
- Navigate to /visual-analytics.
- PASS: "Barrel% Leaders", "xwOBA Leaders", "Exit Velocity Distribution" (new chart), and "Pitcher Profile" radar all render with bars/areas (real leaderboard names). Exit Velo bars colored by threshold.
- FAIL if: any chart empty or ExitVeloDistributionChart absent.

### T6 — /weather-park shows park factors + last-3-season HR rates
- Navigate to /weather-park.
- PASS: Venue cards show weather stats AND a "Savant Park Factors" block with HR/Runs badges + a 3-bar mini chart labeled with years (HR/game last 3 seasons).
- FAIL if: Savant park-factor block absent.

## Out of scope
- Auth flows (covered in prior PR), regression of unchanged pages.
