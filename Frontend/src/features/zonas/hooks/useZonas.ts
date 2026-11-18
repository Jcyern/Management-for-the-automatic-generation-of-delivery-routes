import { useEffect, useState } from 'react';
import { ApiError } from '../../../lib/apiClient';
import { zonasService } from '../services/zonasService';
import type { Zona } from '../types/zona';

/**
 * Return shape of the `useZonas` hook.
 */
interface UseZonasResult {
  /** Zones loaded from the backend. */
  zonas: Zona[];

  /** Whether the initial load or a refresh is in progress. */
  isLoading: boolean;

  /** Error message if the load failed. */
  error: string | null;

  /** Forces a reload of the zones. */
  refresh: () => void;
}

/**
 * Loads the list of zones from the API and exposes its state.
 *
 * @returns The current zones, the loading/error state and a refresh function.
 */
export function useZonas(): UseZonasResult {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await zonasService.getAll();

        if (!cancelled) {
          setZonas(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Error al cargar las zonas',
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
    zonas,
    isLoading,
    error,
    refresh: () => setReloadKey((key) => key + 1),
  };
}
