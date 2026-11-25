import {
  RecursoNoEncontrado,
  UbicacionNoResuelta,
} from '../../../../shared/domain/DomainError.js';
import type {
  CambiosPedido,
  CoordenadasPedido,
} from '../../domain/Pedido.js';
import type {
  ActualizarPedidoInput,
  PedidoOutput,
} from '../dto/PedidoDtos.js';
import { aPedidoOutput } from '../mappers/PedidoMapper.js';
import type { GeocodificacionPort } from '../ports/GeocodificacionPort.js';
import type { PedidoRepositoryPort } from '../ports/PedidoRepositoryPort.js';

export class ActualizarPedidoUseCase {
  private readonly repo: PedidoRepositoryPort;
  private readonly geocodificacion: GeocodificacionPort;

  constructor(repo: PedidoRepositoryPort, geocodificacion: GeocodificacionPort) {
    this.repo = repo;
    this.geocodificacion = geocodificacion;
  }

  async execute(id: number, input: ActualizarPedidoInput): Promise<PedidoOutput> {
    const pedido = await this.repo.buscarPorId(id);
    if (!pedido) {
      throw new RecursoNoEncontrado('Pedido', id);
    }

    const cambios: CambiosPedido = {
      ...(input.prioridad !== undefined ? { prioridad: input.prioridad } : {}),
      ...(input.tipoEntrega !== undefined ? { tipoEntrega: input.tipoEntrega } : {}),
      ...(input.destinatario !== undefined
        ? { destinatario: input.destinatario }
        : {}),
      ...(input.idCentro !== undefined ? { idCentro: input.idCentro } : {}),
      ...(input.idCoordinador !== undefined
        ? { idCoordinador: input.idCoordinador }
        : {}),
      ...(input.idZona !== undefined ? { idZona: input.idZona } : {}),
      ...(input.idParada !== undefined ? { idParada: input.idParada } : {}),
      ...(input.idRuta !== undefined ? { idRuta: input.idRuta } : {}),
      ...(input.fechaPrevista !== undefined
        ? { fechaPrevista: input.fechaPrevista }
        : {}),
      ...(input.fechaEntrega !== undefined
        ? { fechaEntrega: input.fechaEntrega }
        : {}),
      ...(input.estado !== undefined ? { estado: input.estado } : {}),
    };

    if (input.direccion !== undefined) {
      const coordenadas = await this.resolverCoordenadas(input.direccion);
      cambios.direccion = input.direccion;
      cambios.coordenadas = coordenadas;
    }

    const actualizado = pedido.actualizar(cambios);
    return aPedidoOutput(await this.repo.guardar(actualizado));
  }

  private async resolverCoordenadas(
    direccion: string,
  ): Promise<CoordenadasPedido | null> {
    const coordenadas = await this.geocodificacion.geocodificar(direccion);

    if (!coordenadas && this.geocodificacion.modoEstricto) {
      throw new UbicacionNoResuelta(direccion);
    }

    return coordenadas;
  }
}
