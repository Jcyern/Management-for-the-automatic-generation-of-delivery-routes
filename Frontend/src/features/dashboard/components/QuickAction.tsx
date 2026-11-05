import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import './QuickAction.css';

interface QuickActionProps {
  /** Visible label of the action. */
  label: string;

  /** Short description of what the action does. */
  description: string;

  /** Route the action navigates to. */
  to: string;

  /** Icon rendered on the left. */
  icon: ReactNode;
}

/**
 * Card that links to a key action in the system.
 *
 * Used in the dashboard home to surface the most relevant actions per role.
 */
export function QuickAction({ label, description, to, icon }: QuickActionProps) {
  return (
    <Link to={to} className="quick-action">
      <span className="quick-action-icon">{icon}</span>
      <span className="quick-action-body">
        <span className="quick-action-label">{label}</span>
        <span className="quick-action-description">{description}</span>
      </span>
    </Link>
  );
}