import type { FlotaRepositoryPort } from '../ports/FlotaRepositoryPort.js';
import type { FlotaConRelacionesOutput } from '../dto/FlotaDtos.js';
import { aFlotaConRelacionesOutput } from '../mappers/FlotaMapper.js';

export class ListarFlotasUseCase {
  private readonly repo: FlotaRepositoryPort;

  constructor(repo: FlotaRepositoryPort) {
    this.repo = repo;
  }

  async execute(): Promise<FlotaConRelacionesOutput[]> {
    const flotas = await this.repo.listar();
    return flotas.map(aFlotaConRelacionesOutput);
  }
}