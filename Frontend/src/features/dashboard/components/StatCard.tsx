import type { ReactNode } from 'react';
import './StatCard.css';

interface StatCardProps {
  /** Short label describing the metric. */
  label: string;

  /** Main value of the metric. */
  value: string | number;

  /** Optional secondary text shown below the value. */
  hint?: string;

  /** Accent color for the card. */
  accent?: 'teal' | 'coral' | 'yellow' | 'neutral';

  /** Optional icon rendered in the top-right corner. */
  icon?: ReactNode;
}

/**
 * Small card that displays a single metric.
 *
 * Used in the dashboard home to show quick stats per role.
 */
export function StatCard({
  label,
  value,
  hint,
  accent = 'neutral',
  icon,
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>
      <span className="stat-card-value">{value}</span>
      {hint && <span className="stat-card-hint">{hint}</span>}
    </div>
  );
}