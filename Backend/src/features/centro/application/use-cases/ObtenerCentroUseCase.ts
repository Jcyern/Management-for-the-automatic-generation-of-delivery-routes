import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import type { CentroOutput } from '../dto/CentroDtos.js';
import { aCentroOutput } from '../mappers/CentroMapper.js';

export class ObtenerCentroUseCase {
  private readonly query: CentroQueryPort;

  constructor(query: CentroQueryPort) {
    this.query = query;
  }

  async execute(id: number): Promise<CentroOutput> {
    const vista = await this.query.buscarPorIdConZonas(id);
    if (!vista) {
      throw new RecursoNoEncontrado('Centro', id);
    }
    return aCentroOutput(vista);
  }
}
