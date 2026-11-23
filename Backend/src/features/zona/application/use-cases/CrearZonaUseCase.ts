import { Zona } from '../../domain/Zona.js';
import type { ZonaRepositoryPort } from '../ports/ZonaRepositoryPort.js';
import type { CrearZonaInput, ZonaOutput } from '../dto/ZonaDtos.js';
import { aZonaOutput } from '../mappers/ZonaMapper.js';

export class CrearZonaUseCase {
  private readonly repo: ZonaRepositoryPort;

  constructor(repo: ZonaRepositoryPort) {
    this.repo = repo;
  }

  async execute(input: CrearZonaInput): Promise<ZonaOutput> {
    const zona = Zona.crear(input.nombre);
    return aZonaOutput(await this.repo.guardar(zona));
  }
}
