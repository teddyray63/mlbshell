import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type TrendDir = 'up' | 'down' | 'neutral';
type CardVariant = 'default' | 'alert' | 'warning' | 'positive';

interface MetricCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  trend?: TrendDir;
  trendLabel?: string;
  variant?: CardVariant;
  icon?: React.ReactNode;
  className?: string;
  span?: 1 | 2;
}

const variantStyles: Record<CardVariant, { card: string; value: string }> = {
  default: { card: 'card-surface', value: 'text-foreground' },
  alert: { card: 'card-surface border-negative/40 bg-negative-subtle', value: 'text-negative' },
  warning: { card: 'card-surface border-warning/40 bg-warning-subtle', value: 'text-warning' },
  positive: { card: 'card-surface border-positive/40 bg-positive-subtle', value: 'text-positive' },
};

const trendIcon: Record<TrendDir, React.ReactNode> = {
  up: <TrendingUp size={12} />,
  down: <TrendingDown size={12} />,
  neutral: <Minus size={12} />,
};

const trendColor: Record<TrendDir, string> = {
  up: 'text-positive',
  down: 'text-negative',
  neutral: 'text-muted-foreground',
};

export default function MetricCard({
  label,
  value,
  subvalue,
  trend,
  trendLabel,
  variant = 'default',
  icon,
  className = '',
}: MetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`${styles.card} p-4 flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold font-mono-data ${styles.value}`}>{value}</div>
      {(trend || subvalue) && (
        <div className="flex items-center gap-2">
          {trend && (
            <span className={`flex items-center gap-1 text-xs font-semibold ${trendColor[trend]}`}>
              {trendIcon[trend]}
              {trendLabel}
            </span>
          )}
          {subvalue && <span className="text-xs text-muted-foreground">{subvalue}</span>}
        </div>
      )}
    </div>
  );
}
