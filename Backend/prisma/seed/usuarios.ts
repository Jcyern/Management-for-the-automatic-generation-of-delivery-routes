import { hash } from 'bcryptjs';
import {
  Prisma,
  PrismaClient,
  RolUser,
} from '../../src/generated/prisma/client.js';
import { usuarios } from './data/usuarios.js';
import type { CoordinadorSeed, RepartidorSeed, UsuarioSeed} from './tipos.js';


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


async function createRepartidor(tx : Prisma.TransactionClient, iduser: number, datos: RepartidorSeed) {
  const flota = await tx.flota.findUnique({where:{id:datos.idFlota }})

  if(flota === null){
    throw new Error(`La flota con ${datos.idFlota} del repartidor ${datos.nombre} que se quiere crear  , no existe en la tabla Flota de la BD`)
  }

  else{
    //crear el repartidor entonces

    const repartidor = await tx.repartidor.create(
    { data:{
      idUser: iduser, 
      idFlota : datos.idFlota,
      nombre: datos.nombre,
      edad: datos.edad,
    }
  })  
  }
}



export async function  CreateFlota(prisma: PrismaClient){

  
  //El cirterio que se va a tomar es si ese Nombre ya existe en la tabla de flotas
  //const exite = await prisma.flota.findFirst({where:{nombre: }})
}