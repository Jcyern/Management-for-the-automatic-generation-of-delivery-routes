import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest';
import { CrearFlotaUseCase } from './CrearFlotaUseCase.js';
import { Conflicto } from '../../../../shared/domain/DomainError.js';
import type { FlotaRepositoryPort } from '../ports/FlotaRepositoryPort.js';
import { Flota } from '../../domain/Flota.js';

describe('CrearFlotaUseCase', () => {
  let useCase: CrearFlotaUseCase;
  let mockRepo: Mocked<FlotaRepositoryPort>;

  beforeEach(() => {
    mockRepo = {
      guardar: vi.fn(),
      buscarPorId: vi.fn(),
      buscarPorNombre: vi.fn(),
      listar: vi.fn(),
      obtenerConRelaciones: vi.fn(),
      tieneDependencias: vi.fn(),
      eliminar: vi.fn(),
    };
    useCase = new CrearFlotaUseCase(mockRepo);
  });

  it('crea la flota si el nombre está libre', async () => {
    mockRepo.buscarPorNombre.mockResolvedValue(null);
    
    const flotaGuardada = Flota.rehidratar({ id: 1, nombre: 'Flota A' });
    mockRepo.guardar.mockResolvedValue(flotaGuardada);

    const resultado = await useCase.execute({ nombre: 'Flota A' });

    expect(mockRepo.buscarPorNombre).toHaveBeenCalledWith('Flota A');
    expect(mockRepo.guardar).toHaveBeenCalled();
    expect(resultado).toEqual({ id: 1, nombre: 'Flota A' });
  });

  it('lanza Conflicto si ya existe una flota con ese nombre', async () => {
    const existente = Flota.rehidratar({ id: 2, nombre: 'Flota A' });
    mockRepo.buscarPorNombre.mockResolvedValue(existente);

    await expect(useCase.execute({ nombre: 'Flota A' }))
      .rejects
      .toThrow(Conflicto);

    expect(mockRepo.guardar).not.toHaveBeenCalled();
  });
});