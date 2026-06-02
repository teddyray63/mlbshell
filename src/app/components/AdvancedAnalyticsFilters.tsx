'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import FilterChip from '@/components/ui/FilterChip';
import { DATE_RANGES } from '@/utils/constants';

// TODO: Wire filter state to analyticsService.fetchAdvancedStats()
export default function AdvancedAnalyticsFilters() {
  const [dateRange, setDateRange] = useState<string>('today');
  const [handedness, setHandedness] = useState<string>('all');
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e?.target?.value)}
          placeholder="Search player or team…"
          className="w-full pl-8 pr-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {/* Date range */}
        <div className="flex items-center gap-1">
          {DATE_RANGES?.map((r) => (
            <FilterChip
              key={`date-${r?.value}`}
              label={r?.label}
              active={dateRange === r?.value}
              onClick={() => setDateRange(r?.value)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border" />

        {/* Handedness */}
        {['all', 'vs-LHP', 'vs-RHP']?.map((h) => (
          <FilterChip
            key={`hand-${h}`}
            label={h === 'all' ? 'All' : h}
            active={handedness === h}
            onClick={() => setHandedness(h)}
          />
        ))}

        <button className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-150">
          <SlidersHorizontal size={12} />
          Filters
        </button>
      </div>
    </div>
  );
}