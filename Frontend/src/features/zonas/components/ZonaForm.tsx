import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Zona, ZonaInput } from '../types/zona';
import './ZonaForm.css';

interface ZonaFormProps {
  /** Existing zone to edit, or undefined to create a new one. */
  initial?: Zona;

  /** Callback fired with the validated form data. */
  onSubmit: (data: ZonaInput) => void;

  /** Callback fired when the user cancels. */
  onCancel: () => void;

  /** Whether the submit is currently in progress. */
  isSubmitting?: boolean;
}

/**
 * Form for creating and editing zones.
 *
 * Validates that the name is not empty before calling `onSubmit`.
 */
export function ZonaForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ZonaFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleNombreChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNombre(event.target.value);
    if (error) setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmed = nombre.trim();
    if (!trimmed) {
      setError('El nombre es obligatorio.');
      return;
    }

    onSubmit({ nombre: trimmed });
  };

  return (
    <form className="zona-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="zona-nombre">Nombre</label>
        <input
          id="zona-nombre"
          type="text"
          value={nombre}
          onChange={handleNombreChange}
          placeholder="Ej. Playa"
          disabled={isSubmitting}
          aria-invalid={Boolean(error)}
        />
        {error && <span className="form-error">{error}</span>}
      </div>

      <div className="zona-form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting
            ? 'Guardando...'
            : initial
              ? 'Guardar cambios'
              : 'Crear zona'}
        </button>
      </div>
    </form>
  );
}
