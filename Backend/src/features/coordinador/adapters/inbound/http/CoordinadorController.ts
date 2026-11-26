import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../../../../../Auth/roles.decorator.js';
import { RolEfectivo } from '../../../../../Auth/roles.js';
import { CrearCoordinadorUseCase } from '../../../application/use-cases/CrearCoordinadorUseCase.js';
import { ListarCoordinadoresUseCase } from '../../../application/use-cases/ListarCoordinadoresUseCase.js';
import { ObtenerCoordinadorUseCase } from '../../../application/use-cases/ObtenerCoordinadorUseCase.js';
import { ActualizarCoordinadorUseCase } from '../../../application/use-cases/ActualizarCoordinadorUseCase.js';
import { EliminarCoordinadorUseCase } from '../../../application/use-cases/EliminarCoordinadorUseCase.js';
import {
  CreateCoordinadorHttpDto,
  UpdateCoordinadorHttpDto,
} from './dto/Coordinador.http.dto.js';

@Controller('coordinador')
export class CoordinadorController {
  constructor(
    private readonly crear: CrearCoordinadorUseCase,
    private readonly listar: ListarCoordinadoresUseCase,
    private readonly obtener: ObtenerCoordinadorUseCase,
    private readonly actualizar: ActualizarCoordinadorUseCase,
    private readonly eliminar: EliminarCoordinadorUseCase,
  ) {}

  @Post()
  @Roles(RolEfectivo.ADMINISTRADOR)
  create(@Body() dto: CreateCoordinadorHttpDto) {
    return this.crear.execute({
      email: dto.email,
      password: dto.password,
      nombre: dto.nombre,
      rol: dto.rol as 'LOGISTICO' | 'SUPERVISOR' | 'ADMINISTRADOR',
      ...(dto.centrosCrearIds !== undefined
        ? { centrosCrearIds: dto.centrosCrearIds }
        : {}),
      ...(dto.centrosValidarIds !== undefined
        ? { centrosValidarIds: dto.centrosValidarIds }
        : {}),
    });
  }

  @Get()
  @Roles(
    RolEfectivo.ADMINISTRADOR,
    RolEfectivo.LOGISTICO,
    RolEfectivo.SUPERVISOR,
  )
  findAll() {
    return this.listar.execute();
  }

  @Get(':id')
  @Roles(
    RolEfectivo.ADMINISTRADOR,
    RolEfectivo.LOGISTICO,
    RolEfectivo.SUPERVISOR,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.obtener.execute(id);
  }

  @Patch(':id')
  @Roles(RolEfectivo.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoordinadorHttpDto,
  ) {
    return this.actualizar.execute(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.especialidad !== undefined
        ? { especialidad: dto.especialidad }
        : {}),
      ...(dto.centrosCrearIds !== undefined
        ? { centrosCrearIds: dto.centrosCrearIds }
        : {}),
      ...(dto.centrosValidarIds !== undefined
        ? { centrosValidarIds: dto.centrosValidarIds }
        : {}),
    });
  }

  @Delete(':id')
  @Roles(RolEfectivo.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eliminar.execute(id);
  }
}
