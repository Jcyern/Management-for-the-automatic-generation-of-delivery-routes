import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useCentros } from '../../hooks/useCentros';
import { centrosService } from '../../services/centrosService';
import { usePermissions } from '../../../../hooks/usePermissions';
import { Modal } from '../../../../components/common/Modal';
import { ApiError } from '../../../../lib/apiClient';
import { CentrosTable } from '../../components/CentrosTable';
import { CentroForm } from '../../components/CentroForm';
import { AsignarCentroModal } from '../../components/AsignarCentroModal';
import type { Centro, CentroInput } from '../../types/centro';
import './CentrosList.css';

/**
 * Page that lists the centers visible to the current user.
 *
 * Admins see every center and can create, edit and delete them. Supervisors
 * and logistics coordinators only see their assigned centers, read-only.
 */
export function CentrosList() {
  const { centros, isLoading, error, refresh } = useCentros();
  const { canManageCentros } = usePermissions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Centro | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  /* Asignación de coordinadores y repartidores */
  const [asignandoModalOpen, setAsignandoModalOpen] = useState(false);
  const [asignandoCentro, setAsignandoCentro] = useState<Centro | null>(null);

  const openCreate = () => {
    setEditing(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEdit = (centro: Centro) => {
    setEditing(centro);
    setActionError(null);
    setIsModalOpen(true);
  };

  const openAsignar = (centro: Centro) => {
    setAsignandoCentro(centro);
    setAsignandoModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditing(null);
    setActionError(null);
  };

  const closeAsignarModal = () => {
    setAsignandoModalOpen(false);
    setAsignandoCentro(null);
    refresh();
  };

  const handleSubmit = async (data: CentroInput) => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      if (editing) {
        await centrosService.update(editing.id, data);
      } else {
        await centrosService.create(data);
      }

      setIsModalOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Error al guardar el centro',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (centro: Centro) => {
    const confirmed = window.confirm(
      `¿Eliminar el centro "${centro.nombre}"?`,
    );
    if (!confirmed) return;

    setActionError(null);

    try {
      await centrosService.remove(centro.id);
      refresh();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Error al eliminar el centro',
      );
    }
  };

  return (
    <div className="centros-list">
      <header className="centros-list-header">
        <div>
          <h1>Centros</h1>
          <p className="centros-list-subtitle">
            {centros.length}{' '}
            {canManageCentros ? 'centros registrados' : 'centros asignados'}
          </p>
        </div>

        {canManageCentros && (
          <button
            className="centros-list-new"
            type="button"
            onClick={openCreate}
          >
            <Building2 size={16} />
            <span>Nuevo centro</span>
          </button>
        )}
      </header>

      {!isLoading && error && (
        <div className="centros-list-error">
          <span>{error}</span>
          <button
            className="centros-list-retry"
            type="button"
            onClick={refresh}
          >
            Reintentar
          </button>
        </div>
      )}

      {actionError && (
        <div className="centros-list-error">
          <span>{actionError}</span>
        </div>
      )}

      {isLoading && (
        <div className="centros-list-status">Cargando centros...</div>
      )}

      {!isLoading && !error && (
        <CentrosTable
          centros={centros}
          canManage={canManageCentros}
          onEdit={openEdit}
          onDelete={handleDelete}
          onAsignar={openAsignar}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        title={editing ? 'Editar centro' : 'Nuevo centro'}
        onClose={closeModal}
      >
        <CentroForm
          key={editing?.id ?? 'new'}
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {asignandoModalOpen && asignandoCentro && (
        <AsignarCentroModal
          centro={asignandoCentro}
          isOpen={asignandoModalOpen}
          onClose={closeAsignarModal}
        />
      )}
    </div>
  );
}
