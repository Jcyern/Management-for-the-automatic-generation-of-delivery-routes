export interface CrearFlotaInput {
  nombre: string;
}

export interface ActualizarFlotaInput {
  nombre?: string;
}

export interface FlotaOutput {
  id: number;
  nombre: string;
}

export interface FlotaConRelacionesOutput {
  id: number;
  nombre: string;
  vehiculos: unknown[];
  repartidores: unknown[];
}