import { Coordinador } from '../../domain/Coordinador.js';
import type {
  CrearCoordinadorInput,
  CoordinadorCreadoOutput,
} from '../dto/CoordinadorDtos.js';
import type { RegistroCoordinadorPort } from '../ports/RegistroCoordinadorPort.js';

export class CrearCoordinadorUseCase {
  private readonly registro: RegistroCoordinadorPort;

  constructor(registro: RegistroCoordinadorPort) {
    this.registro = registro;
  }

  async execute(input: CrearCoordinadorInput): Promise<CoordinadorCreadoOutput> {
    // Valida reglas básicas del dominio antes de delegar el alta transaccional.
    Coordinador.validarNombre(input.nombre);
    Coordinador.validarEspecialidad(input.rol);

    return this.registro.registrar({
      ...input,
      nombre: input.nombre.trim(),
    });
  }
}
