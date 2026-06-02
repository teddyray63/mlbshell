# server/scraping

This directory is reserved for your existing scraping infrastructure.

## Migration Instructions

1. Copy your existing scraper files into this directory.
2. Each scraper should be a standalone module (e.g. `weatherScraper.ts`, `oddsScraper.ts`).
3. Scrapers should **never** be imported directly into React components.
4. All scraping logic must go through `server/services/` → `server/controllers/` → `server/routes/`.

## Example Structure

```
server/scraping/
  weatherScraper.ts     ← paste your weather scraper here
  oddsScraper.ts        ← paste your odds scraper here
  statsScraper.ts       ← paste your stats scraper here
  index.ts              ← export all scrapers
```

## TODO

- [ ] Paste existing scraper files here
- [ ] Wire scrapers into `server/services/`
- [ ] Add caching layer via `server/cache/`
