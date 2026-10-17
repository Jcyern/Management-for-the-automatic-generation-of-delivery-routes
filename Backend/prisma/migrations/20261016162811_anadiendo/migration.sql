/*
  Warnings:

  - The primary key for the `CoordinadorLogistico` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CoordinadorLogistico` table. All the data in the column will be lost.
  - You are about to drop the column `idCoordinador` on the `Logistico` table. All the data in the column will be lost.
  - The primary key for the `Repartidor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Repartidor` table. All the data in the column will be lost.
  - You are about to drop the column `idCoordinador` on the `SupervisorLogistico` table. All the data in the column will be lost.
  - Added the required column `idUser` to the `CoordinadorLogistico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idUser` to the `Repartidor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('LOGISTICO', 'REPARTIDOR', 'SUPERVISOR');

-- DropForeignKey
ALTER TABLE "Logistico" DROP CONSTRAINT "Logistico_idCoordinador_fkey";

-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_idCoordinador_fkey";

-- DropForeignKey
ALTER TABLE "SupervisorLogistico" DROP CONSTRAINT "SupervisorLogistico_idCoordinador_fkey";

-- DropForeignKey
ALTER TABLE "_Asignar" DROP CONSTRAINT "_Asignar_B_fkey";

-- DropForeignKey
ALTER TABLE "_ConsultaC" DROP CONSTRAINT "_ConsultaC_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConsultaR" DROP CONSTRAINT "_ConsultaR_A_fkey";

-- DropForeignKey
ALTER TABLE "_Crear Rutas" DROP CONSTRAINT "_Crear Rutas_B_fkey";

-- DropForeignKey
ALTER TABLE "_Validar Rutas" DROP CONSTRAINT "_Validar Rutas_B_fkey";

-- AlterTable
ALTER TABLE "CoordinadorLogistico" DROP CONSTRAINT "CoordinadorLogistico_pkey",
DROP COLUMN "id",
ADD COLUMN     "idUser" INTEGER NOT NULL,
ADD CONSTRAINT "CoordinadorLogistico_pkey" PRIMARY KEY ("idUser");

-- AlterTable
ALTER TABLE "Logistico" DROP COLUMN "idCoordinador",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Logistico_id_seq";

-- AlterTable
ALTER TABLE "Repartidor" DROP CONSTRAINT "Repartidor_pkey",
DROP COLUMN "id",
ADD COLUMN     "idUser" INTEGER NOT NULL,
ADD CONSTRAINT "Repartidor_pkey" PRIMARY KEY ("idUser");

-- AlterTable
ALTER TABLE "SupervisorLogistico" DROP COLUMN "idCoordinador",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "SupervisorLogistico_id_seq";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idCoordinador_fkey" FOREIGN KEY ("idCoordinador") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinadorLogistico" ADD CONSTRAINT "CoordinadorLogistico_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logistico" ADD CONSTRAINT "Logistico_id_fkey" FOREIGN KEY ("id") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorLogistico" ADD CONSTRAINT "SupervisorLogistico_id_fkey" FOREIGN KEY ("id") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repartidor" ADD CONSTRAINT "Repartidor_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Crear Rutas" ADD CONSTRAINT "_Crear Rutas_B_fkey" FOREIGN KEY ("B") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Validar Rutas" ADD CONSTRAINT "_Validar Rutas_B_fkey" FOREIGN KEY ("B") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Asignar" ADD CONSTRAINT "_Asignar_B_fkey" FOREIGN KEY ("B") REFERENCES "Repartidor"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultaC" ADD CONSTRAINT "_ConsultaC_A_fkey" FOREIGN KEY ("A") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultaR" ADD CONSTRAINT "_ConsultaR_A_fkey" FOREIGN KEY ("A") REFERENCES "Repartidor"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;
