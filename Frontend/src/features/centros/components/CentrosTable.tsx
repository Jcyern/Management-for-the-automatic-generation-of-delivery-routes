import { Pencil, Trash2 } from 'lucide-react';
import type { Centro } from '../types/centro';
import './CentrosTable.css';

interface CentrosTableProps {
  /** Centers to display. */
  centros: Centro[];

  /** Whether the current user can edit and delete centers. */
  canManage: boolean;

  /** Callback fired when the user wants to edit a center. */
  onEdit: (centro: Centro) => void;

  /** Callback fired when the user wants to delete a center. */
  onDelete: (centro: Centro) => void;
}

/**
 * Formats the center coordinates when both values are present.
 *
 * @param centro Distribution center.
 * @returns `"lat, lon"` or `null` when the center has no coordinates.
 */
function formatCoordenadas(centro: Centro): string | null {
  if (centro.latitud === null || centro.longitud === null) {
    return null;
  }
  return `${centro.latitud.toFixed(5)}, ${centro.longitud.toFixed(5)}`;
}

/**
 * Table that lists the distribution centers.
 *
 * Coordinates take precedence over the address because they are the
 * authoritative location. The actions column is only rendered when
 * `canManage` is true.
 */
export function CentrosTable({
  centros,
  canManage,
  onEdit,
  onDelete,
}: CentrosTableProps) {
  if (centros.length === 0) {
    return (
      <div className="centros-table-empty">No hay centros registrados.</div>
    );
  }

  return (
    <div className="centros-table-wrapper">
      <table className="centros-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Programa</th>
            <th>Ubicación</th>
            <th>Zonas</th>
            {canManage && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {centros.map((centro) => {
            const coordenadas = formatCoordenadas(centro);

            return (
              <tr key={centro.id}>
                <td className="cell-id">{centro.id}</td>
                <td className="cell-nombre">{centro.nombre}</td>
                <td>{centro.programaLogistico}</td>
                <td className="cell-ubicacion">
                  {coordenadas ? (
                    <span
                      className="cell-coords"
                      title={centro.direccion ?? undefined}
                    >
                      {coordenadas}
                    </span>
                  ) : centro.direccion ? (
                    centro.direccion
                  ) : (
                    <span className="cell-muted">—</span>
                  )}
                </td>
                <td>
                  {centro.zonas.length === 0 ? (
                    <span className="cell-muted">—</span>
                  ) : (
                    <div className="cell-zonas">
                      {centro.zonas.map((zona) => (
                        <span key={zona.id} className="zona-chip">
                          {zona.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                {canManage && (
                  <td>
                    <div className="cell-actions">
                      <button
                        type="button"
                        className="centros-icon-button"
                        aria-label={`Editar ${centro.nombre}`}
                        onClick={() => onEdit(centro)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="centros-icon-button centros-icon-button--danger"
                        aria-label={`Eliminar ${centro.nombre}`}
                        onClick={() => onDelete(centro)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
