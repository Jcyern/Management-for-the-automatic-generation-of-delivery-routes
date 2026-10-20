import { ArrowUp, ArrowDown, MapPin } from 'lucide-react';
import type { Pedido } from '../types/pedido';
import type { PedidoSortKey, SortDirection } from '../hooks/usePedidos';
import {
  TIPO_ENTREGA_LABELS,
  PRIORIDAD_LABELS,
  ESTADO_LABELS,
} from '../constants/pedidoLabels';
import './PedidosTable.css';

interface PedidosTableProps {
  /** Orders to display (already paginated). */
  pedidos: Pedido[];

  /** Current sort key. */
  sortKey: PedidoSortKey;

  /** Current sort direction. */
  sortDirection: SortDirection;

  /** Callback fired when a sortable column header is clicked. */
  onSort: (key: PedidoSortKey) => void;

  /** Callback fired when the user wants to add a stop to an order. */
  onAddParada: (id: string) => void;
}

/**
 * Table that displays delivery orders with sortable columns.
 */
export function PedidosTable({ 
  pedidos, 
  sortKey, 
  sortDirection, 
  onSort, 
  onAddParada
}: PedidosTableProps) {
  const renderSortIcon = (key: PedidoSortKey) => {
    if (key !== sortKey) return null;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const header = (label: string, key?: PedidoSortKey) => (
    <th
      className={key ? 'sortable' : ''}
      onClick={key ? () => onSort(key) : undefined}
    >
      <span className="th-content">
        {label}
        {key && renderSortIcon(key)}
      </span>
    </th>
  );

  if (pedidos.length === 0) {
    return (
      <div className="table-empty">
        No hay pedidos que coincidan con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="pedidos-table">
        <thead>
          <tr>
            {header('ID', 'id')}
            {header('Destinatario', 'destinatario')}
            {header('Tipo')}
            {header('Prioridad', 'prioridad')}
            {header('Estado', 'estado')}
            {header('Fecha', 'fechaCreacion')}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td className="cell-id">{p.id}</td>
              <td>
                <div className="cell-destinatario">{p.destinatario}</div>
                <div className="cell-direccion">{p.direccion}</div>
              </td>
              <td>{TIPO_ENTREGA_LABELS[p.tipoEntrega]}</td>
              <td>
                <span className={`badge badge--${p.prioridad}`}>
                  {PRIORIDAD_LABELS[p.prioridad]}
                </span>
              </td>
              <td>
                <span className={`badge badge--estado-${p.estado}`}>
                  {ESTADO_LABELS[p.estado]}
                </span>
              </td>
              <td className="cell-fecha">
                {new Date(p.fechaCreacion).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              
              <td>
                <button 
                  onClick={() => onAddParada(p.id)} 
                  className="btn-icon" 
                  title="Añadir Parada"
                  type="button"
                >
                  <MapPin size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}