import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import { Coordinador } from '../../domain/Coordinador.js';
import type { CoordinadorRepositoryPort } from '../ports/CoordinadorRepositoryPort.js';
import type {
  ActualizarCoordinadorInput,
  CoordinadorOutput,
} from '../dto/CoordinadorDtos.js';
import { aCoordinadorOutput } from '../mappers/CoordinadorMapper.js';

export class ActualizarCoordinadorUseCase {
  private readonly repo: CoordinadorRepositoryPort;

  constructor(repo: CoordinadorRepositoryPort) {
    this.repo = repo;
  }

  async execute(
    id: number,
    input: ActualizarCoordinadorInput,
  ): Promise<CoordinadorOutput> {
    const coordinador = await this.repo.buscarPorId(id);
    if (!coordinador) {
      throw new RecursoNoEncontrado('Coordinador', id);
    }

    const nombre =
      input.nombre !== undefined
        ? Coordinador.validarNombre(input.nombre)
        : undefined;
    const especialidad =
      input.especialidad !== undefined
        ? Coordinador.validarEspecialidad(input.especialidad)
        : undefined;

    const actualizado = await this.repo.actualizar(id, coordinador, {
      ...(nombre !== undefined ? { nombre } : {}),
      ...(especialidad !== undefined ? { especialidad } : {}),
      ...(input.centrosCrearIds !== undefined
        ? { centrosCrearIds: input.centrosCrearIds }
        : {}),
      ...(input.centrosValidarIds !== undefined
        ? { centrosValidarIds: input.centrosValidarIds }
        : {}),
    });

    return aCoordinadorOutput(actualizado);
  }
}
