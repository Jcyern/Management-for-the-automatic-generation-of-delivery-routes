import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Roles } from '../../../../../Auth/roles.decorator.js';
import { RolEfectivo } from '../../../../../Auth/roles.js';
import type {
  EstadoPedidoDominio,
  PrioridadPedido,
  TipoEntregaPedido,
} from '../../../domain/Pedido.js';
import { CrearPedidoUseCase } from '../../../application/use-cases/CrearPedidoUseCase.js';
import { ListarPedidosUseCase } from '../../../application/use-cases/ListarPedidosUseCase.js';
import { ObtenerPedidoUseCase } from '../../../application/use-cases/ObtenerPedidoUseCase.js';
import { ActualizarPedidoUseCase } from '../../../application/use-cases/ActualizarPedidoUseCase.js';
import { EliminarPedidoUseCase } from '../../../application/use-cases/EliminarPedidoUseCase.js';
import {
  CreatePedidoHttpDto,
  FilterPedidoHttpDto,
  UpdatePedidoHttpDto,
} from './dto/Pedido.http.dto.js';

/**
 * Adaptador HTTP del contexto Pedido.
 * La ruta pública se mantiene como `/order` por compatibilidad con el
 * contrato existente; internamente el feature ya usa el nombre Pedido.
 */
@Controller('order')
export class PedidoController {
  constructor(
    private readonly crear: CrearPedidoUseCase,
    private readonly listar: ListarPedidosUseCase,
    private readonly obtener: ObtenerPedidoUseCase,
    private readonly actualizar: ActualizarPedidoUseCase,
    private readonly eliminar: EliminarPedidoUseCase,
  ) {}

  @Post()
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  create(@Body() dto: CreatePedidoHttpDto) {
    return this.crear.execute({
      ...(dto.prioridad !== undefined
        ? { prioridad: dto.prioridad as PrioridadPedido }
        : {}),
      ...(dto.tipoEntrega !== undefined
        ? { tipoEntrega: dto.tipoEntrega as TipoEntregaPedido }
        : {}),
      destinatario: dto.destinatario,
      direccion: dto.direccion,
      idCentro: dto.idCentro,
      idCoordinador: dto.idCoordinador,
      idZona: dto.idZona,
      ...(dto.idParada !== undefined ? { idParada: dto.idParada } : {}),
      ...(dto.idRuta !== undefined ? { idRuta: dto.idRuta } : {}),
      ...(dto.fechaPrevista !== undefined
        ? { fechaPrevista: new Date(dto.fechaPrevista) }
        : {}),
      ...(dto.fechaEntrega !== undefined
        ? { fechaEntrega: new Date(dto.fechaEntrega) }
        : {}),
      ...(dto.estado !== undefined
        ? { estado: dto.estado as EstadoPedidoDominio }
        : {}),
    });
  }

  @Get()
  findAll(@Query() filtro: FilterPedidoHttpDto) {
    return this.listar.execute(filtro.estado as EstadoPedidoDominio | null);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.obtener.execute(id);
  }

  @Put(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePedidoHttpDto) {
    return this.actualizar.execute(id, {
      ...(dto.prioridad !== undefined
        ? { prioridad: dto.prioridad as PrioridadPedido }
        : {}),
      ...(dto.tipoEntrega !== undefined
        ? { tipoEntrega: dto.tipoEntrega as TipoEntregaPedido }
        : {}),
      ...(dto.destinatario !== undefined
        ? { destinatario: dto.destinatario }
        : {}),
      ...(dto.direccion !== undefined ? { direccion: dto.direccion } : {}),
      ...(dto.idCentro !== undefined ? { idCentro: dto.idCentro } : {}),
      ...(dto.idCoordinador !== undefined
        ? { idCoordinador: dto.idCoordinador }
        : {}),
      ...(dto.idZona !== undefined ? { idZona: dto.idZona } : {}),
      ...(dto.idParada !== undefined ? { idParada: dto.idParada } : {}),
      ...(dto.idRuta !== undefined ? { idRuta: dto.idRuta } : {}),
      ...(dto.fechaPrevista !== undefined
        ? { fechaPrevista: new Date(dto.fechaPrevista) }
        : {}),
      ...(dto.fechaEntrega !== undefined
        ? { fechaEntrega: new Date(dto.fechaEntrega) }
        : {}),
      ...(dto.estado !== undefined
        ? { estado: dto.estado as EstadoPedidoDominio }
        : {}),
    });
  }

  @Delete(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eliminar.execute(id);
  }
}
