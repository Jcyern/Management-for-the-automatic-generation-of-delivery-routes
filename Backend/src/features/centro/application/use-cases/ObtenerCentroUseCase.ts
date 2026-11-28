import {
  AccesoDenegado,
  RecursoNoEncontrado,
} from '../../../../shared/domain/DomainError.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';
import type { CentroOutput } from '../dto/CentroDtos.js';
import { aCentroOutput } from '../mappers/CentroMapper.js';

export class ObtenerCentroUseCase {
  private readonly query: CentroQueryPort;
  private readonly repo: CentroRepositoryPort;

  constructor(query: CentroQueryPort, repo: CentroRepositoryPort) {
    this.query = query;
    this.repo = repo;
  }

  async execute(
    id: number,
    userId: number,
    esAdmin: boolean,
  ): Promise<CentroOutput> {
    const vista = await this.query.buscarPorIdConZonas(id);
    if (!vista) {
      throw new RecursoNoEncontrado('Centro', id);
    }

    if (!esAdmin && !(await this.repo.estaAutorizado(id, userId))) {
      throw new AccesoDenegado(
        'No estás autorizado para consultar este centro de distribución.',
      );
    }

    return aCentroOutput(vista);
  }

  async obtenerAsignaciones(id: number) {
    return this.repo.obtenerAsignaciones(id);
  }
}
