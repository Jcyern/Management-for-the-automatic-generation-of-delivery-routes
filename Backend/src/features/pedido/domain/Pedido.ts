import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';

export const PRIORIDADES_PEDIDO = ['Baja', 'Media', 'Urgente'] as const;
export type PrioridadPedido = (typeof PRIORIDADES_PEDIDO)[number];

export const TIPOS_ENTREGA_PEDIDO = [
  'Paqueteria',
  'Perecederos',
  'Documentos',
  'Sin_Clasificar',
] as const;
export type TipoEntregaPedido = (typeof TIPOS_ENTREGA_PEDIDO)[number];

export const ESTADOS_PEDIDO = [
  'Pendiente',
  'Entregado',
  'Fallido',
  'En_Ruta',
] as const;
export type EstadoPedidoDominio = (typeof ESTADOS_PEDIDO)[number];

/** Coordenadas own del contexto, sin depender del contrato del proveedor geo. */
export interface CoordenadasPedido {
  latitud: number;
  longitud: number;
}

export interface CentroDelPedido {
  id: number;
  nombre: string;
  programaLogistico: string;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
}

export interface CoordinadorDelPedido {
  idUser: number;
  nombre: string;
  especialidad: string;
}

/** Datos necesarios para crear o rehidratar un pedido. */
export interface DatosPedido {
  prioridad?: PrioridadPedido | null;
  tipoEntrega?: TipoEntregaPedido | null;
  fechaPrevista?: Date | null;
  fechaEntrega?: Date | null;
  estado?: EstadoPedidoDominio | null;
  destinatario: string;
  direccion: string;
  coordenadas?: CoordenadasPedido | null;
  idParada?: number | null;
  idCentro: number;
  idCoordinador: number;
  idRuta?: number | null;
  idZona: number;
}

export interface PedidoParams extends DatosPedido {
  id: number | null;
  centro: CentroDelPedido | null;
  coordinador: CoordinadorDelPedido | null;
}

/** Cambios permitidos en una actualización. `undefined` significa "no enviado". */
export interface CambiosPedido {
  prioridad?: PrioridadPedido;
  tipoEntrega?: TipoEntregaPedido;
  destinatario?: string;
  direccion?: string;
  coordenadas?: CoordenadasPedido | null;
  idCentro?: number;
  idCoordinador?: number;
  idZona?: number;
  idParada?: number;
  idRuta?: number;
  fechaPrevista?: Date;
  fechaEntrega?: Date;
  estado?: EstadoPedidoDominio;
}

/**
 * Pedido del dominio. No conoce Prisma, NestJS ni HTTP.
 * Las reglas que existían en el servicio se conservan aquí: textos
 * obligatorios, ids positivos, enums válidos y coordenadas válidas.
 */
export class Pedido {
  private constructor(private readonly params: PedidoParams) {
    Pedido.validar(params);
  }

  static crear(datos: DatosPedido): Pedido {
    return new Pedido({
      id: null,
      centro: null,
      coordinador: null,
      ...datos,
    });
  }

  static rehidratar(params: PedidoParams): Pedido {
    return new Pedido(params);
  }

  get id(): number | null {
    return this.params.id;
  }

  get prioridad(): PrioridadPedido | null {
    return this.params.prioridad ?? null;
  }

  get tipoEntrega(): TipoEntregaPedido | null {
    return this.params.tipoEntrega ?? null;
  }

  get fechaPrevista(): Date | null {
    return this.params.fechaPrevista ?? null;
  }

  get fechaEntrega(): Date | null {
    return this.params.fechaEntrega ?? null;
  }

  get estado(): EstadoPedidoDominio | null {
    return this.params.estado ?? null;
  }

  get destinatario(): string {
    return this.params.destinatario;
  }

  get direccion(): string {
    return this.params.direccion;
  }

  get coordenadas(): CoordenadasPedido | null {
    return this.params.coordenadas ?? null;
  }

  get idParada(): number | null {
    return this.params.idParada ?? null;
  }

  get idCentro(): number {
    return this.params.idCentro;
  }

  get idCoordinador(): number {
    return this.params.idCoordinador;
  }

  get idRuta(): number | null {
    return this.params.idRuta ?? null;
  }

  get idZona(): number {
    return this.params.idZona;
  }

  get centro(): CentroDelPedido | null {
    return this.params.centro;
  }

  get coordinador(): CoordinadorDelPedido | null {
    return this.params.coordinador;
  }

  /**
   * Devuelve una nueva instancia con los cambios aplicados.
   * Solo se reemplazan coordenadas cuando también cambia la dirección,
   * preservando el comportamiento del CRUD anterior.
   */
  actualizar(cambios: CambiosPedido): Pedido {
    const { coordenadas: _coordenadas, ...resto } = cambios;

    return new Pedido({
      ...this.params,
      ...resto,
      ...(cambios.direccion !== undefined
        ? { coordenadas: cambios.coordenadas ?? null }
        : {}),
    });
  }

  private static validar(params: PedidoParams): void {
    Pedido.validarTexto(params.destinatario, 'destinatario');
    Pedido.validarTexto(params.direccion, 'direccion');
    Pedido.validarId(params.idCentro, 'idCentro');
    Pedido.validarId(params.idCoordinador, 'idCoordinador');
    Pedido.validarId(params.idZona, 'idZona');

    if (params.idParada !== undefined && params.idParada !== null) {
      Pedido.validarId(params.idParada, 'idParada');
    }
    if (params.idRuta !== undefined && params.idRuta !== null) {
      Pedido.validarId(params.idRuta, 'idRuta');
    }

    if (params.prioridad != null) {
      Pedido.validarEnum(params.prioridad, PRIORIDADES_PEDIDO, 'prioridad');
    }
    if (params.tipoEntrega != null) {
      Pedido.validarEnum(
        params.tipoEntrega,
        TIPOS_ENTREGA_PEDIDO,
        'tipoEntrega',
      );
    }
    if (params.estado != null) {
      Pedido.validarEnum(params.estado, ESTADOS_PEDIDO, 'estado');
    }

    if (params.coordenadas != null) {
      const { latitud, longitud } = params.coordenadas;
      if (
        !Number.isFinite(latitud) ||
        !Number.isFinite(longitud) ||
        latitud < -90 ||
        latitud > 90 ||
        longitud < -180 ||
        longitud > 180
      ) {
        throw new ReglaDeNegocioViolada('Las coordenadas del pedido no son válidas.');
      }
    }
  }

  private static validarTexto(valor: string, campo: string): void {
    if (!valor || !valor.trim()) {
      throw new ReglaDeNegocioViolada(`El ${campo} del pedido es obligatorio.`);
    }
  }

  private static validarId(valor: number, campo: string): void {
    if (!Number.isInteger(valor) || valor <= 0) {
      throw new ReglaDeNegocioViolada(`El ${campo} del pedido debe ser positivo.`);
    }
  }

  private static validarEnum<T extends string>(
    valor: T,
    permitidos: readonly T[],
    campo: string,
  ): void {
    if (!permitidos.includes(valor)) {
      throw new ReglaDeNegocioViolada(`El ${campo} del pedido no es válido.`);
    }
  }
}
