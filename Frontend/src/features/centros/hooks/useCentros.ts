import { useEffect, useState } from 'react';
import { ApiError } from '../../../lib/apiClient';
import { centrosService } from '../services/centrosService';
import type { Centro } from '../types/centro';

/**
 * Return shape of the `useCentros` hook.
 */
interface UseCentrosResult {
  /** Centers loaded from the backend. */
  centros: Centro[];

  /** Whether the initial load or a refresh is in progress. */
  isLoading: boolean;

  /** Error message if the load failed. */
  error: string | null;

  /** Forces a reload of the centers. */
  refresh: () => void;
}

/**
 * Loads the list of distribution centers from the API and exposes its state.
 *
 * @returns The current centers, the loading/error state and a refresh function.
 */
export function useCentros(): UseCentrosResult {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await centrosService.getAll();

        if (!cancelled) {
          setCentros(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Error al cargar los centros',
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
  }, [reloadKey]);

  return {
    centros,
    isLoading,
    error,
    refresh: () => setReloadKey((key) => key + 1),
  };
}
