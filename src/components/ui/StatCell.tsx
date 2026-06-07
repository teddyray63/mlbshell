'use client';

import React from 'react';
import { getStatColor, type StatPerspective } from '@/utils/statColorCoder';

interface StatCellProps {
  /** Stat key matched by the color coder (e.g. 'wOBA', 'barrelPct'). */
  stat: string;
  value: number | null | undefined;
  type?: StatPerspective;
  /** Optional formatter; defaults to the raw value or '—'. */
  format?: (v: number | null | undefined) => string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * A heat-mapped table cell. Applies the global green/yellow/red stat color
 * coding (propfinder-style) based on the stat threshold for batter/pitcher.
 */
export default function StatCell({
  stat,
  value,
  type = 'batter',
  format,
  align = 'right',
  className = '',
}: StatCellProps) {
  const color = getStatColor(stat, value, type);
  const text = format ? format(value) : value == null ? '—' : String(value);
  const alignCls =
    align === 'left' ? 'text-left' : align === 'center' ? 'text-center' : 'text-right';
  return <td className={`px-2 py-1.5 font-mono-data ${alignCls} ${color} ${className}`}>{text}</td>;
}
