'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Topbar from '@/components/Topbar';
import AdvancedAnalyticsFilters from './AdvancedAnalyticsFilters';
import AdvancedAnalyticsKPIs from './AdvancedAnalyticsKPIs';
import AdvancedAnalyticsCharts from './AdvancedAnalyticsCharts';
import AdvancedAnalyticsTable from './AdvancedAnalyticsTable';
import PlayerSearch from '@/components/filters/PlayerSearch';
import TeamFilter from '@/components/filters/TeamFilter';
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
  const [handedness, setHandedness] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  const loadData = useCallback(async (year: string, min: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      let result = await fetchStatcastLeaderboard({ year, min, type: 'batter' });
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

  const filteredPlayers = useMemo(() => {
    let result = state.players;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)
      );
    }
    if (selectedTeam) {
      result = result.filter((p) => p.team === selectedTeam);
    }
    if (handedness === 'vs-LHP') {
      result = result.filter((p) => p.position !== 'SP' && p.position !== 'RP');
    } else if (handedness === 'vs-RHP') {
      result = result.filter((p) => p.position !== 'SP' && p.position !== 'RP');
    }
    return result;
  }, [state.players, search, handedness, selectedTeam]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Advanced Analytics"
        subtitle={
          state.fetchedAt
            ? `Live Statcast data — ${state.year} season · Updated ${new Date(state.fetchedAt).toLocaleTimeString()}`
            : 'Player & team statistical breakdowns — Statcast data'
        }
        dataSource={state.loading ? 'mock' : 'live'}
      />
      <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-6">
        {/* Filters */}
        <AdvancedAnalyticsFilters
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          minPA={minPA}
          onMinPAChange={setMinPA}
          handedness={handedness}
          onHandednessChange={setHandedness}
          search={search}
          onSearchChange={setSearch}
        />

        {/* Team filter + player search row */}
        <div className="flex flex-wrap gap-3 items-center">
          <PlayerSearch
            value={search}
            onChange={setSearch}
            placeholder="Search player…"
            className="w-48"
            showDropdown={false}
          />
          <TeamFilter value={selectedTeam} onChange={setSelectedTeam} showLabel />
          {(selectedTeam || search) && (
            <button
              onClick={() => { setSelectedTeam(''); setSearch(''); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:bg-muted/50"
            >
              Clear
            </button>
          )}
          {filteredPlayers.length !== state.players.length && (
            <span className="text-xs text-muted-foreground font-mono-data">
              {filteredPlayers.length} of {state.players.length} players
            </span>
          )}
        </div>

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

        {/* Stat Table — uses filtered players */}
        <AdvancedAnalyticsTable players={filteredPlayers} loading={state.loading} />
      </div>
    </div>
  );
}