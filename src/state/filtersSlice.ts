/**
 * filtersSlice — lightweight filter state for cross-page filter persistence.
 * TODO: Replace with Zustand, Redux Toolkit, or Jotai as needed when migrating state.
 */

export interface FiltersState {
  dateRange: 'today' | 'last7' | 'last30' | 'season';
  handedness: 'all' | 'vs-LHP' | 'vs-RHP';
  team: string;
  position: string;
  minPA: number;
}

export const defaultFilters: FiltersState = {
  dateRange: 'today',
  handedness: 'all',
  team: 'all',
  position: 'all',
  minPA: 10,
};
