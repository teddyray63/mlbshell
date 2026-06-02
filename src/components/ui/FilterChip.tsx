'use client';

import React from 'react';

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 border
        ${active
          ? 'bg-info-subtle text-primary border-primary/40' :'bg-muted text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
        }`}
    >
      {label}
    </button>
  );
}