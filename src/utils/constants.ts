/**
 * constants.ts — shared MLB domain constants.
 * TODO: Move to env-driven config if values need to vary by environment.
 */

// MLB_TEAMS is the single source of truth in shared/constants — re-exported here
// for convenience so existing `@/utils/constants` imports keep working.
export { MLB_TEAMS } from '../../shared/constants';
export type { MLBTeam } from '../../shared/constants';

export const HANDEDNESS = ['all', 'vs-LHP', 'vs-RHP'] as const;

export const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7' },
  { value: 'last30', label: 'Last 30' },
  { value: 'season', label: 'Season' },
] as const;

export const STAT_THRESHOLDS = {
  barrelRate: { elite: 0.15, average: 0.08 },
  exitVelo: { elite: 95, average: 89 },
  woba: { elite: 0.38, average: 0.32 },
  kRate: { elite: 0.32, average: 0.22 },
  ev: { positive: 3, negative: -3 },
} as const;
