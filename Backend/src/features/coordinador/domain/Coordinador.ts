import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';

export const ESPECIALIDADES_COORDINADOR = [
  'LOGISTICO',
  'SUPERVISOR',
  'ADMINISTRADOR',
] as const;

export type EspecialidadCoordinador = (typeof ESPECIALIDADES_COORDINADOR)[number];

export interface CentroResumen {
  id: number;
  nombre: string;
}

export interface UsuarioResumen {
  id: number;
  correo: string;
  rol: string;
}

export interface CoordinadorParams {
  id: number;
  nombre: string;
  correo: string;
  rolUsuario: string;
  especialidad: EspecialidadCoordinador;
  centrosCrearRuta: CentroResumen[];
  centrosValidarRuta: CentroResumen[];
  tieneLogistico: boolean;
  tieneSupervisor: boolean;
  tieneAdministrador: boolean;
}

/**
 * Representa el coordinador logístico como agregado de lectura/escritura
 * dentro del contexto. Las invariantes de negocio del módulo se validan aquí
 * o en los casos de uso; la persistencia se delega a puertos.
 */
export class Coordinador {
  private constructor(private readonly params: CoordinadorParams) {}

  static rehidratar(params: CoordinadorParams): Coordinador {
    return new Coordinador({
      ...params,
      nombre: Coordinador.validarNombre(params.nombre),
      especialidad: Coordinador.validarEspecialidad(params.especialidad),
    });
  }

  get id(): number {
    return this.params.id;
  }

  get nombre(): string {
    return this.params.nombre;
  }

  get especialidad(): EspecialidadCoordinador {
    return this.params.especialidad;
  }

  get correo(): string {
    return this.params.correo;
  }

  get rolUsuario(): string {
    return this.params.rolUsuario;
  }

  get centrosCrearRuta(): CentroResumen[] {
    return this.params.centrosCrearRuta;
  }

  get centrosValidarRuta(): CentroResumen[] {
    return this.params.centrosValidarRuta;
  }

  get tieneLogistico(): boolean {
    return this.params.tieneLogistico;
  }

  get tieneSupervisor(): boolean {
    return this.params.tieneSupervisor;
  }

  get tieneAdministrador(): boolean {
    return this.params.tieneAdministrador;
  }

  static validarNombre(nombre: string): string {
    const limpio = nombre.trim();
    if (!limpio) {
      throw new ReglaDeNegocioViolada('El nombre del coordinador es obligatorio.');
    }
    return limpio;
  }

  static validarEspecialidad(
    especialidad: string,
  ): EspecialidadCoordinador {
    if (
      !ESPECIALIDADES_COORDINADOR.includes(
        especialidad as EspecialidadCoordinador,
      )
    ) {
      throw new ReglaDeNegocioViolada(
        `Especialidad de coordinador inválida: ${especialidad}.`,
      );
    }
    return especialidad as EspecialidadCoordinador;
  }
}
