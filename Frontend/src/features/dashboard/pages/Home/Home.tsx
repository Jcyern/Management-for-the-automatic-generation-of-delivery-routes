import { useAuth } from '../../../auth/context/AuthContext';
import { CoordinadorHome } from './views/CoordinadorHome';
import { RepartidorHome } from './views/RepartidorHome';
import { SupervisorHome } from './views/SupervisorHome';
import { AdminHome } from './views/AdminHome';
import './Home.css';

/**
 * Home page of the dashboard.
 *
 * Renders a role-specific view of the home content while sharing the
 * same layout, header and sidebar for all users.
 */
export function Home() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="home">
      <header className="home-welcome">
        <h1 className="home-welcome-title">Hola, {user.name}</h1>
        <p className="home-welcome-subtitle">
          Este es tu panel de inicio.
        </p>
      </header>

      {user.role === 'coordinador' && <CoordinadorHome />}
      {user.role === 'repartidor' && <RepartidorHome />}
      {user.role === 'supervisor' && <SupervisorHome />}
      {user.role === 'admin' && <AdminHome />}
    </div>
  );
}