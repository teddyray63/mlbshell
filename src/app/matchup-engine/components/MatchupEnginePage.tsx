import React from 'react';
import Topbar from '@/components/Topbar';
import MatchupSelector from './MatchupSelector';
import MatchupSplitPanel from './MatchupSplitPanel';
import MatchupWeatherStrip from './MatchupWeatherStrip';
import TodoMarker from '@/components/ui/TodoMarker';

// TODO: Paste your existing MatchupEngine page-level logic here
export default function MatchupEnginePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Matchup Engine"
        subtitle="Pitcher vs. batter analysis with park and weather context"
      />
      <div className="flex-1 px-6 py-5 max-w-screen-2xl mx-auto w-full space-y-5">
        <TodoMarker
          pageName="MatchupEngine"
          description="Wire MatchupSelector to analyticsService.fetchMatchup(pitcherId, batterId) and propagate result to split panels below."
        />
        <MatchupSelector />
        <MatchupSplitPanel />
        <MatchupWeatherStrip />
      </div>
    </div>
  );
}