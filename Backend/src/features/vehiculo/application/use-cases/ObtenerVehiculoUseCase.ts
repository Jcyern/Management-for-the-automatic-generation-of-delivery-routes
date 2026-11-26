import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { VehiculoRepositoryPort } from '../ports/VehiculoRepositoryPort.js';
import type { VehiculoConRelacionesOutput } from '../dto/VehiculoDtos.js';
import { aVehiculoConRelacionesOutput } from '../mappers/VehiculoMapper.js';

export class ObtenerVehiculoUseCase {
  constructor(private readonly repo: VehiculoRepositoryPort) {}
  async execute(id: number): Promise<VehiculoConRelacionesOutput> {
    const v = await this.repo.obtenerConRelaciones(id);
    if (!v) throw new RecursoNoEncontrado('Vehiculo', id);
    return aVehiculoConRelacionesOutput(v);
  }
}