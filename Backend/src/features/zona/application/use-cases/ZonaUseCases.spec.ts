import { beforeEach, describe, expect, it } from 'vitest';
import {
  RecursoNoEncontrado,
  ReglaDeNegocioViolada,
} from '../../../../shared/domain/DomainError.js';
import { FakeZonaRepository } from '../../../../../test/fakes/FakeZonaRepository.js';
import { ActualizarZonaUseCase } from './ActualizarZonaUseCase.js';
import { CrearZonaUseCase } from './CrearZonaUseCase.js';
import { EliminarZonaUseCase } from './EliminarZonaUseCase.js';
import { ListarZonasUseCase } from './ListarZonasUseCase.js';
import { ObtenerZonaUseCase } from './ObtenerZonaUseCase.js';

describe('CrearZonaUseCase', () => {
  let repo: FakeZonaRepository;
  let useCase: CrearZonaUseCase;

  beforeEach(() => {
    repo = new FakeZonaRepository();
    useCase = new CrearZonaUseCase(repo);
  });

  it('crea y guarda una zona con el nombre normalizado', async () => {
    const salida = await useCase.execute({ nombre: '  Norte  ' });

    expect(salida).toEqual({ id: 1, nombre: 'Norte' });
    expect(await repo.listar()).toHaveLength(1);
  });

  it('rechaza un nombre vacío sin guardar', async () => {
    await expect(useCase.execute({ nombre: '   ' })).rejects.toBeInstanceOf(
      ReglaDeNegocioViolada,
    );
    expect(await repo.listar()).toHaveLength(0);
  });
});

describe('ListarZonasUseCase', () => {
  it('devuelve las zonas mapeadas a ZonaOutput', async () => {
    const repo = new FakeZonaRepository();
    repo.sembrar(1, 'Norte');
    repo.sembrar(2, 'Sur');

    const salida = await new ListarZonasUseCase(repo).execute();

    expect(salida).toEqual([
      { id: 1, nombre: 'Norte' },
      { id: 2, nombre: 'Sur' },
    ]);
  });

  it('devuelve una lista vacía si no hay zonas', async () => {
    const repo = new FakeZonaRepository();

    expect(await new ListarZonasUseCase(repo).execute()).toEqual([]);
  });
});

describe('ObtenerZonaUseCase', () => {
  it('devuelve la zona existente', async () => {
    const repo = new FakeZonaRepository();
    repo.sembrar(7, 'Centro');

    const salida = await new ObtenerZonaUseCase(repo).execute(7);

    expect(salida).toEqual({ id: 7, nombre: 'Centro' });
  });

  it('lanza RecursoNoEncontrado si no existe', async () => {
    const repo = new FakeZonaRepository();

    await expect(
      new ObtenerZonaUseCase(repo).execute(99),
    ).rejects.toBeInstanceOf(RecursoNoEncontrado);
  });
});

describe('ActualizarZonaUseCase', () => {
  it('renombra conservando el id', async () => {
    const repo = new FakeZonaRepository();
    repo.sembrar(3, 'Norte');

    const salida = await new ActualizarZonaUseCase(repo).execute(3, {
      nombre: 'Sur',
    });

    expect(salida).toEqual({ id: 3, nombre: 'Sur' });
    expect((await repo.buscarPorId(3))?.nombre).toBe('Sur');
  });

  it('si no viene nombre, devuelve la misma zona', async () => {
    const repo = new FakeZonaRepository();
    repo.sembrar(3, 'Norte');

    const salida = await new ActualizarZonaUseCase(repo).execute(3, {});

    expect(salida).toEqual({ id: 3, nombre: 'Norte' });
  });

  it('lanza RecursoNoEncontrado si no existe', async () => {
    const repo = new FakeZonaRepository();

    await expect(
      new ActualizarZonaUseCase(repo).execute(99, { nombre: 'Sur' }),
    ).rejects.toBeInstanceOf(RecursoNoEncontrado);
  });

  it('rechaza renombrar a un nombre vacío', async () => {
    const repo = new FakeZonaRepository();
    repo.sembrar(3, 'Norte');

    await expect(
      new ActualizarZonaUseCase(repo).execute(3, { nombre: '   ' }),
    ).rejects.toBeInstanceOf(ReglaDeNegocioViolada);
  });
});

describe('EliminarZonaUseCase', () => {
  it('lanza RecursoNoEncontrado si no existe', async () => {
    const repo = new FakeZonaRepository();

    await expect(
      new EliminarZonaUseCase(repo).execute(99),
    ).rejects.toBeInstanceOf(RecursoNoEncontrado);
  });

  it('lanza ReglaDeNegocioViolada si tiene pedidos o rutas', async () => {
    const repo = new FakeZonaRepository();
    repo.sembrar(1, 'Norte');
    repo.marcarDependencias(1);

    await expect(
      new EliminarZonaUseCase(repo).execute(1),
    ).rejects.toBeInstanceOf(ReglaDeNegocioViolada);
    expect(await repo.buscarPorId(1)).not.toBeNull();
  });

  it('elimina y devuelve la zona si no tiene dependencias', async () => {
    const repo = new FakeZonaRepository();
    repo.sembrar(1, 'Norte');

    const salida = await new EliminarZonaUseCase(repo).execute(1);

    expect(salida).toEqual({ id: 1, nombre: 'Norte' });
    expect(await repo.buscarPorId(1)).toBeNull();
  });
});
