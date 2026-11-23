import type { ZonaRepositoryPort } from '../ports/ZonaRepositoryPort.js';
import type { ZonaOutput } from '../dto/ZonaDtos.js';
import { aZonaOutput } from '../mappers/ZonaMapper.js';
import {
  RecursoNoEncontrado,
  ReglaDeNegocioViolada,
} from '../../../../shared/domain/DomainError.js';

export class EliminarZonaUseCase {
  private readonly repo: ZonaRepositoryPort;

  constructor(repo: ZonaRepositoryPort) {
    this.repo = repo;
  }

  async execute(id: number): Promise<ZonaOutput> {
    const zona = await this.repo.buscarPorId(id);
    if (!zona) {
      throw new RecursoNoEncontrado('Zona', id);
    }

    if (await this.repo.tieneDependencias(id)) {
      throw new ReglaDeNegocioViolada(
        'No se puede eliminar la zona porque tiene pedidos o rutas asociadas.',
      );
    }

    return aZonaOutput(await this.repo.eliminar(id));
  }
}
