import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZonaService } from './Zona.service.js';
import { CreateZonaDto, UpdateZonaDto } from './dto/Zona.dto.js';
import { RolesGuard } from '../Auth/roles.guard.js';
import { Roles } from '../Auth/roles.decorator.js';
import { RolUser } from '../generated/prisma/client.js';

@Controller('zona')
@UseGuards(AuthGuard('jwt'))
export class ZonaController {
  constructor(private readonly zonaService: ZonaService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RolUser.COORDINADOR)
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
  @UseGuards(RolesGuard)
  @Roles(RolUser.CCOORDINADOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateZonaDto) {
    return this.zonaService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUser.COORDINADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.zonaService.remove(id);
  }
}