import { CheckCircle2, Route, BarChart3, Building2 } from 'lucide-react';
import { StatCard } from '../../../components/StatCard';
import { QuickAction } from '../../../components/QuickAction';
import { SectionHeader } from '../../../components/SectionHeader';

/**
 * Home view for users with the `supervisor` role.
 *
 * Highlights the routes waiting for validation and the operational
 * performance across distribution centers.
 */
export function SupervisorHome() {
  return (
    <>
      <SectionHeader
        title="Operación en curso"
        subtitle="Rutas pendientes de validación y estado general"
      />

      <div className="home-stats">
        <StatCard
          label="Rutas por validar"
          value={5}
          hint="esperando tu aprobación"
          accent="coral"
          icon={<CheckCircle2 size={18} />}
        />
        <StatCard
          label="Rutas activas"
          value={12}
          hint="en ejecución ahora mismo"
          accent="teal"
          icon={<Route size={18} />}
        />
        <StatCard
          label="Centros supervisados"
          value={3}
          hint="en operación"
          accent="yellow"
          icon={<Building2 size={18} />}
        />
      </div>

      <SectionHeader title="Acciones rápidas" />

      <div className="home-actions">
        <QuickAction
          label="Validar rutas"
          description="Revisar y aprobar rutas generadas"
          to="/dashboard/rutas"
          icon={<CheckCircle2 size={20} />}
        />
        <QuickAction
          label="Ver reportes"
          description="Analizar desempeño y cumplimiento"
          to="/dashboard/reportes"
          icon={<BarChart3 size={20} />}
        />
        <QuickAction
          label="Centros de distribución"
          description="Consultar cobertura y zonas"
          to="/dashboard/centros"
          icon={<Building2 size={20} />}
        />
      </div>
    </>
  );
}