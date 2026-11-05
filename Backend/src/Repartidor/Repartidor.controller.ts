import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { RepartidorService } from './Repartidor.service.js';
import { CreateRepartidorDto, UpdateRepartidorDto } from './dto/Repartidor.dto.js';
import { Roles } from '../Auth/roles.decorator.js';
import { RolEfectivo } from '../Auth/roles.js';

@Controller('repartidor')
export class RepartidorController {
  constructor(private readonly repartidorService: RepartidorService) {}

  @Post()
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  create(@Body() dto: CreateRepartidorDto) {
    return this.repartidorService.create(dto);
  }

  @Get()
  findAll() {
    return this.repartidorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.repartidorService.findOne(id);
  }

  @Put(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRepartidorDto) {
    return this.repartidorService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.repartidorService.remove(id);
  }
}