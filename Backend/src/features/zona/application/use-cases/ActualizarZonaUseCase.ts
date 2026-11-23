import type { ZonaRepositoryPort } from '../ports/ZonaRepositoryPort.js';
import type { ActualizarZonaInput, ZonaOutput } from '../dto/ZonaDtos.js';
import { aZonaOutput } from '../mappers/ZonaMapper.js';
import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';

export class ActualizarZonaUseCase {
  private readonly repo: ZonaRepositoryPort;

  constructor(repo: ZonaRepositoryPort) {
    this.repo = repo;
  }

  async execute(id: number, input: ActualizarZonaInput): Promise<ZonaOutput> {
    const zona = await this.repo.buscarPorId(id);
    if (!zona) {
      throw new RecursoNoEncontrado('Zona', id);
    }

    const actualizada =
      input.nombre !== undefined ? zona.renombrar(input.nombre) : zona;

    return aZonaOutput(await this.repo.guardar(actualizada));
  }
}
