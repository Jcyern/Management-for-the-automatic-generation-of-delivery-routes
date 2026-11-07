import 'dotenv/config';
import { prisma } from './seed/client.js';
import { CreateUsuarios } from './seed/usuarios.js';

async function main() {
  await CreateUsuarios(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
