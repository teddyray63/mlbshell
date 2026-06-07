/**
 * mockProps — re-export of the shared mock dataset (shared/mockSeed) so client
 * code can import via the `@/data/mockProps` path. The single source of truth
 * lives in shared/ so both the client mock adapter and the Express backend
 * consume identical seed data.
 */

export {
  mockGameList,
  mockWeatherList,
  mockPlayerPropInputs,
  mockTeamRankings,
  mockSavedEdgesSeed,
  mockAnalyticsData,
  mockPlayerEnrichment,
} from '../../shared/mockSeed';
