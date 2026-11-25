import { ReglaDeNegocioViolada, RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { VehiculoRepositoryPort } from '../ports/VehiculoRepositoryPort.js';
import type { FlotaRepositoryPort } from '../../../flota/application/ports/FlotaRepositoryPort.js';
import type { ActualizarVehiculoInput, VehiculoOutput } from '../dto/VehiculoDtos.js';
import { aVehiculoOutput } from '../mappers/VehiculoMapper.js';

export class ActualizarVehiculoUseCase {
  constructor(
    private readonly vehiculoRepo: VehiculoRepositoryPort,
    private readonly flotaRepo: FlotaRepositoryPort,
  ) {}

  async execute(id: number, input: ActualizarVehiculoInput): Promise<VehiculoOutput> {
    let vehiculo = await this.vehiculoRepo.buscarPorId(id);
    if (!vehiculo) throw new RecursoNoEncontrado('Vehiculo', id);

    if (input.idFlota !== undefined && input.idFlota !== vehiculo.idFlota) {
      const flota = await this.flotaRepo.buscarPorId(input.idFlota);
      if (!flota) throw new ReglaDeNegocioViolada(`La flota con ID ${input.idFlota} no existe.`);
      vehiculo = vehiculo.cambiarFlota(input.idFlota);
    }

    if (input.capacidad !== undefined) {
      vehiculo = vehiculo.cambiarCapacidad(input.capacidad);
    }

    return aVehiculoOutput(await this.vehiculoRepo.guardar(vehiculo));
  }
}