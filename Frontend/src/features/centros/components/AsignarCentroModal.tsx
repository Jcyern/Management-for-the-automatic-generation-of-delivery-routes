import { useEffect, useState } from 'react';
import { centrosService } from '../services/centrosService';
import { Modal } from '../../../components/common/Modal';
import type {
  Centro,
  CentroAsignaciones,
  ProcesoAsignacion,
  TipoAsignacionCentro,
} from '../types/centro';
import './AsignarCentroModal.css';

interface AsignarCentroModalProps {
  /** Center whose assignments are being edited. */
  centro: Centro;

  /** Whether the modal is open. */
  isOpen: boolean;

  /** Callback fired when the modal should close. */
  onClose: () => void;
}

const VACIO: CentroAsignaciones = {
  coordinadoresCrear: [],
  coordinadoresValidar: [],
  repartidores: [],
};

const CATEGORIA_LABEL: Record<TipoAsignacionCentro, string> = {
  crear: 'Crear rutas',
  validar: 'Supervisar rutas',
  repartidor: 'Repartidor',
};

/**
 * Interpreta el campo "Centro" como id (si es numérico) o nombre.
 */
function parseCentroRef(
  ref: string,
): { centroId?: number; centroNombre?: string } {
  const value = ref.trim();
  return /^\d+$/.test(value)
    ? { centroId: Number(value) }
    : { centroNombre: value };
}

/**
 * Modal para asignar/desasignar usuarios a un centro por correo.
 *
 * Arriba hay una mini tabla (correo, proceso, categoría, centro) para
 * ejecutar una operación. Abajo se listan los usuarios ya asignados al
 * centro junto con el rol que cumplen, con la opción de quitarlos.
 */
export function AsignarCentroModal({
  centro,
  isOpen,
  onClose,
}: AsignarCentroModalProps) {
  const [correo, setCorreo] = useState('');
  const [proceso, setProceso] = useState<ProcesoAsignacion>('asignar');
  const [tipo, setTipo] = useState<TipoAsignacionCentro>('crear');
  const [centroRef, setCentroRef] = useState(String(centro.id));
  const [asignaciones, setAsignaciones] =
    useState<CentroAsignaciones>(VACIO);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await centrosService.getAsignaciones(centro.id);
        if (!cancelled) {
          setAsignaciones(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar las asignaciones',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [centro.id, reloadKey]);

  const recargar = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const handleEjecutar = async () => {
    const email = correo.trim();
    const ref = centroRef.trim();

    if (!email || !ref) {
      setError('Correo y centro son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setOk(null);

    const refCentro = parseCentroRef(ref);
    const input = { correo: email, tipo, ...refCentro };

    try {
      if (proceso === 'asignar') {
        await centrosService.asignarPorCorreo(input);
      } else {
        await centrosService.desasignarPorCorreo(input);
      }

      setOk(
        `${proceso === 'asignar' ? 'Asignado' : 'Desasignado'} correctamente.`,
      );
      setCorreo('');

      if (
        refCentro.centroId === undefined ||
        refCentro.centroId === centro.id
      ) {
        recargar();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al ejecutar la operación',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuitar = async (
    correoUsuario: string,
    tipoRelacion: TipoAsignacionCentro,
  ) => {
    setError(null);
    setOk(null);
    try {
      await centrosService.desasignarPorCorreo({
        correo: correoUsuario,
        tipo: tipoRelacion,
        centroId: centro.id,
      });
      recargar();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al quitar la asignación',
      );
    }
  };

  const filas = [
    ...asignaciones.coordinadoresCrear.map((u) => ({
      ...u,
      tipo: 'crear' as const,
    })),
    ...asignaciones.coordinadoresValidar.map((u) => ({
      ...u,
      tipo: 'validar' as const,
    })),
    ...asignaciones.repartidores.map((u) => ({
      ...u,
      tipo: 'repartidor' as const,
    })),
  ];

  const footer = (
    <div className="asignar-modal-footer">
      <button
        type="button"
        className="btn-secondary"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Cerrar
      </button>
      <button
        type="button"
        className="btn-primary"
        onClick={handleEjecutar}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Ejecutando...' : 'Ejecutar'}
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={`Asignaciones de "${centro.nombre}"`}
      onClose={onClose}
      footer={footer}
    >
      <div className="asignar-grid">
        <label>
          Correo
          <input
            type="email"
            className="asignar-input"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="usuario@correo.com"
            disabled={isSubmitting}
          />
        </label>

        <label>
          Proceso
          <select
            className="asignar-select"
            value={proceso}
            onChange={(e) => setProceso(e.target.value as ProcesoAsignacion)}
            disabled={isSubmitting}
          >
            <option value="asignar">Asignar</option>
            <option value="desasignar">Desasignar</option>
          </select>
        </label>

        <label>
          Categoría
          <select
            className="asignar-select"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoAsignacionCentro)}
            disabled={isSubmitting}
          >
            <option value="crear">Crear rutas</option>
            <option value="validar">Supervisar rutas</option>
            <option value="repartidor">Repartidor</option>
          </select>
        </label>

        <label>
          Centro (ID o nombre)
          <input
            className="asignar-input"
            value={centroRef}
            onChange={(e) => setCentroRef(e.target.value)}
            disabled={isSubmitting}
          />
        </label>
      </div>

      {error && <span className="form-error">{error}</span>}
      {ok && <span className="form-ok">{ok}</span>}

      <h3 className="asignar-titulo">Usuarios del centro</h3>

      {isLoading ? (
        <span className="asignar-hint">Cargando...</span>
      ) : filas.length === 0 ? (
        <span className="asignar-vacio">Sin usuarios asignados.</span>
      ) : (
        <table className="asignar-tabla">
          <thead>
            <tr>
              <th>Correo</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={`${fila.tipo}-${fila.idUser}`}>
                <td>{fila.correo}</td>
                <td>{fila.nombre}</td>
                <td>{CATEGORIA_LABEL[fila.tipo]}</td>
                <td>
                  <button
                    type="button"
                    className="asignar-quitar"
                    onClick={() => handleQuitar(fila.correo, fila.tipo)}
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}
