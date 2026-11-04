import { Package, Route, RefreshCw, BarChart3 } from 'lucide-react';
import { StatCard } from '../../../components/StatCard';
import { QuickAction } from '../../../components/QuickAction';
import { SectionHeader } from '../../../components/SectionHeader';

/**
 * Home view for users with the `coordinador` role.
 *
 * Shows order and route activity, plus quick access to the main actions
 * a logistics coordinator performs daily.
 */
export function CoordinadorHome() {
  return (
    <>
      <SectionHeader
        title="Actividad de hoy"
        subtitle="Resumen de pedidos y rutas bajo tu gestión"
      />

      <div className="home-stats">
        <StatCard
          label="Pedidos pendientes"
          value={42}
          hint="en tus centros asignados"
          accent="teal"
          icon={<Package size={18} />}
        />
        <StatCard
          label="Rutas generadas"
          value={7}
          hint="listas para asignar"
          accent="yellow"
          icon={<Route size={18} />}
        />
        <StatCard
          label="Reprogramaciones"
          value={3}
          hint="solicitadas por repartidores"
          accent="coral"
          icon={<RefreshCw size={18} />}
        />
      </div>

      <SectionHeader title="Acciones rápidas" />

      <div className="home-actions">
        <QuickAction
          label="Gestionar pedidos"
          description="Ver, crear y clasificar pedidos"
          to="/dashboard/pedidos"
          icon={<Package size={20} />}
        />
        <QuickAction
          label="Generar ruta"
          description="Crear una ruta a partir de pedidos"
          to="/dashboard/rutas"
          icon={<Route size={20} />}
        />
        <QuickAction
          label="Resolver reprogramaciones"
          description="Atender solicitudes pendientes"
          to="/dashboard/reprogramaciones"
          icon={<RefreshCw size={20} />}
        />
        <QuickAction
          label="Ver reportes"
          description="Consultar métricas y desempeño"
          to="/dashboard/reportes"
          icon={<BarChart3 size={20} />}
        />
      </div>
    </>
  );
}