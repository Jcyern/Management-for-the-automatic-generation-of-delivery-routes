export interface CrearRepartidorInput {
  idUser: number;
  nombre: string;
  edad: number;
  idFlota: number;
  centrosIds?: number[];
}

export interface ActualizarRepartidorInput {
  nombre?: string;
  edad?: number;
  idFlota?: number;
  centrosIds?: number[];
}

export interface RepartidorOutput {
  idUser: number;
  nombre: string;
  edad: number;
  idFlota: number;
}

export interface RepartidorConRelacionesOutput {
  idUser: number;
  nombre: string;
  edad: number;
  flota: { id: number; nombre: string };
  centros: { id: number; nombre: string }[];
}