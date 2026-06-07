/**
 * Global app store (Zustand + persist).
 *
 * Combines the cross-page filter state (filtersSlice) with an auth slice.
 * Auth + filters are persisted to localStorage; on rehydrate the JWT is
 * re-applied to the apiClient so authenticated requests keep working.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '@/api/client';
import { defaultFilters, type FiltersState } from './filtersSlice';
import type { PublicUser } from '../../shared/types';

interface AuthSlice {
  currentUser: PublicUser | null;
  token: string | null;
  isAuthenticated: boolean;
  authError: string | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

interface FiltersSlice {
  filters: FiltersState;
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  resetFilters: () => void;
}

export type AppState = AuthSlice & FiltersSlice;

function applyToken(token: string | null, userId: string | null) {
  if (typeof apiClient.setAuthToken === 'function') apiClient.setAuthToken(token);
  if (typeof apiClient.setCurrentUser === 'function') apiClient.setCurrentUser(userId);
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Auth ──
      currentUser: null,
      token: null,
      isAuthenticated: false,
      authError: null,
      authLoading: false,

      login: async (email, password) => {
        set({ authLoading: true, authError: null });
        try {
          const res = await apiClient.login(email, password);
          applyToken(res.token, res.user.id);
          set({
            currentUser: res.user,
            token: res.token,
            isAuthenticated: true,
            authLoading: false,
          });
          return true;
        } catch (e) {
          set({
            authError: e instanceof Error ? e.message : 'Login failed',
            authLoading: false,
          });
          return false;
        }
      },

      register: async (email, password) => {
        set({ authLoading: true, authError: null });
        try {
          const res = await apiClient.register(email, password);
          applyToken(res.token, res.user.id);
          set({
            currentUser: res.user,
            token: res.token,
            isAuthenticated: true,
            authLoading: false,
          });
          return true;
        } catch (e) {
          set({
            authError: e instanceof Error ? e.message : 'Registration failed',
            authLoading: false,
          });
          return false;
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch {
          /* ignore network errors on logout */
        }
        applyToken(null, null);
        set({ currentUser: null, token: null, isAuthenticated: false });
      },

      clearAuthError: () => set({ authError: null }),

      // ── Filters ──
      filters: defaultFilters,
      setFilter: (key, value) => set({ filters: { ...get().filters, [key]: value } }),
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: 'mlbshell-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        filters: state.filters,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) applyToken(state.token, state.currentUser?.id ?? null);
      },
    }
  )
);
