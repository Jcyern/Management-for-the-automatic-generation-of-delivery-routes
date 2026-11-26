import {
  RecursoNoEncontrado,
  ReglaDeNegocioViolada,
} from '../../../../shared/domain/DomainError.js';
import type { CoordinadorRepositoryPort } from '../ports/CoordinadorRepositoryPort.js';
import type { CoordinadorEliminadoOutput } from '../dto/CoordinadorDtos.js';

export class EliminarCoordinadorUseCase {
  private readonly repo: CoordinadorRepositoryPort;

  constructor(repo: CoordinadorRepositoryPort) {
    this.repo = repo;
  }

  async execute(id: number): Promise<CoordinadorEliminadoOutput> {
    const coordinador = await this.repo.buscarPorId(id);
    if (!coordinador) {
      throw new RecursoNoEncontrado('Coordinador', id);
    }

    const [asignaciones, reprogramacionesPendientes] = await Promise.all([
      this.repo.contarAsignaciones(id),
      this.repo.contarReprogramacionesPendientes(id),
    ]);

    if (asignaciones > 0 || reprogramacionesPendientes > 0) {
      throw new ReglaDeNegocioViolada(
        'No se puede eliminar el coordinador porque tiene asignaciones o reprogramaciones pendientes',
      );
    }

    await this.repo.eliminar(id);
    return { id, nombre: coordinador.nombre, eliminado: true };
  }
}
