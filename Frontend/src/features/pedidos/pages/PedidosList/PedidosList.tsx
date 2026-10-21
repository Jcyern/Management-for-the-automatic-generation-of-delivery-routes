import { useState } from 'react';
import { Package } from 'lucide-react';
import { usePedidos } from '../../hooks/usePedidos';
import { pedidosService } from '../../services/pedidosService';
import { PedidoFiltersBar } from '../../components/PedidoFiltersBar';
import { PedidosTable } from '../../components/PedidosTable';
import { Pagination } from '../../components/Pagination';
import { Modal } from '../../../../components/common/Modal';
import { PedidoForm } from '../../components/PedidoForm';
import { useAuth } from '../../../auth/context/AuthContext';
import './PedidosList.css';
import { paradasService } from '../../services/paradasService';
import { ParadaForm } from '../../components/ParadaForm';
import type { CreateParadaDto } from '../../types/parada';
/**
 * Page that lists delivery orders with filters, sorting, pagination
 * and a modal form for creating new orders.
 */
export function PedidosList() {
  const {
    pedidos,
    total,
    isLoading,
    error,
    filters,
    setFilters,
    sortKey,
    sortDirection,
    toggleSort,
    page,
    totalPages,
    setPage,
    refresh
  } = usePedidos();

  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParadaModalOpen, setIsParadaModalOpen] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);
  const [isSubmittingParada, setIsSubmittingParada] = useState(false);

  const handleCreate = async (data: Parameters<typeof pedidosService.create>[0]) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await pedidosService.create(data, user.name);
      setIsModalOpen(false);
      refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateParada = async (data: CreateParadaDto) => {
    setIsSubmittingParada(true);
    try {
      await paradasService.create(data);
      setIsParadaModalOpen(false);
      alert('Parada creada correctamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear la parada';
      alert(message);
    } finally {
      setIsSubmittingParada(false);
    }
  };

  return (
    <div className="pedidos-list">
      <header className="pedidos-list-header">
        <div>
          <h1>Pedidos</h1>
          <p className="pedidos-list-subtitle">{total} pedidos en total</p>
        </div>
        <button
          className="pedidos-list-new"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          <Package size={16} />
          <span>Nuevo pedido</span>
        </button>
      </header>

      <PedidoFiltersBar filters={filters} onChange={setFilters} />

      {isLoading && <div className="pedidos-list-status">Cargando pedidos...</div>}
      {error && <div className="pedidos-list-error">{error}</div>}

      {!isLoading && !error && (
        <>
          <PedidosTable
            pedidos={pedidos}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={toggleSort}
            onAddParada={(id) => {
              setSelectedPedidoId(id);
              setIsParadaModalOpen(true);
            }}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={setPage}
          />
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        title="Nuevo pedido"
        onClose={() => setIsModalOpen(false)}
      >
        <PedidoForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isParadaModalOpen}
        title="Añadir Parada al Pedido"
        onClose={() => setIsParadaModalOpen(false)}
      >
        {selectedPedidoId && (
          <ParadaForm
            idPedido={selectedPedidoId}
            onSubmit={handleCreateParada}
            onCancel={() => setIsParadaModalOpen(false)}
            isSubmitting={isSubmittingParada}
          />
        )}
      </Modal>
    </div>
  );
}