import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { Roles } from '../../../../../Auth/roles.decorator.js';
import { RolEfectivo } from '../../../../../Auth/roles.js';
import { CrearCentroUseCase } from '../../../application/use-cases/CrearCentroUseCase.js';
import { ListarCentrosUseCase } from '../../../application/use-cases/ListarCentrosUseCase.js';
import { ObtenerCentroUseCase } from '../../../application/use-cases/ObtenerCentroUseCase.js';
import { ActualizarCentroUseCase } from '../../../application/use-cases/ActualizarCentroUseCase.js';
import { EliminarCentroUseCase } from '../../../application/use-cases/EliminarCentroUseCase.js';
import { AsignarCentroPorCorreoUseCase } from '../../../application/use-cases/AsignarCentroPorCorreoUseCase.js';
import { DesasignarCentroPorCorreoUseCase } from '../../../application/use-cases/DesasignarCentroPorCorreoUseCase.js';
import {
  CreateCentroHttpDto,
  UpdateCentroHttpDto,
} from './dto/Centro.http.dto.js';
import { AsignarPorCorreoHttpDto } from './dto/AsignarPorCorreo.http.dto.js';

interface PeticionAutenticada {
  user: { userId: number; rol: RolEfectivo };
}

@Controller('centro')
export class CentroController {
  constructor(
    private readonly crear: CrearCentroUseCase,
    private readonly listar: ListarCentrosUseCase,
    private readonly obtener: ObtenerCentroUseCase,
    private readonly actualizar: ActualizarCentroUseCase,
    private readonly eliminar: EliminarCentroUseCase,
    private readonly asignarPorCorreoUC: AsignarCentroPorCorreoUseCase,
    private readonly desasignarPorCorreoUC: DesasignarCentroPorCorreoUseCase,
  ) {}

  @Post()
  @Roles(RolEfectivo.ADMINISTRADOR)
  create(@Body() dto: CreateCentroHttpDto, @Req() req: PeticionAutenticada) {
    return this.crear.execute(
      {
        nombre: dto.nombre,
        programaLogistico: dto.programaLogistico,
        ...(dto.direccion !== undefined ? { direccion: dto.direccion } : {}),
        ...(dto.latitud !== undefined ? { latitud: dto.latitud } : {}),
        ...(dto.longitud !== undefined ? { longitud: dto.longitud } : {}),
        ...(dto.zonasIds !== undefined ? { zonasIds: dto.zonasIds } : {}),
      },
      req.user.userId,
    );
  }

  @Get()
  @Roles(
    RolEfectivo.ADMINISTRADOR,
    RolEfectivo.SUPERVISOR,
    RolEfectivo.LOGISTICO,
    RolEfectivo.REPARTIDOR,
  )
  findAll(@Req() req: PeticionAutenticada) {
    return this.listar.execute(
      req.user.userId,
      req.user.rol === RolEfectivo.ADMINISTRADOR,
    );
  }

  @Get(':id')
  @Roles(
    RolEfectivo.ADMINISTRADOR,
    RolEfectivo.SUPERVISOR,
    RolEfectivo.LOGISTICO,
    RolEfectivo.REPARTIDOR,
  )
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: PeticionAutenticada,
  ) {
    return this.obtener.execute(
      id,
      req.user.userId,
      req.user.rol === RolEfectivo.ADMINISTRADOR,
    );
  }

  @Get(':id/zonas')
  @Roles(
    RolEfectivo.ADMINISTRADOR,
    RolEfectivo.SUPERVISOR,
    RolEfectivo.LOGISTICO,
    RolEfectivo.REPARTIDOR,
  )
  async getZonas(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: PeticionAutenticada,
  ) {
    const centro = await this.obtener.execute(
      id,
      req.user.userId,
      req.user.rol === RolEfectivo.ADMINISTRADOR,
    );
    return centro.zonas;
  }

  @Put(':id')
  @Roles(RolEfectivo.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCentroHttpDto,
  ) {
    return this.actualizar.execute(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.programaLogistico !== undefined
        ? { programaLogistico: dto.programaLogistico }
        : {}),
      ...(dto.direccion !== undefined ? { direccion: dto.direccion } : {}),
      ...(dto.latitud !== undefined ? { latitud: dto.latitud } : {}),
      ...(dto.longitud !== undefined ? { longitud: dto.longitud } : {}),
      ...(dto.zonasIds !== undefined ? { zonasIds: dto.zonasIds } : {}),
    });
  }

  @Get(':id/asignaciones')
  @Roles(RolEfectivo.ADMINISTRADOR)
  async obtenerAsignaciones(@Param('id', ParseIntPipe) id: number) {
    await this.obtener.execute(id, 0, true);
    return this.obtener.obtenerAsignaciones(id);
  }

  @Post('asignar')
  @Roles(RolEfectivo.ADMINISTRADOR)
  asignarPorCorreo(@Body() dto: AsignarPorCorreoHttpDto) {
    return this.asignarPorCorreoUC.execute(dto);
  }

  @Delete('asignar')
  @Roles(RolEfectivo.ADMINISTRADOR)
  desasignarPorCorreo(@Body() dto: AsignarPorCorreoHttpDto) {
    return this.desasignarPorCorreoUC.execute(dto);
  }

  @Delete(':id')
  @Roles(RolEfectivo.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eliminar.execute(id);
  }
}
