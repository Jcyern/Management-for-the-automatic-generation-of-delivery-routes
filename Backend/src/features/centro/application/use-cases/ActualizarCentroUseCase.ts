import {
  AccesoDenegado,
  Conflicto,
  RecursoNoEncontrado,
} from '../../../../shared/domain/DomainError.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import type { GeocodificacionPort } from '../ports/GeocodificacionPort.js';
import type { ActualizarCentroInput, CentroOutput } from '../dto/CentroDtos.js';
import { aCentroOutput } from '../mappers/CentroMapper.js';
import { resolverUbicacionParaActualizar } from '../services/resolverUbicacion.js';

export class ActualizarCentroUseCase {
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
    id: number,
    input: ActualizarCentroInput,
    userId: number,
  ): Promise<CentroOutput> {
    const actual = await this.repo.buscarPorId(id);
    if (!actual) {
      throw new RecursoNoEncontrado('Centro', id);
    }

    if (!(await this.repo.estaAutorizado(id, userId))) {
      throw new AccesoDenegado(
        'No estás autorizado para gestionar este centro de distribución.',
      );
    }

    let nombre: string | undefined;
    if (input.nombre !== undefined) {
      nombre = input.nombre.trim();
      if (await this.repo.existeNombre(nombre, id)) {
        throw new Conflicto(`Ya existe otro centro con el nombre ${nombre}`);
      }
    }

    const ubicacion = await resolverUbicacionParaActualizar(this.geo, input);

    let centro = actual;
    if (nombre !== undefined) {
      centro = centro.renombrar(nombre);
    }
    if (input.programaLogistico !== undefined) {
      centro = centro.cambiarPrograma(input.programaLogistico);
    }
    if (ubicacion !== undefined) {
      centro = centro.ubicar(
        ubicacion.direccion ?? centro.direccion,
        ubicacion.latitud,
        ubicacion.longitud,
      );
    }
    if (input.zonasIds !== undefined) {
      centro = centro.asignarZonas(input.zonasIds);
    }

    await this.repo.actualizar(centro);

    const vista = await this.query.buscarPorIdConZonas(id);
    if (!vista) {
      throw new RecursoNoEncontrado('Centro', id);
    }
    return aCentroOutput(vista);
  }
}
