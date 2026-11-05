import type { ChangeEvent } from 'react';
import type { PedidoFilters, TipoEntrega, Prioridad, EstadoPedido } from '../types/pedido';
import {
  TIPO_ENTREGA_LABELS,
  PRIORIDAD_LABELS,
  ESTADO_LABELS,
} from '../constants/pedidoLabels';
import './PedidoFiltersBar.css';

interface PedidoFiltersBarProps {
  /** Current filters. */
  filters: PedidoFilters;

  /** Callback fired when any filter changes. */
  onChange: (filters: PedidoFilters) => void;
}

/**
 * Filter bar for the orders list.
 *
 * Provides a search input and dropdowns for type, priority and state.
 */
export function PedidoFiltersBar({ filters, onChange }: PedidoFiltersBarProps) {
  const update = (patch: Partial<PedidoFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    update({ search: e.target.value });
  };

  const handleSelect = <K extends keyof PedidoFilters>(key: K) =>
    (e: ChangeEvent<HTMLSelectElement>) => {
      update({ [key]: e.target.value || undefined } as Partial<PedidoFilters>);
    };

  return (
    <div className="filters-bar">
      <input
        type="search"
        className="filters-search"
        placeholder="Buscar por id, destinatario o dirección..."
        value={filters.search ?? ''}
        onChange={handleSearch}
      />

      <select className="filters-select" value={filters.tipoEntrega ?? ''} onChange={handleSelect('tipoEntrega')}>
        <option value="">Tipo de entrega</option>
        {(Object.keys(TIPO_ENTREGA_LABELS) as TipoEntrega[]).map((key) => (
          <option key={key} value={key}>
            {TIPO_ENTREGA_LABELS[key]}
          </option>
        ))}
      </select>

      <select className="filters-select" value={filters.prioridad ?? ''} onChange={handleSelect('prioridad')}>
        <option value="">Prioridad</option>
        {(Object.keys(PRIORIDAD_LABELS) as Prioridad[]).map((key) => (
          <option key={key} value={key}>
            {PRIORIDAD_LABELS[key]}
          </option>
        ))}
      </select>

      <select className="filters-select" value={filters.estado ?? ''} onChange={handleSelect('estado')}>
        <option value="">Estado</option>
        {(Object.keys(ESTADO_LABELS) as EstadoPedido[]).map((key) => (
          <option key={key} value={key}>
            {ESTADO_LABELS[key]}
          </option>
        ))}
      </select>
    </div>
  );
}