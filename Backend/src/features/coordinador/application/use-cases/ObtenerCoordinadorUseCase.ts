import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { CoordinadorRepositoryPort } from '../ports/CoordinadorRepositoryPort.js';
import type { CoordinadorOutput } from '../dto/CoordinadorDtos.js';
import { aCoordinadorOutput } from '../mappers/CoordinadorMapper.js';

export class ObtenerCoordinadorUseCase {
  private readonly repo: CoordinadorRepositoryPort;

  constructor(repo: CoordinadorRepositoryPort) {
    this.repo = repo;
  }

  async execute(id: number): Promise<CoordinadorOutput> {
    const coordinador = await this.repo.buscarPorId(id);
    if (!coordinador) {
      throw new RecursoNoEncontrado('Coordinador', id);
    }
    return aCoordinadorOutput(coordinador);
  }
}
