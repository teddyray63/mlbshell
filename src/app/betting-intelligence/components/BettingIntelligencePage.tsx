'use client';

import React, { useState, useCallback } from 'react';
import Topbar from '@/components/Topbar';
import BettingKPIs from './BettingKPIs';
import BettingLineMovement from './BettingLineMovement';
import BettingPropsTable from './BettingPropsTable';
import EdgeCalculator from '@/components/EdgeCalculator';
import OddsComparison from './OddsComparison';
import PlayerSearch from '@/components/filters/PlayerSearch';
import TeamFilter from '@/components/filters/TeamFilter';
import GameFilter from '@/components/filters/GameFilter';
import { MOCK_GAMES } from '@/data/mlbGames';


export default function BettingIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'props' | 'odds' | 'calculator'>('props');
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedGame, setSelectedGame] = useState('');

  const handleTabChange = useCallback((tab: 'props' | 'odds' | 'calculator') => {
    setActiveTab(tab);
  }, []);

  const hasFilters = playerSearch || selectedTeam || selectedGame;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Betting Intelligence"
        subtitle="Sharp line movement, EV%, and market consensus"
        dataSource="live"
      />
      <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-6">
        <BettingKPIs />
        <BettingLineMovement />

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 items-center">
          <PlayerSearch
            value={playerSearch}
            onChange={setPlayerSearch}
            placeholder="Filter by player…"
            className="w-48"
          />
          <TeamFilter value={selectedTeam} onChange={setSelectedTeam} showLabel />
          <GameFilter games={MOCK_GAMES} value={selectedGame} onChange={setSelectedGame} showLabel />
          {hasFilters && (
            <button
              onClick={() => { setPlayerSearch(''); setSelectedTeam(''); setSelectedGame(''); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:bg-muted/50"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-border">
          {([
            { key: 'props', label: 'Prop Lines' },
            { key: 'odds', label: 'Odds Comparison' },
            { key: 'calculator', label: 'EV Calculator' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'props' && (
          <BettingPropsTable
            playerFilter={playerSearch}
            teamFilter={selectedTeam}
            gameFilter={selectedGame}
          />
        )}
        {activeTab === 'odds' && <OddsComparison />}
        {activeTab === 'calculator' && <EdgeCalculator />}
      </div>
    </div>
  );
}