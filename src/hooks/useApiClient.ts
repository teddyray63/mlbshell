/**
 * useApiClient — React hook returning the singleton apiClient.
 * TODO: Add SWR or React Query wrapping here for caching and revalidation.
 */

import apiClient from '@/api/client';

export function useApiClient() {
  // TODO: Optionally wrap with context provider if adapter needs to be swappable at runtime
  return apiClient;
}