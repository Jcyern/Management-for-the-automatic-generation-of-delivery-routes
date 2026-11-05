import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ZonaService } from './Zona.service.js';
import { CreateZonaDto, UpdateZonaDto } from './dto/Zona.dto.js';
import { Roles } from '../Auth/roles.decorator.js';
import { RolEfectivo } from '../Auth/roles.js';

@Controller('zona')
export class ZonaController {
  constructor(private readonly zonaService: ZonaService) {}

  @Post()
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  create(@Body() dto: CreateZonaDto) {
    return this.zonaService.create(dto);
  }

  @Get()
  findAll() {
    return this.zonaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.zonaService.findOne(id);
  }

  @Put(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateZonaDto) {
    return this.zonaService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.zonaService.remove(id);
  }
}