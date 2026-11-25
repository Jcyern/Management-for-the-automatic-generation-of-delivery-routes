import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';

export interface CentroParams {
  id: number | null;
  nombre: string;
  programaLogistico: string;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  zonasIds: number[];
}

export interface CrearCentroProps {
  nombre: string;
  programaLogistico: string;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  zonasIds?: number[];
}

export class Centro {
  private constructor(private readonly params: CentroParams) {}

  static crear(props: CrearCentroProps): Centro {
    const nombre = Centro.validarNombre(props.nombre);
    const programaLogistico = Centro.validarPrograma(props.programaLogistico);
    const direccion = Centro.normalizarDireccion(props.direccion ?? null);
    const latitud = props.latitud ?? null;
    const longitud = props.longitud ?? null;

    Centro.validarCoordenadas(latitud, longitud);
    Centro.validarUbicacion(direccion, latitud, longitud);

    return new Centro({
      id: null,
      nombre,
      programaLogistico,
      direccion,
      latitud,
      longitud,
      zonasIds: Centro.validarZonasIds(props.zonasIds ?? []),
    });
  }

  static rehidratar(params: CentroParams): Centro {
    return new Centro({ ...params });
  }

  get id(): number | null {
    return this.params.id;
  }

  get nombre(): string {
    return this.params.nombre;
  }

  get programaLogistico(): string {
    return this.params.programaLogistico;
  }

  get direccion(): string | null {
    return this.params.direccion;
  }

  get latitud(): number | null {
    return this.params.latitud;
  }

  get longitud(): number | null {
    return this.params.longitud;
  }

  get zonasIds(): number[] {
    // Copia para no exponer el estado interno.
    return [...this.params.zonasIds];
  }

  renombrar(nombre: string): Centro {
    return new Centro({ ...this.params, nombre: Centro.validarNombre(nombre) });
  }

  cambiarPrograma(programaLogistico: string): Centro {
    return new Centro({
      ...this.params,
      programaLogistico: Centro.validarPrograma(programaLogistico),
    });
  }

  ubicar(
    direccion: string | null,
    latitud: number | null,
    longitud: number | null,
  ): Centro {
    const direccionNormalizada = Centro.normalizarDireccion(direccion);

    Centro.validarCoordenadas(latitud, longitud);
    Centro.validarUbicacion(direccionNormalizada, latitud, longitud);

    return new Centro({
      ...this.params,
      direccion: direccionNormalizada,
      latitud,
      longitud,
    });
  }

  asignarZonas(zonasIds: number[]): Centro {
    return new Centro({
      ...this.params,
      zonasIds: Centro.validarZonasIds(zonasIds),
    });
  }

  private static validarNombre(nombre: string): string {
    const limpio = nombre.trim();
    if (!limpio) {
      throw new ReglaDeNegocioViolada('El nombre del centro es obligatorio.');
    }
    return limpio;
  }

  private static validarPrograma(programa: string): string {
    const limpio = programa.trim();
    if (!limpio) {
      throw new ReglaDeNegocioViolada('El programa logístico es obligatorio.');
    }
    return limpio;
  }

  private static normalizarDireccion(direccion: string | null): string | null {
    if (direccion == null) {
      return null;
    }
    const limpio = direccion.trim();
    return limpio ? limpio : null;
  }

  /** D3 + D4: lat/lon juntas y dentro de rango. */
  private static validarCoordenadas(
    latitud: number | null,
    longitud: number | null,
  ): void {
    if ((latitud == null) !== (longitud == null)) {
      throw new ReglaDeNegocioViolada(
        'Debes enviar latitud y longitud juntas.',
      );
    }
    if (latitud != null && (latitud < -90 || latitud > 90)) {
      throw new ReglaDeNegocioViolada(
        'La latitud debe estar entre -90 y 90.',
      );
    }
    if (longitud != null && (longitud < -180 || longitud > 180)) {
      throw new ReglaDeNegocioViolada(
        'La longitud debe estar entre -180 y 180.',
      );
    }
  }

  /** D5: siempre debe existir ubicación (dirección o coordenadas). */
  private static validarUbicacion(
    direccion: string | null,
    latitud: number | null,
    longitud: number | null,
  ): void {
    if (!direccion && (latitud == null || longitud == null)) {
      throw new ReglaDeNegocioViolada(
        'Debes indicar una dirección o las coordenadas del centro.',
      );
    }
  }

  /** Valida los ids de zonas referenciadas (solo forma, no datos de Zona). */
  private static validarZonasIds(zonasIds: number[]): number[] {
    const vistos = new Set<number>();
    for (const id of zonasIds) {
      if (!Number.isInteger(id) || id <= 0) {
        throw new ReglaDeNegocioViolada(`Zona inválida: id ${id}.`);
      }
      if (vistos.has(id)) {
        throw new ReglaDeNegocioViolada(`Zona duplicada: id ${id}.`);
      }
      vistos.add(id);
    }
    return [...zonasIds];
  }
}
