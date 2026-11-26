export const USUARIO_CHECKER = Symbol('USUARIO_CHECKER');
export const TIEMPO_REAL_PORT = Symbol('TIEMPO_REAL_PORT');

export interface UsuarioCheckerPort {
  existe(idUser: number): Promise<boolean>;
}

export interface TiempoRealPort {
  estaDisponible(idUser: number): Promise<boolean>;
}