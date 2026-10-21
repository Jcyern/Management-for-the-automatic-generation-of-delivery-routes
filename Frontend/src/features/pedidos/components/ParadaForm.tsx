import { useState, type FormEvent } from 'react';
import type { CreateParadaDto, EstadoEjecucion } from '../types/parada';
import './PedidoForm.css';

interface ParadaFormProps {
  /** The ID of the order this stop belongs to. */
  idPedido: string;

  /** Callback fired when the user submits. */
  onSubmit: (data: CreateParadaDto) => void;

  /** Callback fired when the user cancels. */
  onCancel: () => void;

  /** Whether the submit is currently in progress. */
  isSubmitting?: boolean;
}

/** Selectable execution states, with their user-facing labels. */
const ESTADOS: Array<{ value: EstadoEjecucion; label: string }> = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_CAMINO', label: 'En camino' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

/**
 * Form for creating a stop associated with a specific order.
 *
 * The order id arrives as text from the table; it must be a positive
 * integer because the backend stores it as a numeric foreign key.
 */
export function ParadaForm({ idPedido, onSubmit, onCancel, isSubmitting = false }: ParadaFormProps) {
  const [estadoEjecucion, setEstadoEjecucion] = useState<EstadoEjecucion>('PENDIENTE');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const pedidoId = Number(idPedido);
    if (!Number.isInteger(pedidoId) || pedidoId < 1) {
      setError('El pedido seleccionado no tiene un id numérico válido.');
      return;
    }

    setError('');
    onSubmit({ idPedido: pedidoId, estadoEjecucion });
  };

  return (
    <form className="pedido-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="estado">Estado inicial de la parada</label>
          <select
            id="estado"
            value={estadoEjecucion}
            onChange={(e) => setEstadoEjecucion(e.target.value as EstadoEjecucion)}
            disabled={isSubmitting}
          >
            {ESTADOS.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="parada-form-error">{error}</p>}

      <div className="pedido-form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Crear Parada'}
        </button>
      </div>
    </form>
  );
}
