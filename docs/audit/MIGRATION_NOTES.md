# MLBShell — Migration Notes

## Overview

This shell mirrors the route and folder structure of the original Vite React MLB analytics app.
The goal is to allow existing component files to be dropped in with minimal changes.

## Route Mapping

| Original Vite route        | Next.js App Router route              | Entry file                                      |
|----------------------------|---------------------------------------|-------------------------------------------------|
| `/`                        | `src/app/page.tsx`                    | AdvancedAnalytics (entry screen)                |
| `/advanced-analytics`      | `src/app/page.tsx`                    | AdvancedAnalytics                               |
| `/betting-intelligence`    | `src/app/betting-intelligence/`       | BettingIntelligence                             |
| `/matchup-engine`          | `src/app/matchup-engine/`             | MatchupEngine                                   |
| `/player-props`            | `src/app/player-props/`              | PlayerProps                                     |
| `/prop-analyzer`           | `src/app/prop-analyzer/`             | PropAnalyzer                                    |
| `/prop-cheatsheet`         | `src/app/prop-cheatsheet/`           | PropCheatsheet                                  |
| `/visual-analytics`        | `src/app/visual-analytics/`          | VisualAnalytics                                 |
| `/weather-park`            | `src/app/weather-park/`              | WeatherPark                                     |

## API Client Migration

Replace all Vite-era API imports with:

// Before (Vite)
import { base44 } from '../base44Client';

// After (Next.js)
import { base44 } from '@/api/base44Client';
// or
import apiClient from '@/api/client';

## Environment Variables

Vite uses `VITE_` prefix. Next.js uses `NEXT_PUBLIC_` prefix for client-exposed vars.

| Vite variable         | Next.js equivalent             |
|-----------------------|--------------------------------|
| `VITE_API_MODE`       | `NEXT_PUBLIC_API_MODE`         |
| `VITE_API_BASE_URL`   | `NEXT_PUBLIC_API_BASE_URL`     |
| `VITE_MLB_API_KEY`    | `NEXT_PUBLIC_MLB_API_KEY`      |
| `VITE_WEATHER_API_KEY`| `NEXT_PUBLIC_WEATHER_API_KEY`  |

## Component Migration Checklist

- [ ] Replace `import.meta.env.VITE_*` with `process.env.NEXT_PUBLIC_*`
- [ ] Replace React Router `<Link>` with Next.js `<Link>` from `next/link`
- [ ] Replace React Router `useNavigate` with Next.js `useRouter` from `next/navigation`
- [ ] Replace React Router `useParams` with Next.js `useParams` from `next/navigation`
- [ ] Add `'use client'` directive to any component using useState, useEffect, or event handlers
- [ ] Wrap Recharts components in `dynamic(() => import(...), { ssr: false })`
- [ ] Move any server-side scraping or heavy computation to `src/app/api/` route handlers
- [ ] Update all relative imports to use `@/` alias (configured in tsconfig.json)

## Folder Structure

src/
  api/
    client.js              ← Central API client (adapter pattern)
    base44Client.js        ← Compatibility re-export for Vite migration
    adapters/
      mock.js              ← Mock adapter (default)
      fetch.js             ← Fetch adapter (NEXT_PUBLIC_API_MODE=fetch)
  app/
    page.tsx               ← AdvancedAnalytics (entry)
    betting-intelligence/
    matchup-engine/
    player-props/
    prop-analyzer/
    prop-cheatsheet/
    visual-analytics/
    weather-park/
    settings/
  charts/                  ← All Recharts components (must be 'use client')
  components/
    AppLayout.tsx
    Sidebar.tsx
    Topbar.tsx
    ErrorBoundary.jsx      ← Wraps all major page routes
    ui/
  hooks/                   ← Custom hooks (useApiClient, etc.)
  services/                ← Business logic layer
  state/                   ← Filter/app state types
  utils/                   ← Formatters, constants

## Notes

- All scraping, caching, and heavy processing belongs in `/server` or `src/app/api/` route handlers — never in React components
- The `docs/audit/` folder is preserved here for reference during migration
- ErrorBoundary is a class component (JSX) for React error boundary compatibility