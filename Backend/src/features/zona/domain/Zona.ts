import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';

export interface ZonaParams {
  id: number | null;
  nombre: string;
}

export class Zona {
  private constructor(private readonly params: ZonaParams) {}

  static crear(nombre: string): Zona {
    return new Zona({ id: null, nombre: Zona.validarNombre(nombre) });
  }

  static rehidratar(params: ZonaParams): Zona {
    return new Zona({ ...params });
  }

  get id(): number | null {
    return this.params.id;
  }

  get nombre(): string {
    return this.params.nombre;
  }

  renombrar(nombre: string): Zona {
    return new Zona({ ...this.params, nombre: Zona.validarNombre(nombre) });
  }

  private static validarNombre(nombre: string): string {
    const limpio = nombre.trim();
    if (!limpio) {
      throw new ReglaDeNegocioViolada('El nombre de la zona es obligatorio.');
    }
    return limpio;
  }
}
