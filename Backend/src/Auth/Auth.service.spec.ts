import { ConflictException, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { compare, hash } from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prismaModule/prisma.service.js';
import { RolCoordinador, RolUser } from '../generated/prisma/client.js';
import { AuthService } from './Auth.service.js';
import { RolEfectivo } from './roles.js';

const prisma = vi.hoisted(() => ({
  usuario: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  repartidor: { create: vi.fn() },
  coordinadorLogistico: { create: vi.fn() },
  logistico: { create: vi.fn() },
  supervisorLogistico: { create: vi.fn() },
  administrador: { create: vi.fn() },
  $transaction: vi.fn(),
}));

const jwt = {
  signAsync: vi.fn().mockResolvedValue('token-de-prueba'),
};

const usuarioBase = {
  id: 1,
  correo: 'ana@rutas.local',
  nombre: 'Ana',
  rol: RolUser.COORDINADOR,
  coordinador: {
    especialidad: RolCoordinador.LOGISTICO,
    logistico: { id: 1, nombre: 'Ana' },
    supervisor: null,
    administrador: null,
  },
  repartidor: null,
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    vi.resetAllMocks();
    jwt.signAsync.mockResolvedValue('token-de-prueba');
    prisma.$transaction.mockImplementation(
      async (cb: (tx: unknown) => unknown) => cb(prisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('hace login con contraseña hasheada y devuelve token', async () => {
    const passwordHash = await hash('Secreta123', 4);
    prisma.usuario.findUnique.mockResolvedValue({
      ...usuarioBase,
      password: passwordHash,
    });

    const resultado = await service.login({
      email: 'ana@rutas.local',
      password: 'Secreta123',
    });

    expect(resultado.access_token).toBe('token-de-prueba');
    expect(resultado.user).not.toHaveProperty('password');
    expect(resultado.user.rolEfectivo).toBe(RolEfectivo.LOGISTICO);
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 1,
      email: 'ana@rutas.local',
      rol: RolEfectivo.LOGISTICO,
    });
  });

  it('rechaza credenciales incorrectas', async () => {
    const passwordHash = await hash('Secreta123', 4);
    prisma.usuario.findUnique.mockResolvedValue({
      ...usuarioBase,
      password: passwordHash,
    });

    await expect(
      service.login({
        email: 'ana@rutas.local',
        password: 'otra',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza un correo inexistente', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'nadie@rutas.local',
        password: 'x',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('migra una contraseña en texto plano a hash en el login', async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      ...usuarioBase,
      password: 'Secreta123',
    });

    await service.login({
      email: 'ana@rutas.local',
      password: 'Secreta123',
    });

    expect(prisma.usuario.update).toHaveBeenCalledOnce();

    const data = prisma.usuario.update.mock.calls[0]![0].data;
    expect(data.password).not.toBe('Secreta123');
    expect(await compare('Secreta123', data.password)).toBe(true);
  });

  it('registra un repartidor con hash y sin contraseña en la respuesta', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.usuario.create.mockResolvedValue({
      id: 7,
      correo: 'rep@rutas.local',
      nombre: 'Rep',
      rol: RolUser.REPARTIDOR,
      password: 'hash',
    });

    const resultado = await service.register({
      email: 'rep@rutas.local',
      password: 'Secreta123',
      nombre: 'Rep',
      rol: RolEfectivo.REPARTIDOR,
      edad: 30,
      idFlota: 2,
      centrosIds: [1],
    });

    expect(resultado).not.toHaveProperty('password');
    expect(prisma.repartidor.create).toHaveBeenCalledOnce();

    const data = prisma.repartidor.create.mock.calls[0]![0].data;
    expect(data.edad).toBe(30);
    expect(data.idFlota).toBe(2);

    const passwordHash =
      prisma.usuario.create.mock.calls[0]![0].data.password;
    expect(await compare('Secreta123', passwordHash)).toBe(true);
  });

  it('registra un administrador con su perfil', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.usuario.create.mockResolvedValue({
      id: 9,
      correo: 'admin@rutas.local',
      nombre: 'Admin',
      rol: RolUser.COORDINADOR,
      password: 'hash',
    });

    await service.register({
      email: 'admin@rutas.local',
      password: 'Secreta123',
      nombre: 'Admin',
      rol: RolEfectivo.ADMINISTRADOR,
      centrosCrearIds: [1],
      centrosValidarIds: [1],
    });

    expect(prisma.coordinadorLogistico.create).toHaveBeenCalledOnce();
    expect(prisma.administrador.create).toHaveBeenCalledWith({
      data: { id: 9, nombre: 'Admin' },
    });
  });

  it('rechaza un correo duplicado', async () => {
    prisma.usuario.findUnique.mockResolvedValue(usuarioBase);

    await expect(
      service.register({
        email: 'ana@rutas.local',
        password: 'Secreta123',
        nombre: 'Ana',
        rol: RolEfectivo.LOGISTICO,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});