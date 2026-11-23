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
    super(`${recurso} ${id} no encontrado`);
  }
}

export class ReglaDeNegocioViolada extends DomainError {
  readonly codigo = 'REGLA_VIOLADA';
}

export class Conflicto extends DomainError {
  readonly codigo = 'CONFLICTO';
}
