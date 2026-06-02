'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/Topbar';
import AdvancedAnalyticsFilters from './AdvancedAnalyticsFilters';
import AdvancedAnalyticsKPIs from './AdvancedAnalyticsKPIs';
import AdvancedAnalyticsCharts from './AdvancedAnalyticsCharts';
import AdvancedAnalyticsTable from './AdvancedAnalyticsTable';
import {
  fetchStatcastLeaderboard,
  deriveKPIs,
  buildWobaTrendFromLeaderboard,
  buildBattedBallProfile,
  type StatcastPlayer,
  type StatcastKPIs,
  type WobaTrendPoint,
  type BattedBallPoint,
} from '@/services/statcastService';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AnalyticsState {
  players: StatcastPlayer[];
  kpis: StatcastKPIs | null;
  wobaTrend: WobaTrendPoint[];
  battedBall: BattedBallPoint[];
  loading: boolean;
  error: string | null;
  year: string;
  fetchedAt: string | null;
}

const INITIAL_STATE: AnalyticsState = {
  players: [],
  kpis: null,
  wobaTrend: [],
  battedBall: [],
  loading: true,
  error: null,
  year: new Date().getFullYear().toString(),
  fetchedAt: null,
};

export default function AdvancedAnalyticsPage() {
  const [state, setState] = useState<AnalyticsState>(INITIAL_STATE);
  const [minPA, setMinPA] = useState('50');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const loadData = useCallback(async (year: string, min: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchStatcastLeaderboard({ year, min, type: 'batter' });
      const kpis = deriveKPIs(result.players);
      const wobaTrend = buildWobaTrendFromLeaderboard(result.players);
      const battedBall = buildBattedBallProfile(result.players);
      setState({
        players: result.players,
        kpis,
        wobaTrend,
        battedBall,
        loading: false,
        error: null,
        year: result.year,
        fetchedAt: result.fetchedAt,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load Statcast data';
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  useEffect(() => {
    loadData(selectedYear, minPA);
  }, [loadData, selectedYear, minPA]);

  const handleRetry = () => loadData(selectedYear, minPA);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Advanced Analytics"
        subtitle={
          state.fetchedAt
            ? `Live Statcast data — ${state.year} season · Updated ${new Date(state.fetchedAt).toLocaleTimeString()}`
            : 'Player & team statistical breakdowns — Statcast data'
        }
      />
      <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-6">
        {/* Filters */}
        <AdvancedAnalyticsFilters
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          minPA={minPA}
          onMinPAChange={setMinPA}
        />

        {/* Error Banner */}
        {state.error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-negative/10 border border-negative/30 text-sm text-negative">
            <AlertTriangle size={16} className="shrink-0" />
            <span className="flex-1">
              <strong>Statcast data unavailable:</strong> {state.error}
            </span>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-negative/20 hover:bg-negative/30 text-xs font-semibold transition-colors"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <AdvancedAnalyticsKPIs kpis={state.kpis} loading={state.loading} />

        {/* Charts */}
        <AdvancedAnalyticsCharts
          wobaTrend={state.wobaTrend}
          battedBall={state.battedBall}
          loading={state.loading}
        />

        {/* Stat Table */}
        <AdvancedAnalyticsTable players={state.players} loading={state.loading} />
      </div>
    </div>
  );
}