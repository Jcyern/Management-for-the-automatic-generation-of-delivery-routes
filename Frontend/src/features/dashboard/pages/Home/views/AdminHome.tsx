import { Users, Building2, AlertTriangle, BarChart3 } from 'lucide-react';
import { StatCard } from '../../../components/StatCard';
import { QuickAction } from '../../../components/QuickAction';
import { SectionHeader } from '../../../components/SectionHeader';

/**
 * Home view for users with the `admin` role.
 *
 * Focuses on system health: conflicts to resolve, user management,
 * and overall operations.
 */
export function AdminHome() {
  return (
    <>
      <SectionHeader
        title="Estado del sistema"
        subtitle="Alertas y métricas generales de operación"
      />

      <div className="home-stats">
        <StatCard
          label="Conflictos abiertos"
          value={2}
          hint="pedidos duplicados o asignaciones dobles"
          accent="coral"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Usuarios activos"
          value={28}
          hint="en los 4 roles del sistema"
          accent="teal"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Centros en operación"
          value={3}
          hint="con rutas activas"
          accent="yellow"
          icon={<Building2 size={18} />}
        />
      </div>

      <SectionHeader title="Acciones rápidas" />

      <div className="home-actions">
        <QuickAction
          label="Gestionar usuarios"
          description="Crear, editar y asignar roles"
          to="/dashboard/usuarios"
          icon={<Users size={20} />}
        />
        <QuickAction
          label="Centros de distribución"
          description="Administrar centros y zonas"
          to="/dashboard/centros"
          icon={<Building2 size={20} />}
        />
        <QuickAction
          label="Ver reportes globales"
          description="Métricas de toda la operación"
          to="/dashboard/reportes"
          icon={<BarChart3 size={20} />}
        />
      </div>
    </>
  );
}