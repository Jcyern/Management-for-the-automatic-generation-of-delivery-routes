import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { Roles } from '../../../../../Auth/roles.decorator.js';
import { RolEfectivo } from '../../../../../Auth/roles.js';
import { CrearFlotaUseCase } from '../../../application/use-cases/CrearFlotaUseCase.js';
import { ActualizarFlotaUseCase } from '../../../application/use-cases/ActualizarFlotaUseCase.js';
import { ObtenerFlotaUseCase } from '../../../application/use-cases/ObtenerFlotaUseCase.js';
import { EliminarFlotaUseCase } from '../../../application/use-cases/EliminarFlotaUseCase.js';
import { ListarFlotasUseCase } from '../../../application/use-cases/ListarFlotasUseCase.js';
import { CreateFlotaHttpDto, UpdateFlotaHttpDto } from './dto/Flota.http.dto.js';

@Controller('flota')
export class FlotaController {
  constructor(
    private readonly crear: CrearFlotaUseCase,
    private readonly actualizar: ActualizarFlotaUseCase,
    private readonly obtener: ObtenerFlotaUseCase,
    private readonly eliminar: EliminarFlotaUseCase,
    private readonly listar: ListarFlotasUseCase,
  ) {}

  @Post()
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  async crearFlota(@Body() dto: CreateFlotaHttpDto) {
    return this.crear.execute({ nombre: dto.nombre });
  }

  @Get()
  async listarFlotas() {
    return this.listar.execute();
  }

  @Get(':id')
  async obtenerFlota(@Param('id', ParseIntPipe) id: number) {
    return this.obtener.execute(id);
  }

  @Put(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  async actualizarFlota(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFlotaHttpDto) {
    return this.actualizar.execute(id, dto.nombre !== undefined ? { nombre: dto.nombre } : {});
  }

  @Delete(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  async eliminarFlota(@Param('id', ParseIntPipe) id: number) {
    return this.eliminar.execute(id);
  }
}