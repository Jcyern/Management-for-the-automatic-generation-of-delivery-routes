import { Centro } from '../../domain/Centro.js';
import {
  Conflicto,
  RecursoNoEncontrado,
} from '../../../../shared/domain/DomainError.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import type { GeocodificacionPort } from '../ports/GeocodificacionPort.js';
import type { CrearCentroInput, CentroOutput } from '../dto/CentroDtos.js';
import { aCentroOutput } from '../mappers/CentroMapper.js';
import { resolverUbicacionParaCrear } from '../services/resolverUbicacion.js';

export class CrearCentroUseCase {
  private readonly repo: CentroRepositoryPort;
  private readonly query: CentroQueryPort;
  private readonly geo: GeocodificacionPort;

  constructor(
    repo: CentroRepositoryPort,
    query: CentroQueryPort,
    geo: GeocodificacionPort,
  ) {
    this.repo = repo;
    this.query = query;
    this.geo = geo;
  }

  async execute(
    input: CrearCentroInput,
    creadorId: number,
  ): Promise<CentroOutput> {
    const nombre = input.nombre.trim();

    if (await this.repo.existeNombre(nombre)) {
      throw new Conflicto(`Ya existe un centro con el nombre ${nombre}`);
    }

    const ubicacion = await resolverUbicacionParaCrear(this.geo, input);

    const centro = Centro.crear({
      nombre,
      programaLogistico: input.programaLogistico,
      ...(ubicacion.direccion !== undefined
        ? { direccion: ubicacion.direccion }
        : {}),
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud,
      ...(input.zonasIds !== undefined ? { zonasIds: input.zonasIds } : {}),
    });

    const creado = await this.repo.crear(centro, creadorId);

    if (creado.id === null) {
      throw new Error('El centro creado no tiene id persistido.');
    }

    const vista = await this.query.buscarPorIdConZonas(creado.id);
    if (!vista) {
      throw new RecursoNoEncontrado('Centro', creado.id);
    }

    return aCentroOutput(vista);
  }
}
