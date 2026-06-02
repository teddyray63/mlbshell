# MLB Analytics Shell — Migration Guide

This is a **migration-ready shell** built with Next.js. It mirrors the architecture of your existing Vite React MLB analytics platform so you can incrementally copy files over without rebuilding from scratch.

---

## Folder Structure

```
/
├── client/                  ← (alias for src/) — frontend lives here
├── server/                  ← backend services, routes, scrapers, cache
├── shared/                  ← types and constants shared between frontend and backend
├── docs/                    ← audit files, migration notes, this guide
└── src/                     ← Next.js app source
    ├── api/                 ← API client + adapters (mock/fetch)
    ├── app/                 ← Next.js App Router pages
    ├── charts/              ← Recharts chart components
    ├── components/          ← Shared UI components
    ├── data/                ← Mock data (replace with real API calls)
    ├── hooks/               ← Custom React hooks
    ├── services/            ← Frontend service layer
    ├── state/               ← State management (slices, stores)
    └── utils/               ← Utility functions
```

---

## Pages & Routes

| Page | Route | File |
|------|-------|------|
| Dashboard | `/dashboard` | `src/app/dashboard/page.tsx` |
| Advanced Analytics | `/` | `src/app/page.tsx` |
| Betting Intelligence | `/betting-intelligence` | `src/app/betting-intelligence/page.tsx` |
| Matchup Engine | `/matchup-engine` | `src/app/matchup-engine/page.tsx` |
| Player Props | `/player-props` | `src/app/player-props/page.tsx` |
| Prop Analyzer | `/prop-analyzer` | `src/app/prop-analyzer/page.tsx` |
| Prop Cheatsheet | `/prop-cheatsheet` | `src/app/prop-cheatsheet/page.tsx` |
| Visual Analytics | `/visual-analytics` | `src/app/visual-analytics/page.tsx` |
| Weather & Park | `/weather-park` | `src/app/weather-park/page.tsx` |
| Team Rankings | `/team-rankings` | `src/app/team-rankings/page.tsx` |
| Saved Edges | `/saved-edges` | `src/app/saved-edges/page.tsx` |
| Settings | `/settings` | `src/app/settings/page.tsx` |

---

## How to Migrate Components

### 1. Paste your Vite component into the matching page directory

Each page has a `components/` subfolder. Example:

```
src/app/betting-intelligence/components/
  BettingIntelligencePage.tsx   ← paste your Vite component here
  BettingKPIs.tsx
  BettingLineMovement.tsx
  BettingPropsTable.tsx
```

### 2. Add `'use client'` at the top if the component uses hooks or browser APIs

```tsx
'use client';
import React, { useState } from 'react';
// ... your existing component
```

### 3. Replace `import.meta.env.VITE_*` with `process.env.NEXT_PUBLIC_*`

```ts
// Before (Vite)
const apiMode = import.meta.env.VITE_API_MODE;

// After (Next.js)
const apiMode = process.env.NEXT_PUBLIC_API_MODE;
```

### 4. Replace React Router with Next.js navigation

```tsx
// Before (React Router)
import { useNavigate, Link } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');

// After (Next.js)
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const router = useRouter();
router.push('/dashboard');
```

### 5. Replace Vite alias `@/` — it already works the same in Next.js

```ts
// Works in both Vite and Next.js
import { apiClient } from '@/api/client';
import ErrorBoundary from '@/components/ErrorBoundary';
```

---

## How to Migrate API Calls

### Current adapter setup

```
src/api/
  client.js           ← unified API client (mock or fetch based on env)
  adapters/
    mock.js           ← returns null stubs, logs to console
    fetch.js          ← real HTTP calls to your backend
  base44Client.js     ← compatibility wrapper (maps to client.js)
```

### Switch from mock to real API

In `.env.local`:
```
NEXT_PUBLIC_API_MODE=fetch
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Replace mock data

Each page imports from `src/data/mockData.ts`. Replace those imports with real `apiClient` calls:

```ts
// Before (mock)
import { mockGames } from '@/data/mockData';

// After (real API)
import { apiClient } from '@/api/client';
const { data: games } = await apiClient.get('/api/games');
```

---

## Where Backend Services Go

```
server/
  routes/             ← Express/Fastify route definitions
  controllers/        ← Request handlers (thin layer)
  services/           ← Business logic, data fetching
  scraping/           ← Paste your existing scrapers here
  cache/              ← Paste your Redis/cache modules here
  adapters/           ← External API adapters (normalize responses)
```

**Rule**: Never import from `server/` inside `src/` (frontend). All communication goes through the API layer.

---

## How to Separate Frontend/Backend Logic

| Logic Type | Where It Goes |
|-----------|---------------|
| UI rendering | `src/components/`, `src/app/` |
| State management | `src/state/` |
| Data fetching (frontend) | `src/hooks/`, `src/services/` |
| API client | `src/api/client.js` |
| Business logic | `server/services/` |
| Scraping | `server/scraping/` |
| Caching | `server/cache/` |
| Heavy calculations | `server/services/` |
| Shared types | `shared/types/` |
| Shared constants | `shared/constants/` |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_MODE` | `mock` or `fetch` |
| `NEXT_PUBLIC_API_BASE_URL` | Your backend URL |
| `MLB_API_KEY` | MLB data provider key (server-side only) |
| `WEATHER_API_KEY` | Weather API key (server-side only) |

---

## ErrorBoundary

All pages are wrapped in `<ErrorBoundary>`. If a component crashes, it shows a fallback instead of breaking the whole app.

To wrap a new section:

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourMigratedComponent />
</ErrorBoundary>
```

---

## TODO Markers

Search for `// TODO:` throughout the codebase to find all migration points:

```bash
grep -r "TODO:" src/ server/ shared/ --include="*.ts" --include="*.tsx"
```

---

## Checklist

- [ ] Copy existing page components into matching `src/app/[page]/components/` directories
- [ ] Add `'use client'` to components using hooks or browser APIs
- [ ] Replace `import.meta.env.VITE_*` with `process.env.NEXT_PUBLIC_*`
- [ ] Replace React Router with Next.js `useRouter` and `<Link>`
- [ ] Copy backend services into `server/services/`
- [ ] Copy scrapers into `server/scraping/`
- [ ] Copy cache modules into `server/cache/`
- [ ] Replace mock data imports with real `apiClient` calls
- [ ] Set `NEXT_PUBLIC_API_MODE=fetch` in `.env.local` when backend is ready
- [ ] Run `npm run lint` to catch import/type errors
- [ ] Run `npm run build` to validate production build
