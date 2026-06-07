'use client';

import React from 'react';
import Link from 'next/link';

interface PlayerLinkProps {
  playerId: string | number | undefined | null;
  name: string;
  prop?: string;
  className?: string;
}

/**
 * PlayerLink — renders a player name that links to /players/[playerId]. Falls
 * back to plain text when no numeric id is available so the UI never produces a
 * dead link. Used everywhere a player name appears (tables, cards, prop rows).
 */
export default function PlayerLink({ playerId, name, prop, className = '' }: PlayerLinkProps) {
  const id = String(playerId ?? '');
  const linkable = /^\d+$/.test(id);
  if (!linkable) {
    return <span className={className}>{name}</span>;
  }
  const href = prop ? `/players/${id}?prop=${encodeURIComponent(prop)}` : `/players/${id}`;
  return (
    <Link
      href={href}
      className={`text-primary hover:underline ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </Link>
  );
}
