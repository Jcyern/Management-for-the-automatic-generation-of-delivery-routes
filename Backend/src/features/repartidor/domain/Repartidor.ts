import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';

export interface RepartidorParams {
  idUser: number;
  nombre: string;
  edad: number;
  idFlota: number;
  centrosIds: number[];
}

export class Repartidor {
  private constructor(private readonly params: RepartidorParams) {}

  static crear(nombre: string, edad: number, idFlota: number, idUser: number, centrosIds: number[] = []): Repartidor {
    return new Repartidor({
      idUser,
      nombre: Repartidor.validarNombre(nombre),
      edad: Repartidor.validarEdad(edad),
      idFlota,
      centrosIds,
    });
  }

  static rehidratar(params: RepartidorParams): Repartidor {
    return new Repartidor({ ...params });
  }

  get idUser(): number { return this.params.idUser; }
  get nombre(): string { return this.params.nombre; }
  get edad(): number { return this.params.edad; }
  get idFlota(): number { return this.params.idFlota; }
  get centrosIds(): number[] { return this.params.centrosIds; }

  actualizarDatos(nombre?: string, edad?: number, idFlota?: number, centrosIds?: number[]): Repartidor {
    return new Repartidor({
      ...this.params,
      nombre: nombre !== undefined ? Repartidor.validarNombre(nombre) : this.params.nombre,
      edad: edad !== undefined ? Repartidor.validarEdad(edad) : this.params.edad,
      idFlota: idFlota !== undefined ? idFlota : this.params.idFlota,
      centrosIds: centrosIds !== undefined ? centrosIds : this.params.centrosIds,
    });
  }

  private static validarNombre(nombre: string): string {
    const limpio = nombre.trim();
    if (!limpio) throw new ReglaDeNegocioViolada('El nombre del repartidor es obligatorio.');
    return limpio;
  }

  private static validarEdad(edad: number): number {
    if (edad < 18) throw new ReglaDeNegocioViolada('El repartidor debe ser mayor de edad.');
    return edad;
  }
}