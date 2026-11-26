import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest';
import { CrearRepartidorUseCase } from './CrearRepartidorUseCase.js';
import { ReglaDeNegocioViolada } from '../../../../shared/domain/DomainError.js';
import type { RepartidorRepositoryPort } from '../ports/RepartidorRepositoryPort.js';
import type { FlotaRepositoryPort } from '../../../flota/application/ports/FlotaRepositoryPort.js';
import type { UsuarioCheckerPort } from '../ports/ExternalPorts.js';
import { Repartidor } from '../../domain/Repartidor.js';
import { Flota } from '../../../flota/domain/Flota.js';

describe('CrearRepartidorUseCase', () => {
  let useCase: CrearRepartidorUseCase;
  let mockRepo: Mocked<RepartidorRepositoryPort>;
  let mockFlotaRepo: Mocked<FlotaRepositoryPort>;
  let mockUserChecker: Mocked<UsuarioCheckerPort>;

  beforeEach(() => {
    mockRepo = { guardar: vi.fn() } as unknown as Mocked<RepartidorRepositoryPort>;
    mockFlotaRepo = { buscarPorId: vi.fn() } as unknown as Mocked<FlotaRepositoryPort>;
    mockUserChecker = { existe: vi.fn() } as unknown as Mocked<UsuarioCheckerPort>;
    useCase = new CrearRepartidorUseCase(mockRepo, mockFlotaRepo, mockUserChecker);
  });

  it('crea el repartidor si el usuario y la flota existen', async () => {
    mockUserChecker.existe.mockResolvedValue(true);
    mockFlotaRepo.buscarPorId.mockResolvedValue(Flota.rehidratar({ id: 1, nombre: 'Flota A' }));
    
    const repGuardado = Repartidor.rehidratar({ idUser: 10, nombre: 'Juan', edad: 25, idFlota: 1, centrosIds: [] });
    mockRepo.guardar.mockResolvedValue(repGuardado);

    const res = await useCase.execute({ idUser: 10, nombre: 'Juan', edad: 25, idFlota: 1 });
    expect(res.idUser).toBe(10);
    expect(mockRepo.guardar).toHaveBeenCalled();
  });

  it('lanza error si el usuario no existe', async () => {
    mockUserChecker.existe.mockResolvedValue(false);
    await expect(useCase.execute({ idUser: 99, nombre: 'Juan', edad: 25, idFlota: 1 }))
      .rejects.toThrow(ReglaDeNegocioViolada);
    expect(mockRepo.guardar).not.toHaveBeenCalled();
  });

  it('lanza error si la flota no existe', async () => {
    mockUserChecker.existe.mockResolvedValue(true);
    mockFlotaRepo.buscarPorId.mockResolvedValue(null);
    await expect(useCase.execute({ idUser: 10, nombre: 'Juan', edad: 25, idFlota: 99 }))
      .rejects.toThrow(ReglaDeNegocioViolada);
  });
});