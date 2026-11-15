import { Pencil, Trash2 } from 'lucide-react';
import type { Zona } from '../types/zona';
import './ZonasTable.css';

interface ZonasTableProps {
  /** Zones to display. */
  zonas: Zona[];

  /** Whether the current user can edit and delete zones. */
  canManage: boolean;

  /** Callback fired when the user wants to edit a zone. */
  onEdit: (zona: Zona) => void;

  /** Callback fired when the user wants to delete a zone. */
  onDelete: (zona: Zona) => void;
}

/**
 * Table that lists the available zones.
 *
 * The actions column is only rendered when `canManage` is true.
 */
export function ZonasTable({
  zonas,
  canManage,
  onEdit,
  onDelete,
}: ZonasTableProps) {
  if (zonas.length === 0) {
    return <div className="zonas-table-empty">No hay zonas registradas.</div>;
  }

  return (
    <div className="zonas-table-wrapper">
      <table className="zonas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            {canManage && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {zonas.map((zona) => (
            <tr key={zona.id}>
              <td className="cell-id">{zona.id}</td>
              <td className="cell-nombre">{zona.nombre}</td>
              {canManage && (
                <td>
                  <div className="cell-actions">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Editar ${zona.nombre}`}
                      onClick={() => onEdit(zona)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-button icon-button--danger"
                      aria-label={`Eliminar ${zona.nombre}`}
                      onClick={() => onDelete(zona)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
