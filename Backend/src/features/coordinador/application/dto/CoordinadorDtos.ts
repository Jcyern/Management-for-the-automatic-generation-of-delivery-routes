import type { EspecialidadCoordinador } from '../../domain/Coordinador.js';

export interface CrearCoordinadorInput {
  email: string;
  password: string;
  nombre: string;
  rol: EspecialidadCoordinador;
  centrosCrearIds?: number[];
  centrosValidarIds?: number[];
}

export interface ActualizarCoordinadorInput {
  nombre?: string;
  especialidad?: EspecialidadCoordinador;
  centrosCrearIds?: number[];
  centrosValidarIds?: number[];
}

export interface CentroResumenOutput {
  id: number;
  nombre: string;
}

export interface UsuarioResumenOutput {
  id: number;
  correo: string;
  rol: string;
}

export interface SubtipoOutput {
  id: number;
  nombre: string;
}

export interface CoordinadorOutput {
  idUser: number;
  nombre: string;
  especialidad: EspecialidadCoordinador;
  user: UsuarioResumenOutput;
  centrosCrearRuta: CentroResumenOutput[];
  centrosValidarRuta: CentroResumenOutput[];
  logistico: SubtipoOutput | null;
  supervisor: SubtipoOutput | null;
  administrador: SubtipoOutput | null;
}

export interface CoordinadorCreadoOutput {
  id: number;
  correo: string;
  nombre: string;
  rol: string;
  rolEfectivo: string;
}

export interface CoordinadorEliminadoOutput {
  id: number;
  nombre: string;
  eliminado: true;
}
