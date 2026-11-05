import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req
} from '@nestjs/common';
import { CentroService } from './Centro.service.js';
import { CreateCentroDto, UpdateCentroDto } from './dto/Centro.dto.js';
import { Roles } from '../Auth/roles.decorator.js';
import { RolEfectivo } from '../Auth/roles.js';

@Controller('centro')
export class CentroController {
  constructor(private centroService: CentroService) {}

  @Post()
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  create(@Body() dto: CreateCentroDto, @Req() req: any) {
    return this.centroService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.centroService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.centroService.findOne(id);
  }

  @Put(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCentroDto,
    @Req() req: any,
  ) {
    return this.centroService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.centroService.remove(id, req.user.userId);
  }
}
