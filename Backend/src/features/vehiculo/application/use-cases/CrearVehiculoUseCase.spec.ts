import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest';
import { CrearVehiculoUseCase } from './CrearVehiculoUseCase.js';
import { ReglaDeNegocioViolada } from '../../../../shared/domain/DomainError.js';
import type { VehiculoRepositoryPort } from '../ports/VehiculoRepositoryPort.js';
import type { FlotaRepositoryPort } from '../../../flota/application/ports/FlotaRepositoryPort.js';
import { Vehiculo } from '../../domain/Vehiculo.js';
import { Flota } from '../../../flota/domain/Flota.js';

describe('CrearVehiculoUseCase', () => {
  let useCase: CrearVehiculoUseCase;
  let mockVehiculoRepo: Mocked<VehiculoRepositoryPort>;
  let mockFlotaRepo: Mocked<FlotaRepositoryPort>;

  beforeEach(() => {
    mockVehiculoRepo = { guardar: vi.fn() } as unknown as Mocked<VehiculoRepositoryPort>;
    mockFlotaRepo = { buscarPorId: vi.fn() } as unknown as Mocked<FlotaRepositoryPort>;
    useCase = new CrearVehiculoUseCase(mockVehiculoRepo, mockFlotaRepo);
  });

  it('crea el vehículo si la flota existe', async () => {
    mockFlotaRepo.buscarPorId.mockResolvedValue(Flota.rehidratar({ id: 1, nombre: 'Flota A' }));
    const vGuardado = Vehiculo.rehidratar({ id: 1, capacidad: 500, idFlota: 1 });
    mockVehiculoRepo.guardar.mockResolvedValue(vGuardado);

    const res = await useCase.execute({ capacidad: 500, idFlota: 1 });
    expect(res).toEqual({ id: 1, capacidad: 500, idFlota: 1 });
  });

  it('lanza error si la flota no existe', async () => {
    mockFlotaRepo.buscarPorId.mockResolvedValue(null);
    await expect(useCase.execute({ capacidad: 500, idFlota: 99 }))
      .rejects.toThrow(ReglaDeNegocioViolada);
  });
});