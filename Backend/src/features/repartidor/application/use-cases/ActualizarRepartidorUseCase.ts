import { ReglaDeNegocioViolada, RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { RepartidorRepositoryPort } from '../ports/RepartidorRepositoryPort.js';
import type { FlotaRepositoryPort } from '../../../flota/application/ports/FlotaRepositoryPort.js';
import type { ActualizarRepartidorInput, RepartidorOutput } from '../dto/RepartidorDtos.js';
import { aRepartidorOutput } from '../mappers/RepartidorMapper.js';

export class ActualizarRepartidorUseCase {
  constructor(
    private readonly repo: RepartidorRepositoryPort,
    private readonly flotaRepo: FlotaRepositoryPort,
  ) {}

  async execute(idUser: number, input: ActualizarRepartidorInput): Promise<RepartidorOutput> {
    const repartidor = await this.repo.buscarPorId(idUser);
    if (!repartidor) throw new RecursoNoEncontrado('Repartidor', idUser);

    if (input.idFlota !== undefined && input.idFlota !== repartidor.idFlota) {
      if (!(await this.flotaRepo.buscarPorId(input.idFlota))) {
        throw new ReglaDeNegocioViolada(`La flota con ID ${input.idFlota} no existe.`);
      }
    }

    const actualizado = repartidor.actualizarDatos(input.nombre, input.edad, input.idFlota, input.centrosIds);
    return aRepartidorOutput(await this.repo.guardar(actualizado));
  }
}