import { useState, type FormEvent, type ChangeEvent } from 'react';
import type {
  Pedido,
  TipoEntrega,
  Prioridad,
  EstadoPedido,
} from '../types/pedido';
import {
  TIPO_ENTREGA_LABELS,
  PRIORIDAD_LABELS,
  ESTADO_LABELS,
} from '../constants/pedidoLabels';
import './PedidoForm.css';

/**
 * Form data shape used internally by the form.
 * Matches the fields the user can edit.
 */
interface PedidoFormData {
  destinatario: string;
  direccion: string;
  centroId: string;
  zonaId: string;
  tipoEntrega: TipoEntrega;
  prioridad: Prioridad;
  estado: EstadoPedido;
}

interface PedidoFormProps {
  /** Existing order to edit, or undefined to create a new one. */
  initial?: Pedido;

  /** Callback fired with the form data when the user submits. */
  onSubmit: (data: PedidoFormData) => void;

  /** Callback fired when the user cancels. */
  onCancel: () => void;

  /** Whether the submit is currently in progress. */
  isSubmitting?: boolean;
}

const EMPTY_FORM: PedidoFormData = {
  destinatario: '',
  direccion: '',
  centroId: 'C-01',
  zonaId: 'Z-01',
  tipoEntrega: 'paqueteria',
  prioridad: 'media',
  estado: 'pendiente',
};

/**
 * Form for creating and editing delivery orders.
 *
 * Validates the required fields locally before calling `onSubmit`.
 */
export function PedidoForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PedidoFormProps) {
  const [data, setData] = useState<PedidoFormData>(() =>
    initial
      ? {
          destinatario: initial.destinatario,
          direccion: initial.direccion,
          centroId: initial.centroId,
          zonaId: initial.zonaId,
          tipoEntrega: initial.tipoEntrega,
          prioridad: initial.prioridad,
          estado: initial.estado,
        }
      : EMPTY_FORM
  );

  const [errors, setErrors] = useState<Partial<Record<keyof PedidoFormData, string>>>({});

  const update = <K extends keyof PedidoFormData>(key: K, value: PedidoFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleText = (key: 'destinatario' | 'direccion') =>
    (e: ChangeEvent<HTMLInputElement>) => update(key, e.target.value);

  const handleSelect = <K extends keyof PedidoFormData>(key: K) =>
    (e: ChangeEvent<HTMLSelectElement>) => update(key, e.target.value as PedidoFormData[K]);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!data.destinatario.trim()) next.destinatario = 'El destinatario es obligatorio.';
    if (!data.direccion.trim()) next.direccion = 'La dirección es obligatoria.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(data);
  };

  return (
    <form className="pedido-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="destinatario">Destinatario</label>
          <input
            id="destinatario"
            type="text"
            value={data.destinatario}
            onChange={handleText('destinatario')}
            placeholder="Nombre de quien recibe"
            disabled={isSubmitting}
          />
          {errors.destinatario && (
            <span className="form-error">{errors.destinatario}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="direccion">Dirección</label>
          <input
            id="direccion"
            type="text"
            value={data.direccion}
            onChange={handleText('direccion')}
            placeholder="Calle, número, reparto"
            disabled={isSubmitting}
          />
          {errors.direccion && (
            <span className="form-error">{errors.direccion}</span>
          )}
        </div>
      </div>

      <div className="form-row form-row--split">
        <div className="form-group">
          <label htmlFor="centro">Centro</label>
          <select
            id="centro"
            value={data.centroId}
            onChange={handleSelect('centroId')}
            disabled={isSubmitting}
          >
            <option value="C-01">Centro Habana</option>
            <option value="C-02">Centro Playa</option>
            <option value="C-03">Centro Guanabacoa</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="zona">Zona</label>
          <select
            id="zona"
            value={data.zonaId}
            onChange={handleSelect('zonaId')}
            disabled={isSubmitting}
          >
            <option value="Z-01">Z-01</option>
            <option value="Z-02">Z-02</option>
            <option value="Z-03">Z-03</option>
            <option value="Z-04">Z-04</option>
          </select>
        </div>
      </div>

      <div className="form-row form-row--split">
        <div className="form-group">
          <label htmlFor="tipoEntrega">Tipo de entrega</label>
          <select
            id="tipoEntrega"
            value={data.tipoEntrega}
            onChange={handleSelect('tipoEntrega')}
            disabled={isSubmitting}
          >
            {(Object.keys(TIPO_ENTREGA_LABELS) as TipoEntrega[]).map((key) => (
              <option key={key} value={key}>
                {TIPO_ENTREGA_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="prioridad">Prioridad</label>
          <select
            id="prioridad"
            value={data.prioridad}
            onChange={handleSelect('prioridad')}
            disabled={isSubmitting}
          >
            {(Object.keys(PRIORIDAD_LABELS) as Prioridad[]).map((key) => (
              <option key={key} value={key}>
                {PRIORIDAD_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {initial && (
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              value={data.estado}
              onChange={handleSelect('estado')}
              disabled={isSubmitting}
            >
              {(Object.keys(ESTADO_LABELS) as EstadoPedido[]).map((key) => (
                <option key={key} value={key}>
                  {ESTADO_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

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
          {isSubmitting ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear pedido'}
        </button>
      </div>
    </form>
  );
}