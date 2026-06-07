import React from 'react';

type BadgeVariant = 'sharp' | 'square' | 'positive' | 'negative' | 'warning' | 'info' | 'neutral';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  sharp: 'badge-sharp',
  square: 'badge-square',
  positive: 'badge-positive',
  negative: 'badge-negative',
  warning: 'badge-warning',
  info: 'badge-info',
  neutral: 'bg-muted text-muted-foreground border border-border',
};

export default function StatusBadge({
  variant,
  children,
  className = '',
  dot = false,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold leading-none ${variantClasses[variant]} ${className}`}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: 'currentColor' }}
        />
      )}
      {children}
    </span>
  );
}
