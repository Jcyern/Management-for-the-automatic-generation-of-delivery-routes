import './SectionHeader.css';

interface SectionHeaderProps {
  /** Title of the section. */
  title: string;

  /** Optional subtitle or short description. */
  subtitle?: string;
}

/**
 * Small header used to separate sections within the dashboard home.
 */
export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <h2 className="section-header-title">{title}</h2>
      {subtitle && <p className="section-header-subtitle">{subtitle}</p>}
    </div>
  );
}