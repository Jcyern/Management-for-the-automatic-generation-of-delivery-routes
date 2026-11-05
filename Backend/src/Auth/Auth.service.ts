import { BadRequestException, ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { RolUser } from '../generated/prisma/client.js';
import { LoginDto } from './dto/Auth.dto.js';
import { RegisterDto } from './dto/Register.dto.js';
import {
  ESPECIALIDAD_POR_ROL,
  RolEfectivo,
  rolEfectivo,
} from './roles.js';

const BCRYPT_ROUNDS = 12;
const BCRYPT_PREFIX = /^\$2[aby]\$/;

type RolCoordinadorEfectivo = Exclude<
  RolEfectivo,
  RolEfectivo.REPARTIDOR
>;

function requerido<T>(valor: T | undefined, campo: string): T {
  if (valor === undefined) {
    throw new BadRequestException(`${campo} es obligatorio`);
  }
  return valor;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { correo: dto.email },
      include: {
        coordinador: {
          include: {
            logistico: true,
            supervisor: true,
            administrador: true,
          },
        },
        repartidor: {
          include: { centros: true, flota: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordOk = await this.verifyPassword(
      dto.password,
      user.password,
    );

    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Migración transparente: si estaba en texto plano, se re-hashea.
    if (!BCRYPT_PREFIX.test(user.password)) {
      await this.prisma.usuario.update({
        where: { id: user.id },
        data: { password: await hash(dto.password, BCRYPT_ROUNDS) },
      });
    }

    const {
      password: _password,
      coordinador,
      repartidor,
      ...datos
    } = user;

    const rol = rolEfectivo(user);

    const userData =
      rol === RolEfectivo.REPARTIDOR
        ? { ...datos, repartidor }
        : { ...datos, coordinador };

    return {
      user: { ...userData, rolEfectivo: rol },
      access_token: await this.jwt.signAsync({
        sub: user.id,
        email: user.correo,
        rol,
      }),
    };
  }

  async register(dto: RegisterDto) {
    const existe = await this.prisma.usuario.findUnique({
      where: { correo: dto.email },
    });

    if (existe) {
      throw new ConflictException('El correo ya está registrado');
    }

    const esCoordinador = dto.rol !== RolEfectivo.REPARTIDOR;
    const edad = esCoordinador
      ? null
      : requerido(dto.edad, 'edad');
    const idFlota = esCoordinador
      ? null
      : requerido(dto.idFlota, 'idFlota');
    const especialidad = esCoordinador
      ? ESPECIALIDAD_POR_ROL[dto.rol as RolCoordinadorEfectivo]
      : null;

    const password = await hash(dto.password, BCRYPT_ROUNDS);

    return this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          correo: dto.email,
          password,
          nombre: dto.nombre,
          rol: esCoordinador
            ? RolUser.COORDINADOR
            : RolUser.REPARTIDOR,
        },
      });

      if (edad !== null && idFlota !== null) {
        await tx.repartidor.create({
          data: {
            idUser: usuario.id,
            nombre: dto.nombre,
            edad,
            idFlota,
            centros: {
              connect: (dto.centrosIds ?? []).map((id) => ({ id })),
            },
          },
        });
      } else if (especialidad !== null) {
        await tx.coordinadorLogistico.create({
          data: {
            idUser: usuario.id,
            nombre: dto.nombre,
            especialidad,
            centrosCrearRuta: {
              connect: (dto.centrosCrearIds ?? []).map((id) => ({
                id,
              })),
            },
            centrosValidarRuta: {
              connect: (dto.centrosValidarIds ?? []).map((id) => ({
                id,
              })),
            },
          },
        });

        if (dto.rol === RolEfectivo.LOGISTICO) {
          await tx.logistico.create({
            data: { id: usuario.id, nombre: dto.nombre },
          });
        } else if (dto.rol === RolEfectivo.SUPERVISOR) {
          await tx.supervisorLogistico.create({
            data: { id: usuario.id, nombre: dto.nombre },
          });
        } else {
          await tx.administrador.create({
            data: { id: usuario.id, nombre: dto.nombre },
          });
        }
      }

      const { password: _password, ...creado } = usuario;
      return { ...creado, rolEfectivo: dto.rol };
    });
  }

  private async verifyPassword(plain: string, stored: string) {
    if (BCRYPT_PREFIX.test(stored)) {
      return compare(plain, stored);
    }

    // Legado: contraseña en texto plano. Se re-hashea al iniciar sesión.
    return plain === stored;
  }
}