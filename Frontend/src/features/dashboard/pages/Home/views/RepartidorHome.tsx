import { Route, RefreshCw, BarChart3 } from 'lucide-react';
import { StatCard } from '../../../components/StatCard';
import { QuickAction } from '../../../components/QuickAction';
import { SectionHeader } from '../../../components/SectionHeader';

/**
 * Home view for users with the `repartidor` role.
 *
 * Focuses on the routes assigned to the delivery person and their pending
 * deliveries for the current shift.
 */
export function RepartidorHome() {
  return (
    <>
      <SectionHeader
        title="Tu jornada"
        subtitle="Estado de tus rutas y entregas de hoy"
      />

      <div className="home-stats">
        <StatCard
          label="Rutas asignadas"
          value={2}
          hint="una en ejecución"
          accent="teal"
          icon={<Route size={18} />}
        />
        <StatCard
          label="Entregas pendientes"
          value={14}
          hint="de 18 programadas"
          accent="yellow"
        />
        <StatCard
          label="Reprogramaciones"
          value={1}
          hint="esperando respuesta"
          accent="coral"
          icon={<RefreshCw size={18} />}
        />
      </div>

      <SectionHeader title="Acciones rápidas" />

      <div className="home-actions">
        <QuickAction
          label="Mis rutas"
          description="Ver detalle y actualizar estado"
          to="/dashboard/rutas"
          icon={<Route size={20} />}
        />
        <QuickAction
          label="Solicitar reprogramación"
          description="Reprogramar una entrega pendiente"
          to="/dashboard/reprogramaciones"
          icon={<RefreshCw size={20} />}
        />
        <QuickAction
          label="Mis reportes"
          description="Consultar historial de entregas"
          to="/dashboard/reportes"
          icon={<BarChart3 size={20} />}
        />
      </div>
    </>
  );
}