import { useState, type FormEvent } from 'react';
import type { CreateParadaDto } from '../types/parada';
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

/**
 * Form for creating a stop associated with a specific order.
 */
export function ParadaForm({ idPedido, onSubmit, onCancel, isSubmitting = false }: ParadaFormProps) {
  const [estadoEjecucion, setEstadoEjecucion] = useState('pendiente');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      idPedido: Number(idPedido),
      estadoEjecucion,
    });
  };

  return (
    <form className="pedido-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="estado">Estado inicial de la parada</label>
          <select
            id="estado"
            value={estadoEjecucion}
            onChange={(e) => setEstadoEjecucion(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_camino">En camino</option>
            <option value="completada">Completada</option>
            <option value="fallida">Fallida</option>
          </select>
        </div>
      </div>

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