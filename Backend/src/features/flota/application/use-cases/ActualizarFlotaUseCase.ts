import { Conflicto, RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { FlotaRepositoryPort } from '../ports/FlotaRepositoryPort.js';
import type { ActualizarFlotaInput, FlotaOutput } from '../dto/FlotaDtos.js';
import { aFlotaOutput } from '../mappers/FlotaMapper.js';

export class ActualizarFlotaUseCase {
  private readonly repo: FlotaRepositoryPort;

  constructor(repo: FlotaRepositoryPort) {
    this.repo = repo;
  }

  async execute(id: number, input: ActualizarFlotaInput): Promise<FlotaOutput> {
    const flota = await this.repo.buscarPorId(id);
    if (!flota) {
      throw new RecursoNoEncontrado('Flota', id);
    }

    if (input.nombre !== undefined) {
      const existente = await this.repo.buscarPorNombre(input.nombre);
      if (existente && existente.id !== id) {
        throw new Conflicto(`Ya existe otra flota con el nombre ${input.nombre}`);
      }
    }

    const actualizada =
      input.nombre !== undefined ? flota.renombrar(input.nombre) : flota;

    return aFlotaOutput(await this.repo.guardar(actualizada));
  }
}