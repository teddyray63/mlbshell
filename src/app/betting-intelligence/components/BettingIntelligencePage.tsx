import React from 'react';
import Topbar from '@/components/Topbar';
import BettingKPIs from './BettingKPIs';
import BettingLineMovement from './BettingLineMovement';
import BettingPropsTable from './BettingPropsTable';

// TODO: Paste your existing BettingIntelligence page-level logic here
export default function BettingIntelligencePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Betting Intelligence"
        subtitle="Sharp line movement, EV%, and market consensus — Jun 1, 2026"
      />
      <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-6">
        <BettingKPIs />
        <BettingLineMovement />
        <BettingPropsTable />
      </div>
    </div>
  );
}
