import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './DashboardLayout.css';

/**
 * Main layout of the dashboard.
 *
 * Renders the sidebar on the left and the header on top. Child routes
 * are rendered inside the main content area via `<Outlet />`.
 */
export function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}