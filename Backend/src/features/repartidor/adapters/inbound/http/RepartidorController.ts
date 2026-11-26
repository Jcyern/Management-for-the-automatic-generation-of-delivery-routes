import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { Roles } from '../../../../../Auth/roles.decorator.js';
import { RolEfectivo } from '../../../../../Auth/roles.js';
import { CrearRepartidorUseCase } from '../../../application/use-cases/CrearRepartidorUseCase.js';
import { ActualizarRepartidorUseCase } from '../../../application/use-cases/ActualizarRepartidorUseCase.js';
import { ObtenerRepartidorUseCase } from '../../../application/use-cases/ObtenerRepartidorUseCase.js';
import { EliminarRepartidorUseCase } from '../../../application/use-cases/EliminarRepartidorUseCase.js';
import { ListarRepartidoresUseCase } from '../../../application/use-cases/ListarRepartidoresUseCase.js';
import { VerificarDisponibilidadUseCase } from '../../../application/use-cases/VerificarDisponibilidadUseCase.js';
import { CreateRepartidorHttpDto, UpdateRepartidorHttpDto } from './dto/Repartidor.http.dto.js';

@Controller('repartidor')
export class RepartidorController {
  constructor(
    private readonly crear: CrearRepartidorUseCase,
    private readonly actualizar: ActualizarRepartidorUseCase,
    private readonly obtener: ObtenerRepartidorUseCase,
    private readonly eliminar: EliminarRepartidorUseCase,
    private readonly listar: ListarRepartidoresUseCase,
    private readonly verificarDisp: VerificarDisponibilidadUseCase,
  ) {}

  @Post()
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  async crearRepartidor(@Body() dto: CreateRepartidorHttpDto) {
    return this.crear.execute({ 
      idUser: dto.idUser,
      nombre: dto.nombre,
      edad: dto.edad,
      idFlota: dto.idFlota,
      ...(dto.centrosIds !== undefined ? { centrosIds: dto.centrosIds } : {}),
    });
  }

  @Get()
  async listarRepartidores() {
    return this.listar.execute();
  }

  @Get(':id')
  async obtenerRepartidor(@Param('id', ParseIntPipe) id: number) {
    return this.obtener.execute(id);
  }

  @Put(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  async actualizarRepartidor(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRepartidorHttpDto) {
    return this.actualizar.execute(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.edad !== undefined ? { edad: dto.edad } : {}),
      ...(dto.idFlota !== undefined ? { idFlota: dto.idFlota } : {}),
      ...(dto.centrosIds !== undefined ? { centrosIds: dto.centrosIds } : {}),
    });
  }

  @Delete(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  async eliminarRepartidor(@Param('id', ParseIntPipe) id: number) {
    return this.eliminar.execute(id);
  }

  @Get(':id/disponibilidad')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  async disponibilidad(@Param('id', ParseIntPipe) id: number) {
    return this.verificarDisp.execute(id);
  }
}