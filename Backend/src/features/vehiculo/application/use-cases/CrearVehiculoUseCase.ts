import { ReglaDeNegocioViolada } from '../../../../shared/domain/DomainError.js';
import { Vehiculo } from '../../domain/Vehiculo.js';
import type { VehiculoRepositoryPort } from '../ports/VehiculoRepositoryPort.js';
import type { FlotaRepositoryPort } from '../../../flota/application/ports/FlotaRepositoryPort.js';
import type { CrearVehiculoInput, VehiculoOutput } from '../dto/VehiculoDtos.js';
import { aVehiculoOutput } from '../mappers/VehiculoMapper.js';

export class CrearVehiculoUseCase {
  constructor(
    private readonly vehiculoRepo: VehiculoRepositoryPort,
    private readonly flotaRepo: FlotaRepositoryPort,
  ) {}

  async execute(input: CrearVehiculoInput): Promise<VehiculoOutput> {
    const flota = await this.flotaRepo.buscarPorId(input.idFlota);
    if (!flota) {
      throw new ReglaDeNegocioViolada(`La flota con ID ${input.idFlota} no existe.`);
    }

    const vehiculo = Vehiculo.crear(input.capacidad, input.idFlota);
    return aVehiculoOutput(await this.vehiculoRepo.guardar(vehiculo));
  }
}