import { UbicacionNoResuelta } from '../../../../shared/domain/DomainError.js';
import {
  Pedido,
  type CoordenadasPedido,
} from '../../domain/Pedido.js';
import type {
  CrearPedidoInput,
  PedidoOutput,
} from '../dto/PedidoDtos.js';
import { aPedidoOutput } from '../mappers/PedidoMapper.js';
import type { GeocodificacionPort } from '../ports/GeocodificacionPort.js';
import type { PedidoRepositoryPort } from '../ports/PedidoRepositoryPort.js';

export class CrearPedidoUseCase {
  private readonly repo: PedidoRepositoryPort;
  private readonly geocodificacion: GeocodificacionPort;

  constructor(repo: PedidoRepositoryPort, geocodificacion: GeocodificacionPort) {
    this.repo = repo;
    this.geocodificacion = geocodificacion;
  }

  async execute(input: CrearPedidoInput): Promise<PedidoOutput> {
    // Valida reglas de dominio antes de invocar al proveedor externo.
    const base = Pedido.crear({ ...input, coordenadas: null });
    const coordenadas = await this.resolverCoordenadas(base.direccion);

    const pedido = Pedido.crear({ ...input, coordenadas });
    return aPedidoOutput(await this.repo.guardar(pedido));
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
