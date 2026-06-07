'use client';

import React, { useState } from 'react';
import { playerPhotoUrl } from '@/utils/playerPhoto';

interface PlayerPhotoProps {
  playerId: string | number | undefined | null;
  alt: string;
  size?: number;
  className?: string;
}

const FALLBACK =
  'https://img.mlbstatic.com/mlb-photos/image/upload/w_180,q_100/v1/people/0/headshot/67/current';

/** A round MLB headshot with graceful fallback to the generic silhouette. */
export default function PlayerPhoto({
  playerId,
  alt,
  size = 48,
  className = '',
}: PlayerPhotoProps) {
  const [src, setSrc] = useState(playerPhotoUrl(playerId));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => src !== FALLBACK && setSrc(FALLBACK)}
      className={`rounded-full bg-muted object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
