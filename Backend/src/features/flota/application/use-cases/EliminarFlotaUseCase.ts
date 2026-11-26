import { RecursoNoEncontrado, ReglaDeNegocioViolada } from '../../../../shared/domain/DomainError.js';
import type { FlotaRepositoryPort } from '../ports/FlotaRepositoryPort.js';
import type { FlotaOutput } from '../dto/FlotaDtos.js';
import { aFlotaOutput } from '../mappers/FlotaMapper.js';

export class EliminarFlotaUseCase {
  private readonly repo: FlotaRepositoryPort;

  constructor(repo: FlotaRepositoryPort) {
    this.repo = repo;
  }

  async execute(id: number): Promise<FlotaOutput> {
    const flota = await this.repo.buscarPorId(id);
    if (!flota) {
      throw new RecursoNoEncontrado('Flota', id);
    }

    if (await this.repo.tieneDependencias(id)) {
      throw new ReglaDeNegocioViolada(
        'No se puede eliminar la flota porque tiene vehículos o repartidores asociados.',
      );
    }

    return aFlotaOutput(await this.repo.eliminar(id));
  }
}