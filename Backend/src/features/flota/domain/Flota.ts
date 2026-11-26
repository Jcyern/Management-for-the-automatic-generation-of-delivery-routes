import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';

export interface FlotaParams {
  id: number | null;
  nombre: string;
}

export class Flota {
  private constructor(private readonly params: FlotaParams) {}

  static crear(nombre: string): Flota {
    return new Flota({ id: null, nombre: Flota.validarNombre(nombre) });
  }

  static rehidratar(params: FlotaParams): Flota {
    return new Flota({ ...params });
  }

  get id(): number | null {
    return this.params.id;
  }

  get nombre(): string {
    return this.params.nombre;
  }

  renombrar(nombre: string): Flota {
    return new Flota({ ...this.params, nombre: Flota.validarNombre(nombre) });
  }

  private static validarNombre(nombre: string): string {
    const limpio = nombre.trim();
    if (!limpio) {
      throw new ReglaDeNegocioViolada('El nombre de la flota es obligatorio.');
    }
    return limpio;
  }
}