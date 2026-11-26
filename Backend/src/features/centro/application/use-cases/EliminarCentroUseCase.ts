import {
  AccesoDenegado,
  RecursoNoEncontrado,
  ReglaDeNegocioViolada,
} from '../../../../shared/domain/DomainError.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import type { CentroOutput } from '../dto/CentroDtos.js';
import { aCentroOutput } from '../mappers/CentroMapper.js';

export class EliminarCentroUseCase {
  private readonly repo: CentroRepositoryPort;
  private readonly query: CentroQueryPort;

  constructor(repo: CentroRepositoryPort, query: CentroQueryPort) {
    this.repo = repo;
    this.query = query;
  }

  async execute(id: number, userId: number): Promise<CentroOutput> {
    const vista = await this.query.buscarPorIdConZonas(id);
    if (!vista) {
      throw new RecursoNoEncontrado('Centro', id);
    }

    if (!(await this.repo.estaAutorizado(id, userId))) {
      throw new AccesoDenegado(
        'No estás autorizado para gestionar este centro de distribución.',
      );
    }

    if (await this.repo.tieneDependencias(id)) {
      throw new ReglaDeNegocioViolada(
        'No se puede eliminar el centro porque tiene pedidos o repartidores asociados.',
      );
    }

    await this.repo.eliminar(id);
    return aCentroOutput(vista);
  }
}
