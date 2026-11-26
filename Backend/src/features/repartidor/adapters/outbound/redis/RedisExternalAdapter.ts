import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prismaModule/prisma.service.js';
import { TiempoRealService } from '../../../../../tiempo-real/tiempo-real.service.js';
import type { UsuarioCheckerPort, TiempoRealPort } from '../../../application/ports/ExternalPorts.js';

@Injectable()
export class ExternalAdapter implements UsuarioCheckerPort, TiempoRealPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tiempoReal: TiempoRealService
  ) {}

  async existe(idUser: number): Promise<boolean> {
    const user = await this.prisma.usuario.findUnique({ where: { id: idUser } });
    return !!user;
  }

  async estaDisponible(idRepartidor: number): Promise<boolean> {
    return this.tiempoReal.obtenerDisponibilidad(idRepartidor);
  }
}