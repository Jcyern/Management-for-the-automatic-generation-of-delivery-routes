import {
  ReglaDeNegocioViolada,
  RecursoNoEncontrado,
} from '../../../../shared/domain/DomainError.js';
import type { Centro } from '../../domain/Centro.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';

export interface CentroRefInput {
  centroId?: number;
  centroNombre?: string;
}

/**
 * Resuelve el centro por id o por nombre, exigiendo exactamente uno.
 *
 * Lanza `ReglaDeNegocioViolada` si no se indica ninguno o se indican ambos,
 * y `RecursoNoEncontrado` si el centro no existe.
 */
export async function resolverCentro(
  repo: CentroRepositoryPort,
  { centroId, centroNombre }: CentroRefInput,
): Promise<Centro> {
  const usaId = centroId !== undefined;
  const usaNombre =
    centroNombre !== undefined && centroNombre.trim() !== '';

  if (usaId === usaNombre) {
    throw new ReglaDeNegocioViolada(
      'Debes indicar centroId o centroNombre (solo uno).',
    );
  }

  const centro = usaId
    ? await repo.buscarPorId(centroId as number)
    : await repo.buscarPorNombre((centroNombre as string).trim());

  if (!centro || centro.id === null) {
    throw new RecursoNoEncontrado(
      'Centro',
      usaId ? centroId : centroNombre,
    );
  }

  return centro;
}
