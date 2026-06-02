# server/adapters

This directory is reserved for your backend data source adapters.

## Migration Instructions

1. Each external data provider gets its own adapter file.
2. Adapters normalize raw API responses into your shared types.
3. Controllers call adapters, not raw HTTP clients.

## Example Structure

```
server/adapters/
  mlbStatsAdapter.ts    ← MLB Stats API adapter
  oddsAdapter.ts        ← Odds provider adapter
  weatherAdapter.ts     ← Weather API adapter
```

## TODO

- [ ] Paste existing adapter files here
- [ ] Ensure adapters return types from `/shared/types/`
