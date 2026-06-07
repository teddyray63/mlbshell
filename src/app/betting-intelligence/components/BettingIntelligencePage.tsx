import React from 'react';
import Topbar from '@/components/Topbar';
import BettingKPIs from './BettingKPIs';
import BettingLineMovement from './BettingLineMovement';
import BettingPropsTable from './BettingPropsTable';

export default function BettingIntelligencePage() {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Betting Intelligence"
        subtitle={`Sharp line movement, EV%, and market consensus — ${today}`}
      />
      <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-6">
        <BettingKPIs />
        <BettingLineMovement />
        <BettingPropsTable />
      </div>
    </div>
  );
}
