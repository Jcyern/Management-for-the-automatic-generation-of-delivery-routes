import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { FlotaRepositoryPort } from '../ports/FlotaRepositoryPort.js';
import type { FlotaConRelacionesOutput } from '../dto/FlotaDtos.js';
import { aFlotaConRelacionesOutput } from '../mappers/FlotaMapper.js';

export class ObtenerFlotaUseCase {
  private readonly repo: FlotaRepositoryPort;

  constructor(repo: FlotaRepositoryPort) {
    this.repo = repo;
  }

  async execute(id: number): Promise<FlotaConRelacionesOutput> {
    const flota = await this.repo.obtenerConRelaciones(id);
    if (!flota) {
      throw new RecursoNoEncontrado('Flota', id);
    }
    return aFlotaConRelacionesOutput(flota);
  }
}