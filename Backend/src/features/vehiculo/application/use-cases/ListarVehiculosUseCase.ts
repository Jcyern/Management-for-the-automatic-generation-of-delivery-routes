import type { VehiculoRepositoryPort } from '../ports/VehiculoRepositoryPort.js';
import type { VehiculoConRelacionesOutput } from '../dto/VehiculoDtos.js';
import { aVehiculoConRelacionesOutput } from '../mappers/VehiculoMapper.js';

export class ListarVehiculosUseCase {
  constructor(private readonly repo: VehiculoRepositoryPort) {}
  async execute(): Promise<VehiculoConRelacionesOutput[]> {
    const lista = await this.repo.listar();
    return lista.map(aVehiculoConRelacionesOutput);
  }
}