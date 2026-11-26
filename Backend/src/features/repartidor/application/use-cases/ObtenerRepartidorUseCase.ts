import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { RepartidorRepositoryPort } from '../ports/RepartidorRepositoryPort.js';
import type { RepartidorConRelacionesOutput } from '../dto/RepartidorDtos.js';
import { aRepartidorConRelacionesOutput } from '../mappers/RepartidorMapper.js';

export class ObtenerRepartidorUseCase {
  private readonly repo: RepartidorRepositoryPort;

  constructor(repo: RepartidorRepositoryPort) {
    this.repo = repo;
  }

  async execute(id: number): Promise<RepartidorConRelacionesOutput> {
    const repartidor = await this.repo.obtenerConRelaciones(id);
    if (!repartidor) {
      throw new RecursoNoEncontrado('Repartidor', id);
    }
    return aRepartidorConRelacionesOutput(repartidor);
  }
}