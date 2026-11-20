import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { RutaService } from './Ruta.service.js';
import { CreateRutaDto, UpdateRutaDto, AsignarRutaDto, ValidarRutaDto, IniciarRutaDto, GenerarRutaDto } from './dto/Ruta.dto.js';
import { Roles } from '../Auth/roles.decorator.js';
import { RolEfectivo } from '../Auth/roles.js';

@Controller('ruta')
export class RutaController {
  constructor(private readonly rutaService: RutaService) {}

  @Post()
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  create(@Body() dto: CreateRutaDto) {
    return this.rutaService.create(dto);
  }

  @Post('generar')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  generar(@Body() dto: GenerarRutaDto) {
    return this.rutaService.generarRuta(dto);
  }

  @Get()
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  findAll() {
    return this.rutaService.findAll();
  }

  @Get('centro/:idCentro')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.SUPERVISOR, RolEfectivo.ADMINISTRADOR)
  findByCentro(@Param('idCentro', ParseIntPipe) idCentro: number, @Req() req: any) {
    return this.rutaService.findByCentro(idCentro, req.user.userId);
  }

  @Get('mis-rutas')
  @Roles(RolEfectivo.REPARTIDOR)
  getMisRutas(@Req() req: any) {
    return this.rutaService.getMisRutas(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rutaService.findOne(id);
  }

  @Put(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRutaDto) {
    return this.rutaService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rutaService.remove(id);
  }

  @Put(':id/asignar')
  @Roles(RolEfectivo.LOGISTICO, RolEfectivo.ADMINISTRADOR)
  asignarRuta(@Param('id', ParseIntPipe) id: number, @Body() dto: AsignarRutaDto, @Req() req: any) {
    return this.rutaService.asignarRuta(id, dto, req.user.userId);
  }

  @Put(':id/validar')
  @Roles(RolEfectivo.SUPERVISOR)
  validarRuta(@Param('id', ParseIntPipe) id: number, @Body() dto: ValidarRutaDto, @Req() req: any) {
    return this.rutaService.validarRuta(id, dto, req.user.userId);
  }

  @Put(':id/iniciar')
  @Roles(RolEfectivo.REPARTIDOR)
  iniciarRuta(@Param('id', ParseIntPipe) id: number, @Body() dto: IniciarRutaDto, @Req() req: any) {
    return this.rutaService.iniciarRuta(id, dto, req.user.userId);
  }

  @Put(':id/terminar')
  @Roles(RolEfectivo.REPARTIDOR)
  terminarRuta(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.rutaService.terminarRuta(id, req.user.userId);
  }
}