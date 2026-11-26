import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { Roles } from '../../../../../Auth/roles.decorator.js';
import { RolEfectivo } from '../../../../../Auth/roles.js';
import { CrearVehiculoUseCase } from '../../../application/use-cases/CrearVehiculoUseCase.js';
import { ActualizarVehiculoUseCase } from '../../../application/use-cases/ActualizarVehiculoUseCase.js';
import { ObtenerVehiculoUseCase } from '../../../application/use-cases/ObtenerVehiculoUseCase.js';
import { EliminarVehiculoUseCase } from '../../../application/use-cases/EliminarVehiculoUseCase.js';
import { ListarVehiculosUseCase } from '../../../application/use-cases/ListarVehiculosUseCase.js';
import { CreateVehiculoHttpDto, UpdateVehiculoHttpDto } from './dto/Vehiculo.http.dto.js';

@Controller('vehiculo')
export class VehiculoController {
  constructor(
    private readonly crear: CrearVehiculoUseCase,
    private readonly actualizar: ActualizarVehiculoUseCase,
    private readonly obtener: ObtenerVehiculoUseCase,
    private readonly eliminar: EliminarVehiculoUseCase,
    private readonly listar: ListarVehiculosUseCase,
  ) {}

  @Post()
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  async crearVehiculo(@Body() dto: CreateVehiculoHttpDto) {
    return this.crear.execute({ capacidad: dto.capacidad, idFlota: dto.idFlota });
  }

  @Get()
  async listarVehiculos() {
    return this.listar.execute();
  }

  @Get(':id')
  async obtenerVehiculo(@Param('id', ParseIntPipe) id: number) {
    return this.obtener.execute(id);
  }

  @Put(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  async actualizarVehiculo(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehiculoHttpDto) {
    return this.actualizar.execute(id, dto);
  }

  @Delete(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  async eliminarVehiculo(@Param('id', ParseIntPipe) id: number) {
    return this.eliminar.execute(id);
  }
}