import 'dotenv/config';
import { prisma } from './seed/client.js';
import { CreateFlota, CreateUsuarios } from './seed/createRows.js';

async function main() {
  await CreateFlota(prisma);
  await CreateUsuarios(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
