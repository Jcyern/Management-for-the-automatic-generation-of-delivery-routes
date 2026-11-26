import { Injectable } from '@nestjs/common';
import { AuthService } from '../../../../../Auth/Auth.service.js';
import { RolEfectivo } from '../../../../../Auth/roles.js';
import type { RegistroCoordinadorPort } from '../../../application/ports/RegistroCoordinadorPort.js';
import type {
  CrearCoordinadorInput,
  CoordinadorCreadoOutput,
} from '../../../application/dto/CoordinadorDtos.js';

@Injectable()
export class AuthRegistroCoordinadorAdapter implements RegistroCoordinadorPort {
  constructor(private readonly authService: AuthService) {}

  async registrar(input: CrearCoordinadorInput): Promise<CoordinadorCreadoOutput> {
    const resultado = await this.authService.register({
      email: input.email,
      password: input.password,
      nombre: input.nombre,
      rol: input.rol as RolEfectivo,
      ...(input.centrosCrearIds !== undefined
        ? { centrosCrearIds: input.centrosCrearIds }
        : {}),
      ...(input.centrosValidarIds !== undefined
        ? { centrosValidarIds: input.centrosValidarIds }
        : {}),
    });

    return {
      id: resultado.id,
      correo: resultado.correo,
      nombre: resultado.nombre,
      rol: resultado.rol,
      rolEfectivo: resultado.rolEfectivo,
    };
  }
}
