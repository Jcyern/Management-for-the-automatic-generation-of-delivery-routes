import type {
  AsignacionPorCorreoResultado,
  CentroRepositoryPort,
} from '../ports/CentroRepositoryPort.js';
import type { AsignarCentroPorCorreoInput } from '../dto/CentroDtos.js';
import { resolverCentro } from '../services/resolverCentro.js';

export class DesasignarCentroPorCorreoUseCase {
  private readonly repo: CentroRepositoryPort;

  constructor(repo: CentroRepositoryPort) {
    this.repo = repo;
  }

  async execute(
    input: AsignarCentroPorCorreoInput,
  ): Promise<AsignacionPorCorreoResultado> {
    const centro = await resolverCentro(this.repo, input);
    return this.repo.desasignarPorCorreo(
      centro.id as number,
      input.correo,
      input.tipo,
    );
  }
}
