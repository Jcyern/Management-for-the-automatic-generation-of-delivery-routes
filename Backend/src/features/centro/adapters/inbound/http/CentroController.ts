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
import {
  CreateCentroHttpDto,
  UpdateCentroHttpDto,
} from './dto/Centro.http.dto.js';

interface PeticionAutenticada {
  user: { userId: number; rol: RolEfectivo };
}

const ROLES_ESCRITURA = [
  RolEfectivo.LOGISTICO,
  RolEfectivo.SUPERVISOR,
  RolEfectivo.ADMINISTRADOR,
] as const;

@Controller('centro')
export class CentroController {
  constructor(
    private readonly crear: CrearCentroUseCase,
    private readonly listar: ListarCentrosUseCase,
    private readonly obtener: ObtenerCentroUseCase,
    private readonly actualizar: ActualizarCentroUseCase,
    private readonly eliminar: EliminarCentroUseCase,
  ) {}

  @Post()
  @Roles(...ROLES_ESCRITURA)
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
  findAll(@Req() req: PeticionAutenticada) {
    return this.listar.execute(
      req.user.userId,
      req.user.rol === RolEfectivo.ADMINISTRADOR,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.obtener.execute(id);
  }

  @Get(':id/zonas')
  async getZonas(@Param('id', ParseIntPipe) id: number) {
    const centro = await this.obtener.execute(id);
    return centro.zonas;
  }

  @Put(':id')
  @Roles(...ROLES_ESCRITURA)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCentroHttpDto,
    @Req() req: PeticionAutenticada,
  ) {
    return this.actualizar.execute(
      id,
      {
        ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
        ...(dto.programaLogistico !== undefined
          ? { programaLogistico: dto.programaLogistico }
          : {}),
        ...(dto.direccion !== undefined ? { direccion: dto.direccion } : {}),
        ...(dto.latitud !== undefined ? { latitud: dto.latitud } : {}),
        ...(dto.longitud !== undefined ? { longitud: dto.longitud } : {}),
        ...(dto.zonasIds !== undefined ? { zonasIds: dto.zonasIds } : {}),
      },
      req.user.userId,
    );
  }

  @Delete(':id')
  @Roles(...ROLES_ESCRITURA)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: PeticionAutenticada,
  ) {
    return this.eliminar.execute(id, req.user.userId);
  }
}
