import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useZonas } from '../../hooks/useZonas';
import { zonasService } from '../../services/zonasService';
import { usePermissions } from '../../../../hooks/usePermissions';
import { Modal } from '../../../../components/common/Modal';
import { ApiError } from '../../../../lib/apiClient';
import { ZonasTable } from '../../components/ZonasTable';
import { ZonaForm } from '../../components/ZonaForm';
import type { Zona, ZonaInput } from '../../types/zona';
import './ZonasList.css';

/**
 * Page that lists zones and allows admins to create, edit and delete them.
 */
export function ZonasList() {
  const { zonas, isLoading, error, refresh } = useZonas();
  const { canManageZonas } = usePermissions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Zona | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEdit = (zona: Zona) => {
    setEditing(zona);
    setActionError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditing(null);
    setActionError(null);
  };

  const handleSubmit = async (data: ZonaInput) => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      if (editing) {
        await zonasService.update(editing.id, data);
      } else {
        await zonasService.create(data);
      }

      setIsModalOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Error al guardar la zona',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (zona: Zona) => {
    const confirmed = window.confirm(
      `¿Eliminar la zona "${zona.nombre}"?`,
    );
    if (!confirmed) return;

    setActionError(null);

    try {
      await zonasService.remove(zona.id);
      refresh();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Error al eliminar la zona',
      );
    }
  };

  return (
    <div className="zonas-list">
      <header className="zonas-list-header">
        <div>
          <h1>Zonas</h1>
          <p className="zonas-list-subtitle">
            {zonas.length} zonas registradas
          </p>
        </div>

        {canManageZonas && (
          <button
            className="zonas-list-new"
            type="button"
            onClick={openCreate}
          >
            <MapPin size={16} />
            <span>Nueva zona</span>
          </button>
        )}
      </header>

      {!isLoading && error && (
        <div className="zonas-list-error">
          <span>{error}</span>
          <button
            className="zonas-list-retry"
            type="button"
            onClick={refresh}
          >
            Reintentar
          </button>
        </div>
      )}

      {actionError && (
        <div className="zonas-list-error">
          <span>{actionError}</span>
        </div>
      )}

      {isLoading && (
        <div className="zonas-list-status">Cargando zonas...</div>
      )}

      {!isLoading && !error && (
        <ZonasTable
          zonas={zonas}
          canManage={canManageZonas}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        title={editing ? 'Editar zona' : 'Nueva zona'}
        onClose={closeModal}
      >
        <ZonaForm
          key={editing?.id ?? 'new'}
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
