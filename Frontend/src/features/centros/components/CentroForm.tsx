import { useState, type FormEvent } from 'react';
import { useZonas } from '../../zonas/hooks/useZonas';
import type { Centro, CentroInput } from '../types/centro';
import './CentroForm.css';

interface CentroFormProps {
  /** Existing center to edit, or undefined to create a new one. */
  initial?: Centro;

  /** Callback fired with the validated form data. */
  onSubmit: (data: CentroInput) => void;

  /** Callback fired when the user cancels. */
  onCancel: () => void;

  /** Whether the submit is currently in progress. */
  isSubmitting?: boolean;
}

/**
 * Parses a numeric input, returning `undefined` when it is empty or invalid.
 */
function toNumberOrUndefined(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Form for creating and editing distribution centers.
 *
 * Only performs light client-side validation (required fields and the
 * address-or-coordinates rule). Business rules such as ranges, duplicate
 * names, geocoding and permissions are enforced by the backend.
 */
export function CentroForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CentroFormProps) {
  const { zonas, isLoading: zonasLoading } = useZonas();

  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [programaLogistico, setProgramaLogistico] = useState(
    initial?.programaLogistico ?? '',
  );
  const [direccion, setDireccion] = useState(initial?.direccion ?? '');
  const [latitud, setLatitud] = useState(
    initial?.latitud != null ? String(initial.latitud) : '',
  );
  const [longitud, setLongitud] = useState(
    initial?.longitud != null ? String(initial.longitud) : '',
  );
  const [zonasIds, setZonasIds] = useState<number[]>(
    initial?.zonas.map((zona) => zona.id) ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  const clearError = () => {
    if (error) setError(null);
  };

  const toggleZona = (id: number) => {
    setZonasIds((prev) =>
      prev.includes(id) ? prev.filter((zonaId) => zonaId !== id) : [...prev, id],
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const nombreLimpio = nombre.trim();
    const programaLimpio = programaLogistico.trim();
    const direccionLimpia = direccion.trim();
    const lat = toNumberOrUndefined(latitud);
    const lon = toNumberOrUndefined(longitud);

    if (!nombreLimpio) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!programaLimpio) {
      setError('El programa logístico es obligatorio.');
      return;
    }
    if (!direccionLimpia && (lat === undefined || lon === undefined)) {
      setError('Indica una dirección o las coordenadas del centro.');
      return;
    }

    onSubmit({
      nombre: nombreLimpio,
      programaLogistico: programaLimpio,
      ...(direccionLimpia ? { direccion: direccionLimpia } : {}),
      ...(lat !== undefined ? { latitud: lat } : {}),
      ...(lon !== undefined ? { longitud: lon } : {}),
      zonasIds,
    });
  };

  return (
    <form className="centro-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="centro-nombre">Nombre</label>
        <input
          id="centro-nombre"
          type="text"
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value);
            clearError();
          }}
          placeholder="Ej. Centro Norte"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="centro-programa">Programa logístico</label>
        <input
          id="centro-programa"
          type="text"
          value={programaLogistico}
          onChange={(event) => {
            setProgramaLogistico(event.target.value);
            clearError();
          }}
          placeholder="Ej. Programa A"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="centro-direccion">Dirección</label>
        <input
          id="centro-direccion"
          type="text"
          value={direccion}
          onChange={(event) => {
            setDireccion(event.target.value);
            clearError();
          }}
          placeholder="Ej. Calle 23 #45, Vedado"
          disabled={isSubmitting}
        />
      </div>

      <div className="centro-form-row">
        <div className="form-group">
          <label htmlFor="centro-latitud">Latitud</label>
          <input
            id="centro-latitud"
            type="number"
            step="any"
            value={latitud}
            onChange={(event) => {
              setLatitud(event.target.value);
              clearError();
            }}
            placeholder="23.1136"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="centro-longitud">Longitud</label>
          <input
            id="centro-longitud"
            type="number"
            step="any"
            value={longitud}
            onChange={(event) => {
              setLongitud(event.target.value);
              clearError();
            }}
            placeholder="-82.3666"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <fieldset className="form-group centro-form-zonas">
        <legend>Zonas</legend>
        {zonasLoading ? (
          <span className="centro-form-hint">Cargando zonas...</span>
        ) : zonas.length === 0 ? (
          <span className="centro-form-hint">No hay zonas registradas.</span>
        ) : (
          <div className="centro-form-checklist">
            {zonas.map((zona) => (
              <label key={zona.id} className="centro-form-check">
                <input
                  type="checkbox"
                  checked={zonasIds.includes(zona.id)}
                  onChange={() => toggleZona(zona.id)}
                  disabled={isSubmitting}
                />
                <span>{zona.nombre}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {error && <span className="form-error">{error}</span>}

      <div className="centro-form-actions">
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
              : 'Crear centro'}
        </button>
      </div>
    </form>
  );
}
