import { useState, useEffect, useMemo } from 'react';
import type { Pedido, PedidoFilters } from '../types/pedido';
import { pedidosService } from '../services/pedidosService';

/**
 * Sortable columns in the orders list.
 */
export type PedidoSortKey = 'id' | 'destinatario' | 'prioridad' | 'estado' | 'fechaCreacion';

/**
 * Sort direction.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Return shape of the `usePedidos` hook.
 */
interface UsePedidosResult {
  /** Orders after filters and sorting, for the current page. */
  pedidos: Pedido[];

  /** Total number of orders after filters (before pagination). */
  total: number;

  /** Whether data is being loaded. */
  isLoading: boolean;

  /** Error message if the load failed. */
  error: string | null;

  /** Current filters. */
  filters: PedidoFilters;

  /** Replaces the current filters. */
  setFilters: (filters: PedidoFilters) => void;

  /** Current sort key. */
  sortKey: PedidoSortKey;

  /** Current sort direction. */
  sortDirection: SortDirection;

  /** Toggles sorting by the given key. */
  toggleSort: (key: PedidoSortKey) => void;

  /** Current page (1-based). */
  page: number;

  /** Total number of pages. */
  totalPages: number;

  /** Changes the current page. */
  setPage: (page: number) => void;

  /** Forces a reload of the orders from the service. */
  refresh: () => void;
}

const PRIORITY_ORDER = { urgente: 0, media: 1, baja: 2 } as const;
const PAGE_SIZE = 8;

/**
 * Hook that loads, filters, sorts and paginates delivery orders.
 *
 * Encapsulates all the state and logic needed by the orders list page.
 *
 * @returns The current page of orders and the controls to manipulate them.
 */
export function usePedidos(): UsePedidosResult {
  const [allPedidos, setAllPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PedidoFilters>({});
  const [sortKey, setSortKey] = useState<PedidoSortKey>('fechaCreacion');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await pedidosService.getAll(filters);
        if (!cancelled) {
          setAllPedidos(data);
          setPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filters, reloadKey]);

  const sorted = useMemo(() => {
    const copy = [...allPedidos];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'id':
        case 'destinatario':
        case 'estado':
        case 'fechaCreacion':
          cmp = a[sortKey].localeCompare(b[sortKey]);
          break;
        case 'prioridad':
          cmp = PRIORITY_ORDER[a.prioridad] - PRIORITY_ORDER[b.prioridad];
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [allPedidos, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: PedidoSortKey) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return {
    pedidos: paginated,
    total: sorted.length,
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
    refresh: () => setReloadKey((k) => k + 1),
  };
}