import { ReglaDeNegocioViolada } from '../../../../shared/domain/DomainError.js';
import { Repartidor } from '../../domain/Repartidor.js';
import type { RepartidorRepositoryPort } from '../ports/RepartidorRepositoryPort.js';
import type { FlotaRepositoryPort } from '../../../flota/application/ports/FlotaRepositoryPort.js';
import type { UsuarioCheckerPort } from '../ports/ExternalPorts.js';
import type { CrearRepartidorInput, RepartidorOutput } from '../dto/RepartidorDtos.js';
import { aRepartidorOutput } from '../mappers/RepartidorMapper.js';

export class CrearRepartidorUseCase {
  constructor(
    private readonly repo: RepartidorRepositoryPort,
    private readonly flotaRepo: FlotaRepositoryPort,
    private readonly usuarioChecker: UsuarioCheckerPort,
  ) {}

  async execute(input: CrearRepartidorInput): Promise<RepartidorOutput> {
    if (!(await this.usuarioChecker.existe(input.idUser))) {
      throw new ReglaDeNegocioViolada(`El usuario con ID ${input.idUser} no existe.`);
    }
    if (!(await this.flotaRepo.buscarPorId(input.idFlota))) {
      throw new ReglaDeNegocioViolada(`La flota con ID ${input.idFlota} no existe.`);
    }

    const repartidor = Repartidor.crear(
      input.nombre, input.edad, input.idFlota, input.idUser, input.centrosIds
    );
    return aRepartidorOutput(await this.repo.guardar(repartidor));
  }
}