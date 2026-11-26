import type { RepartidorRepositoryPort } from '../ports/RepartidorRepositoryPort.js';
import type { RepartidorConRelacionesOutput } from '../dto/RepartidorDtos.js';
import { aRepartidorConRelacionesOutput } from '../mappers/RepartidorMapper.js';

export class ListarRepartidoresUseCase {
  private readonly repo: RepartidorRepositoryPort;

  constructor(repo: RepartidorRepositoryPort) {
    this.repo = repo;
  }

  async execute(): Promise<RepartidorConRelacionesOutput[]> {
    const repartidores = await this.repo.listar();
    return repartidores.map(aRepartidorConRelacionesOutput);
  }
}