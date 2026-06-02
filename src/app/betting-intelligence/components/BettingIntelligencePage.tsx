'use client';

import React, { useState, useCallback } from 'react';
import Topbar from '@/components/Topbar';
import BettingKPIs from './BettingKPIs';
import BettingLineMovement from './BettingLineMovement';
import BettingPropsTable from './BettingPropsTable';
import EdgeCalculator from '@/components/EdgeCalculator';
import OddsComparison from './OddsComparison';

export default function BettingIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'props' | 'odds' | 'calculator'>('props');

  const handleTabChange = useCallback((tab: 'props' | 'odds' | 'calculator') => {
    setActiveTab(tab);
  }, []);

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

        {activeTab === 'props' && <BettingPropsTable />}
        {activeTab === 'odds' && <OddsComparison />}
        {activeTab === 'calculator' && <EdgeCalculator />}
      </div>
    </div>
  );
}