import { RecursoNoEncontrado, ReglaDeNegocioViolada } from '../../../../shared/domain/DomainError.js';
import type { VehiculoRepositoryPort } from '../ports/VehiculoRepositoryPort.js';
import type { VehiculoOutput } from '../dto/VehiculoDtos.js';
import { aVehiculoOutput } from '../mappers/VehiculoMapper.js';

export class EliminarVehiculoUseCase {
  constructor(private readonly repo: VehiculoRepositoryPort) {}
  async execute(id: number): Promise<VehiculoOutput> {
    const v = await this.repo.buscarPorId(id);
    if (!v) throw new RecursoNoEncontrado('Vehiculo', id);

    if (await this.repo.tieneRutasRealizadas(id)) {
      throw new ReglaDeNegocioViolada('No se puede eliminar el vehículo porque tiene rutas realizadas asociadas.');
    }

    return aVehiculoOutput(await this.repo.eliminar(id));
  }
}