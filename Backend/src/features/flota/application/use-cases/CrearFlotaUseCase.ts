import { Conflicto } from '../../../../shared/domain/DomainError.js';
import { Flota } from '../../domain/Flota.js';
import type { FlotaRepositoryPort } from '../ports/FlotaRepositoryPort.js';
import type { CrearFlotaInput, FlotaOutput } from '../dto/FlotaDtos.js';
import { aFlotaOutput } from '../mappers/FlotaMapper.js';

export class CrearFlotaUseCase {
  private readonly repo: FlotaRepositoryPort;

  constructor(repo: FlotaRepositoryPort) {
    this.repo = repo;
  }

  async execute(input: CrearFlotaInput): Promise<FlotaOutput> {
    const existente = await this.repo.buscarPorNombre(input.nombre);
    if (existente) {
      throw new Conflicto(`Ya existe una flota con el nombre ${input.nombre}`);
    }

    const flota = Flota.crear(input.nombre);
    return aFlotaOutput(await this.repo.guardar(flota));
  }
}