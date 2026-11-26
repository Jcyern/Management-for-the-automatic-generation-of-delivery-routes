import type { CrearCoordinadorInput, CoordinadorCreadoOutput } from '../dto/CoordinadorDtos.js';

export const REGISTRO_COORDINADOR_PORT = Symbol('REGISTRO_COORDINADOR_PORT');

export interface RegistroCoordinadorPort {
  registrar(input: CrearCoordinadorInput): Promise<CoordinadorCreadoOutput>;
}
