import type {
  AsignacionPorCorreoResultado,
  CentroRepositoryPort,
} from '../ports/CentroRepositoryPort.js';
import type { AsignarCentroPorCorreoInput } from '../dto/CentroDtos.js';
import { resolverCentro } from '../services/resolverCentro.js';

export class AsignarCentroPorCorreoUseCase {
  private readonly repo: CentroRepositoryPort;

  constructor(repo: CentroRepositoryPort) {
    this.repo = repo;
  }

  async execute(
    input: AsignarCentroPorCorreoInput,
  ): Promise<AsignacionPorCorreoResultado> {
    const centro = await resolverCentro(this.repo, input);
    return this.repo.asignarPorCorreo(centro.id as number, input.correo, input.tipo);
  }
}
