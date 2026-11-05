import { hash } from 'bcryptjs';
import { PrismaClient, RolCoordinador, RolUser} from '../src/generated/prisma/client.js';

const prisma = new PrismaClient();

const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@rutas.local';
const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
const nombre = process.env.SEED_ADMIN_NOMBRE ?? 'Administrador';

async function main() {
  const existente = await prisma.usuario.findUnique({
    where: { correo: email },
  });

  if (existente) {
    console.log(`El administrador ${email} ya existe`);
    return;
  }

  const passwordHash = await hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        correo: email,
        password: passwordHash,
        nombre,
        rol: RolUser.COORDINADOR,
      },
    });

    await tx.coordinadorLogistico.create({
      data: {
        idUser: usuario.id,
        nombre,
        especialidad: RolCoordinador.ADMINISTRADOR,
      },
    });

    await tx.administrador.create({
      data: { id: usuario.id, nombre },
    });
  });

  console.log(`Administrador creado: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());