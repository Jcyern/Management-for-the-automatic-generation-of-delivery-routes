export abstract class DomainError extends Error {
  abstract readonly codigo: string;

  constructor(mensaje: string) {
    super(mensaje);
    this.name = new.target.name;
  }
}

export class RecursoNoEncontrado extends DomainError {
  readonly codigo = 'NO_ENCONTRADO';

  constructor(recurso: string, id: unknown) {
    super(`${recurso} ${String(id)} no encontrado`);
  }
}

export class ReglaDeNegocioViolada extends DomainError {
  readonly codigo = 'REGLA_VIOLADA';
}

export class Conflicto extends DomainError {
  readonly codigo = 'CONFLICTO';
}

/** La dirección no pudo resolverse y el modo estricto está activo. */
export class UbicacionNoResuelta extends DomainError {
  readonly codigo = 'UBICACION_NO_RESUELTA';

  constructor(direccion: string) {
    super(
      `No se pudo obtener la ubicación para la dirección "${direccion}". Verifícala e intenta de nuevo.`,
    );
  }
}
