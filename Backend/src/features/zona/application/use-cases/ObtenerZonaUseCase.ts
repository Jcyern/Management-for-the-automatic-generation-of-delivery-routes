import type { ZonaRepositoryPort } from '../ports/ZonaRepositoryPort.js';
import type { ZonaOutput } from '../dto/ZonaDtos.js';
import { aZonaOutput } from '../mappers/ZonaMapper.js';
import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';

export class ObtenerZonaUseCase {
  private readonly repo: ZonaRepositoryPort;

  constructor(repo: ZonaRepositoryPort) {
    this.repo = repo;
  }

  async execute(id: number): Promise<ZonaOutput> {
    const zona = await this.repo.buscarPorId(id);
    if (!zona) {
      throw new RecursoNoEncontrado('Zona', id);
    }
    return aZonaOutput(zona);
  }
}
