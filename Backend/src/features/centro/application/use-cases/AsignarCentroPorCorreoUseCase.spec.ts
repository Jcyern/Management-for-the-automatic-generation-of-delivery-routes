import { describe, expect, it, vi } from 'vitest';
import { AsignarCentroPorCorreoUseCase } from './AsignarCentroPorCorreoUseCase.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';
import {
  ReglaDeNegocioViolada,
  RecursoNoEncontrado,
} from '../../../../shared/domain/DomainError.js';

const mockRepo = {
  buscarPorId: vi.fn(),
  buscarPorNombre: vi.fn(),
  asignarPorCorreo: vi.fn(),
} as unknown as CentroRepositoryPort;

describe('AsignarCentroPorCorreoUseCase', () => {
  let useCase: AsignarCentroPorCorreoUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new AsignarCentroPorCorreoUseCase(mockRepo);
  });

  it('asigna usando centroId', async () => {
    vi.mocked(mockRepo.buscarPorId).mockResolvedValue({ id: 7 } as never);
    const esperado = {
      idUser: 3,
      nombre: 'Ana',
      correo: 'ana@x.com',
      tipo: 'crear' as const,
    };
    vi.mocked(mockRepo.asignarPorCorreo).mockResolvedValue(esperado);

    const resultado = await useCase.execute({
      correo: 'ana@x.com',
      tipo: 'crear',
      centroId: 7,
    });

    expect(mockRepo.buscarPorId).toHaveBeenCalledWith(7);
    expect(mockRepo.asignarPorCorreo).toHaveBeenCalledWith(
      7,
      'ana@x.com',
      'crear',
    );
    expect(resultado).toEqual(esperado);
  });

  it('asigna usando centroNombre (recortado)', async () => {
    vi.mocked(mockRepo.buscarPorNombre).mockResolvedValue({
      id: 9,
    } as never);
    vi.mocked(mockRepo.asignarPorCorreo).mockResolvedValue({
      idUser: 4,
      nombre: 'Luis',
      correo: 'luis@x.com',
      tipo: 'repartidor',
    });

    await useCase.execute({
      correo: 'luis@x.com',
      tipo: 'repartidor',
      centroNombre: '  Norte  ',
    });

    expect(mockRepo.buscarPorNombre).toHaveBeenCalledWith('Norte');
    expect(mockRepo.asignarPorCorreo).toHaveBeenCalledWith(
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

  it('lanza error si se indican centroId y centroNombre a la vez', async () => {
    await expect(
      useCase.execute({
        correo: 'a@x.com',
        tipo: 'crear',
        centroId: 1,
        centroNombre: 'Norte',
      }),
    ).rejects.toBeInstanceOf(ReglaDeNegocioViolada);
  });

  it('lanza 404 si el centro no existe', async () => {
    vi.mocked(mockRepo.buscarPorId).mockResolvedValue(null);
    await expect(
      useCase.execute({ correo: 'a@x.com', tipo: 'crear', centroId: 99 }),
    ).rejects.toBeInstanceOf(RecursoNoEncontrado);
  });
});
