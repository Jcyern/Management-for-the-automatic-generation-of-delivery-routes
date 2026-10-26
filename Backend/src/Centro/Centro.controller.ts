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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CentroService } from './Centro.service.js';
import { CreateCentroDto, UpdateCentroDto } from './dto/Centro.dto.js';
import { RolesGuard } from '../Auth/roles.guard.js';
import { Roles } from '../Auth/roles.decorator.js';
import { Rol } from '../generated/prisma/client.js';

@Controller('centro')
@UseGuards(AuthGuard('jwt'))
export class CentroController {
  constructor(private centroService: CentroService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Rol.LOGISTICO, Rol.SUPERVISOR)
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
  @UseGuards(RolesGuard)
  @Roles(Rol.LOGISTICO, Rol.SUPERVISOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCentroDto,
    @Req() req: any,
  ) {
    return this.centroService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.LOGISTICO, Rol.SUPERVISOR)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.centroService.remove(id, req.user.userId);
  }
}
