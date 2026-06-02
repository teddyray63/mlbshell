# server/cache

This directory is reserved for your caching infrastructure.

## Migration Instructions

1. Copy your existing cache modules here (Redis, in-memory, file-based, etc.).
2. Cache modules should wrap service calls, not controller logic.
3. Use TTL-based invalidation for live data (odds, scores).

## Example Structure

```
server/cache/
  redisClient.ts        ← paste your Redis client here
  cacheMiddleware.ts    ← paste your cache middleware here
  keys.ts               ← cache key constants
```

## TODO

- [ ] Paste existing cache modules here
- [ ] Wire cache into `server/services/`
- [ ] Configure TTL values per data type
