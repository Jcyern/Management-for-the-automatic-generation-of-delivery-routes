import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
  /** Current page (1-based). */
  page: number;

  /** Total number of pages. */
  totalPages: number;

  /** Total number of items across all pages. */
  totalItems: number;

  /** Callback fired when the page changes. */
  onPageChange: (page: number) => void;
}

/**
 * Pagination controls for the orders list.
 */
export function Pagination({ page, totalPages, totalItems, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <span className="pagination-info">
        Página {page} de {totalPages} · {totalItems} pedidos
      </span>

      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          type="button"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          className="pagination-button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
          type="button"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}