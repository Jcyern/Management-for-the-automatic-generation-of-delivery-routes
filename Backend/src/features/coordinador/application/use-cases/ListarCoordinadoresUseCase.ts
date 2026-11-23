import type { CoordinadorRepositoryPort } from '../ports/CoordinadorRepositoryPort.js';
import type { CoordinadorOutput } from '../dto/CoordinadorDtos.js';
import { aCoordinadorOutput } from '../mappers/CoordinadorMapper.js';

export class ListarCoordinadoresUseCase {
  private readonly repo: CoordinadorRepositoryPort;

  constructor(repo: CoordinadorRepositoryPort) {
    this.repo = repo;
  }

  async execute(): Promise<CoordinadorOutput[]> {
    const coordinadores = await this.repo.listar();
    return coordinadores.map(aCoordinadorOutput);
  }
}
