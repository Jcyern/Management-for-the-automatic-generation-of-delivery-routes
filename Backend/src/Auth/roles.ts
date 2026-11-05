import { RolCoordinador, RolUser } from '../generated/prisma/client.js';

/**
 * Rol "aplanado" que usa la aplicación para autorizar peticiones.
 * Mezcla RolUser con la especialidad del coordinador logístico.
 */
export enum RolEfectivo {
  REPARTIDOR = 'REPARTIDOR',
  LOGISTICO = 'LOGISTICO',
  SUPERVISOR = 'SUPERVISOR',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

/** Clave de metadata que lee RolesGuard. */
export const ROLES_KEY = 'roles';

/** Clave de metadata que lee JwtAuthGuard para rutas públicas. */
export const IS_PUBLIC_KEY = 'isPublic';

/** Traduce el rol almacenado en BD al rol efectivo. */
export function rolEfectivo(usuario: {
  rol: RolUser;
  coordinador: { especialidad: RolCoordinador } | null;
}): RolEfectivo {
  if (usuario.rol === RolUser.REPARTIDOR) {
    return RolEfectivo.REPARTIDOR;
  }

  switch (usuario.coordinador?.especialidad) {
    case RolCoordinador.ADMINISTRADOR:
      return RolEfectivo.ADMINISTRADOR;
    case RolCoordinador.SUPERVISOR:
      return RolEfectivo.SUPERVISOR;
    default:
      return RolEfectivo.LOGISTICO;
  }
}

/** Traduce el rol efectivo del coordinador a la especialidad de BD. */
export const ESPECIALIDAD_POR_ROL: Record<
  Exclude<RolEfectivo, RolEfectivo.REPARTIDOR>,
  RolCoordinador
> = {
  [RolEfectivo.LOGISTICO]: RolCoordinador.LOGISTICO,
  [RolEfectivo.SUPERVISOR]: RolCoordinador.SUPERVISOR,
  [RolEfectivo.ADMINISTRADOR]: RolCoordinador.ADMINISTRADOR,
};