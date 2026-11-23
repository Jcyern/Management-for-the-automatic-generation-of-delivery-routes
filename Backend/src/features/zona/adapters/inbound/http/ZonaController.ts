import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { Roles } from '../../../../../Auth/roles.decorator.js';
import { RolEfectivo } from '../../../../../Auth/roles.js';
import { CrearZonaUseCase } from '../../../application/use-cases/CrearZonaUseCase.js';
import { ActualizarZonaUseCase } from '../../../application/use-cases/ActualizarZonaUseCase.js';
import { ObtenerZonaUseCase } from '../../../application/use-cases/ObtenerZonaUseCase.js';
import { EliminarZonaUseCase } from '../../../application/use-cases/EliminarZonaUseCase.js';
import { ListarZonasUseCase } from '../../../application/use-cases/ListarZonasUseCase.js';
import { CreateZonaHttpDto, UpdateZonaHttpDto } from './dto/Zona.http.dto.js';

@Controller('zona')
export class ZonaController {
  constructor(
    private readonly crear: CrearZonaUseCase,
    private readonly actualizar: ActualizarZonaUseCase,
    private readonly obtener: ObtenerZonaUseCase,
    private readonly eliminar: EliminarZonaUseCase,
    private readonly listar: ListarZonasUseCase,
  ) {}

  @Post()
  @Roles(RolEfectivo.ADMINISTRADOR)
  async crearZona(@Body() dto: CreateZonaHttpDto) {
    return this.crear.execute({ nombre: dto.nombre });
  }

  @Get()
  async listarZonas() {
    return this.listar.execute();
  }

  @Get(':id')
  async obtenerZona(@Param('id', ParseIntPipe) id: number) {
    return this.obtener.execute(id);
  }

  @Put(':id')
  @Roles(RolEfectivo.ADMINISTRADOR)
  async actualizarZona(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateZonaHttpDto,
  ) {
    return this.actualizar.execute(
      id,
      dto.nombre !== undefined ? { nombre: dto.nombre } : {},
    );
  }

  @Delete(':id')
  @Roles(RolEfectivo.ADMINISTRADOR)
  async eliminarZona(@Param('id', ParseIntPipe) id: number) {
    return this.eliminar.execute(id);
  }
}
