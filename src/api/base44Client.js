/**
 * base44Client.js — compatibility re-export for Vite React migration.
 *
 * If your existing Vite components import from 'base44Client' or similar,
 * update those imports to point here. This re-exports the central apiClient
 * so migration is a one-line find-and-replace.
 *
 * Usage in migrated components:
 *   import { base44 } from '@/api/base44Client';
 *   // or
 *   import apiClient from '@/api/base44Client';
 */

import apiClient from './client';

export const base44 = apiClient;
export default apiClient;