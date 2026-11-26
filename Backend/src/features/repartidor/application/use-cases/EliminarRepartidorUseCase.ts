import { ReglaDeNegocioViolada, RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { RepartidorRepositoryPort } from '../ports/RepartidorRepositoryPort.js';
import type { RepartidorOutput } from '../dto/RepartidorDtos.js';
import { aRepartidorOutput } from '../mappers/RepartidorMapper.js';

export class EliminarRepartidorUseCase {
  constructor(private readonly repo: RepartidorRepositoryPort) {}
  async execute(idUser: number): Promise<RepartidorOutput> {
    const r = await this.repo.buscarPorId(idUser);
    if (!r) throw new RecursoNoEncontrado('Repartidor', idUser);
    if (await this.repo.tieneDependencias(idUser)) {
      throw new ReglaDeNegocioViolada('No se puede eliminar el repartidor porque tiene rutas asignadas o realizadas.');
    }
    return aRepartidorOutput(await this.repo.eliminar(idUser));
  }
}