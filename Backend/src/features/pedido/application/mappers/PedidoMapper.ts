import type { Pedido } from '../../domain/Pedido.js';
import type { PedidoOutput } from '../dto/PedidoDtos.js';

export function aPedidoOutput(pedido: Pedido): PedidoOutput {
  const id = pedido.id;
  const centro = pedido.centro;
  const coordinador = pedido.coordinador;
  const fechaPrevista = pedido.fechaPrevista;

  if (id === null || centro === null || coordinador === null || fechaPrevista === null) {
    throw new Error('No se puede mapear un Pedido sin datos persistidos.');
  }

  if (pedido.prioridad === null || pedido.tipoEntrega === null || pedido.estado === null) {
    throw new Error('No se puede mapear un Pedido sin enum persistido.');
  }

  return {
    id,
    prioridad: pedido.prioridad,
    tipoEntrega: pedido.tipoEntrega,
    fechaPrevista,
    fechaEntrega: pedido.fechaEntrega,
    estado: pedido.estado,
    destinatario: pedido.destinatario,
    direccion: pedido.direccion,
    latitud: pedido.coordenadas?.latitud ?? null,
    longitud: pedido.coordenadas?.longitud ?? null,
    idParada: pedido.idParada,
    idCentro: pedido.idCentro,
    idCoordinador: pedido.idCoordinador,
    idRuta: pedido.idRuta,
    idZona: pedido.idZona,
    centro,
    coordinador,
  };
}
