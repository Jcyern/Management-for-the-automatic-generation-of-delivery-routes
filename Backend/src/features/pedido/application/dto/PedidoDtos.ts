import type {
  CentroDelPedido,
  CoordinadorDelPedido,
  EstadoPedidoDominio,
  PrioridadPedido,
  TipoEntregaPedido,
} from '../../domain/Pedido.js';

export interface CrearPedidoInput {
  prioridad?: PrioridadPedido;
  tipoEntrega?: TipoEntregaPedido;
  destinatario: string;
  direccion: string;
  idCentro: number;
  idCoordinador: number;
  idZona: number;
  idParada?: number;
  idRuta?: number;
  fechaPrevista?: Date;
  fechaEntrega?: Date;
  estado?: EstadoPedidoDominio;
}

export interface ActualizarPedidoInput {
  prioridad?: PrioridadPedido;
  tipoEntrega?: TipoEntregaPedido;
  destinatario?: string;
  direccion?: string;
  idCentro?: number;
  idCoordinador?: number;
  idZona?: number;
  idParada?: number;
  idRuta?: number;
  fechaPrevista?: Date;
  fechaEntrega?: Date;
  estado?: EstadoPedidoDominio;
}

export interface ListarPedidosFiltro {
  estado?: EstadoPedidoDominio;
}

export interface PedidoOutput {
  id: number;
  prioridad: PrioridadPedido;
  tipoEntrega: TipoEntregaPedido;
  fechaPrevista: Date;
  fechaEntrega: Date | null;
  estado: EstadoPedidoDominio;
  destinatario: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  idParada: number | null;
  idCentro: number;
  idCoordinador: number;
  idRuta: number | null;
  idZona: number;
  centro: CentroDelPedido;
  coordinador: CoordinadorDelPedido;
}
