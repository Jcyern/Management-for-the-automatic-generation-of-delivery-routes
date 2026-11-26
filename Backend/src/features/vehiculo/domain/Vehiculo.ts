import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';

export interface VehiculoParams {
  id: number | null;
  capacidad: number;
  idFlota: number;
}

export class Vehiculo {
  private constructor(private readonly params: VehiculoParams) {}

  static crear(capacidad: number, idFlota: number): Vehiculo {
    return new Vehiculo({
      id: null,
      capacidad: Vehiculo.validarCapacidad(capacidad),
      idFlota,
    });
  }

  static rehidratar(params: VehiculoParams): Vehiculo {
    return new Vehiculo({ ...params });
  }

  get id(): number | null { return this.params.id; }
  get capacidad(): number { return this.params.capacidad; }
  get idFlota(): number { return this.params.idFlota; }

  cambiarCapacidad(capacidad: number): Vehiculo {
    return new Vehiculo({ ...this.params, capacidad: Vehiculo.validarCapacidad(capacidad) });
  }

  cambiarFlota(idFlota: number): Vehiculo {
    return new Vehiculo({ ...this.params, idFlota });
  }

  private static validarCapacidad(capacidad: number): number {
    if (capacidad <= 0) {
      throw new ReglaDeNegocioViolada('La capacidad del vehículo debe ser mayor a 0.');
    }
    return capacidad;
  }
}