/**
 * Central API client.
 * Switches between adapters based on NEXT_PUBLIC_API_MODE env variable.
 *
 * NEXT_PUBLIC_API_MODE=mock  → uses MockAdapter (default)
 * NEXT_PUBLIC_API_MODE=fetch → uses FetchAdapter
 *
 * TODO: Add additional adapters (e.g. graphql, supabase) here
 */

import MockAdapter from './adapters/mock';
import FetchAdapter from './adapters/fetch';

const mode = process.env.NEXT_PUBLIC_API_MODE || 'mock';

const adapters = {
  mock:  MockAdapter,
  fetch: FetchAdapter,
};

const SelectedAdapter = adapters?.[mode] || MockAdapter;

/**
 * apiClient — singleton instance of the selected adapter.
 * Use this throughout the app for all data fetching.
 */
const apiClient = new SelectedAdapter({
  baseUrl:     process.env.NEXT_PUBLIC_API_BASE_URL || '',
  mlbApiKey:   process.env.NEXT_PUBLIC_MLB_API_KEY || '',
  weatherKey:  process.env.NEXT_PUBLIC_WEATHER_API_KEY || '',
});

export default apiClient;