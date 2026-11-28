import { describe, expect, it, vi } from 'vitest';
import { DesasignarCentroPorCorreoUseCase } from './DesasignarCentroPorCorreoUseCase.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';
import {
  ReglaDeNegocioViolada,
  RecursoNoEncontrado,
} from '../../../../shared/domain/DomainError.js';

const mockRepo = {
  buscarPorId: vi.fn(),
  buscarPorNombre: vi.fn(),
  desasignarPorCorreo: vi.fn(),
} as unknown as CentroRepositoryPort;

describe('DesasignarCentroPorCorreoUseCase', () => {
  let useCase: DesasignarCentroPorCorreoUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DesasignarCentroPorCorreoUseCase(mockRepo);
  });

  it('desasigna usando centroId', async () => {
    vi.mocked(mockRepo.buscarPorId).mockResolvedValue({ id: 7 } as never);
    const esperado = {
      idUser: 3,
      nombre: 'Ana',
      correo: 'ana@x.com',
      tipo: 'validar' as const,
    };
    vi.mocked(mockRepo.desasignarPorCorreo).mockResolvedValue(esperado);

    const resultado = await useCase.execute({
      correo: 'ana@x.com',
      tipo: 'validar',
      centroId: 7,
    });

    expect(mockRepo.desasignarPorCorreo).toHaveBeenCalledWith(
      7,
      'ana@x.com',
      'validar',
    );
    expect(resultado).toEqual(esperado);
  });

  it('desasigna usando centroNombre (recortado)', async () => {
    vi.mocked(mockRepo.buscarPorNombre).mockResolvedValue({
      id: 9,
    } as never);
    vi.mocked(mockRepo.desasignarPorCorreo).mockResolvedValue({
      idUser: 4,
      nombre: 'Luis',
      correo: 'luis@x.com',
      tipo: 'repartidor',
    });

    await useCase.execute({
      correo: 'luis@x.com',
      tipo: 'repartidor',
      centroNombre: '  Sur  ',
    });

    expect(mockRepo.buscarPorNombre).toHaveBeenCalledWith('Sur');
    expect(mockRepo.desasignarPorCorreo).toHaveBeenCalledWith(
      9,
      'luis@x.com',
      'repartidor',
    );
  });

  it('lanza error si no se indica centro', async () => {
    await expect(
      useCase.execute({ correo: 'a@x.com', tipo: 'crear' }),
    ).rejects.toBeInstanceOf(ReglaDeNegocioViolada);
  });

  it('lanza 404 si el centro no existe', async () => {
    vi.mocked(mockRepo.buscarPorId).mockResolvedValue(null);
    await expect(
      useCase.execute({ correo: 'a@x.com', tipo: 'crear', centroId: 99 }),
    ).rejects.toBeInstanceOf(RecursoNoEncontrado);
  });
});
