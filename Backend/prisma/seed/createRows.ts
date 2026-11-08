import { hash } from 'bcryptjs';
import {
  Prisma,
  PrismaClient,
  RolUser,
} from '../../src/generated/prisma/client.js';
import { flotas, usuarios } from './data/datos.js';
import type { CoordinadorSeed, RepartidorSeed, UsuarioSeed} from './tipos.js';
import { capitalizeCase } from '../../src/common/text.js';


const BCRYPT_ROUNDS = 12;



export async function CreateUsuarios(prisma: PrismaClient) {

  for (const datos of usuarios) {
    const existente = await prisma.usuario.findUnique({
      where: { correo: datos.email },
    });

    if (existente) {
      console.log(`[omitido] ${datos.email} ya existe`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      //crea el usuario
      const usuario = await crearUsuarioBase(tx, datos);
      
      if(datos.roluser === RolUser.COORDINADOR)  //Crear  Coordinador en la DB
      await crearPerfilCoordinador(tx, usuario.id, datos);  

      if(datos.roluser === RolUser.REPARTIDOR)
      {
        await createRepartidor(tx,usuario.id ,datos)
      }
    });

    console.log(`[creado] ${datos.email} (${datos.roluser})`);
  }
}

async function crearUsuarioBase(
  tx: Prisma.TransactionClient,
  datos: UsuarioSeed
) {

  return tx.usuario.create({
    data: {
      correo: datos.email,
      password: await hash(datos.password, BCRYPT_ROUNDS),
      nombre: datos.nombre,
      rol: datos.roluser,
    },
  });
}

async function crearPerfilCoordinador(
  tx: Prisma.TransactionClient,
  idUser: number,
  datos: CoordinadorSeed
) {
  await tx.coordinadorLogistico.create({
    data: {
      idUser,
      nombre: datos.nombre,
      especialidad: datos.rol
    },
  });

  switch (datos.rol) {
    case 'ADMINISTRADOR':
      await tx.administrador.create({
        data: { id: idUser, nombre: datos.nombre },
      });
      return;

    case 'LOGISTICO':
      await tx.logistico.create({
        data: { id: idUser, nombre: datos.nombre },
      });
      return;

    case 'SUPERVISOR':
      await tx.supervisorLogistico.create({
        data: { id: idUser, nombre: datos.nombre },
      });
      return;

    default:
      throw new Error(
        'No es un rol perteneciente al perfil de los Coordinadores',
      );
  }
}


async function createRepartidor(
  tx: Prisma.TransactionClient,
  iduser: number,
  datos: RepartidorSeed,
) {
  const nombreFlota = capitalizeCase(datos.flota);

  const flota = await tx.flota.findFirst({
    where: {
      nombre: {
        equals: nombreFlota,
        mode: 'insensitive',
      },
    },
  });

  if (flota === null) {
    throw new Error(
      `La flota "${nombreFlota}" del repartidor ${datos.nombre} no existe en la tabla Flota de la BD`,
    );
  }

  await tx.repartidor.create({
    data: {
      idUser: iduser,
      idFlota: flota.id,
      nombre: datos.nombre,
      edad: datos.edad,
    },
  });
}



export async function CreateFlota(prisma: PrismaClient) {
  for (const flota of flotas) {
    const nombre = capitalizeCase(flota);

    const existe = await prisma.flota.findFirst({
      where: {
        nombre: {
          equals: nombre,
          mode: 'insensitive',
        },
      },
    });

    if (existe) {
      console.log(`[omitido] flota ${nombre} ya existe`);
      continue;
    }

    await prisma.flota.create({
      data: { nombre },
    });

    console.log(`[creado] flota ${nombre}`);
  }
}