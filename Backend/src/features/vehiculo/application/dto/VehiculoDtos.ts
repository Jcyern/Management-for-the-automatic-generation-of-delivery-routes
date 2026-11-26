export interface CrearVehiculoInput {
  capacidad: number;
  idFlota: number;
}

export interface ActualizarVehiculoInput {
  capacidad?: number;
  idFlota?: number;
}

export interface VehiculoOutput {
  id: number;
  capacidad: number;
  idFlota: number;
}

export interface VehiculoConRelacionesOutput {
  id: number;
  capacidad: number;
  flota: { id: number; nombre: string };
}