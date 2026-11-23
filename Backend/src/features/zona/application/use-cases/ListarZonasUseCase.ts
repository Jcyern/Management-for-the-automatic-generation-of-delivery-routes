import type { ZonaRepositoryPort } from '../ports/ZonaRepositoryPort.js';
import type { ZonaOutput } from '../dto/ZonaDtos.js';
import { aZonaOutput } from '../mappers/ZonaMapper.js';

export class ListarZonasUseCase {
  private readonly repo: ZonaRepositoryPort;

  constructor(repo: ZonaRepositoryPort) {
    this.repo = repo;
  }

  async execute(): Promise<ZonaOutput[]> {
    const zonas = await this.repo.listar();
    return zonas.map(aZonaOutput);
  }
}
