import type { CentroQueryPort } from '../ports/CentroQueryPort.js';
import type { CentroOutput } from '../dto/CentroDtos.js';
import { aCentroOutput } from '../mappers/CentroMapper.js';

export class ListarCentrosUseCase {
  private readonly query: CentroQueryPort;

  constructor(query: CentroQueryPort) {
    this.query = query;
  }

  async execute(userId: number, esAdmin: boolean): Promise<CentroOutput[]> {
    const centros = esAdmin
      ? await this.query.listarTodos()
      : await this.query.listarPorCoordinador(userId);

    return centros.map(aCentroOutput);
  }
}
