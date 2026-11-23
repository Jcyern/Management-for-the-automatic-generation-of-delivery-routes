export interface CrearZonaInput {
  nombre: string;
}

export interface ActualizarZonaInput {
  nombre?: string;
}

export interface ZonaOutput {
  id: number;
  nombre: string;
}
