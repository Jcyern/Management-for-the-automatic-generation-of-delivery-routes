/*
  Warnings:

  - Added the required column `idCentro` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idCoordinador` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "idCentro" INTEGER NOT NULL,
ADD COLUMN     "idCoordinador" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CentroDeDistribucion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "programaLogistico" TEXT NOT NULL,

    CONSTRAINT "CentroDeDistribucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zona" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Zona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoordinadorLogistico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "CoordinadorLogistico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logistico" (
    "id" SERIAL NOT NULL,
    "idCoordinador" INTEGER NOT NULL,

    CONSTRAINT "Logistico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupervisorLogistico" (
    "id" SERIAL NOT NULL,
    "idCoordinador" INTEGER NOT NULL,

    CONSTRAINT "SupervisorLogistico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Cubre" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Cubre_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Cubre_B_index" ON "_Cubre"("B");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idCentro_fkey" FOREIGN KEY ("idCentro") REFERENCES "CentroDeDistribucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idCoordinador_fkey" FOREIGN KEY ("idCoordinador") REFERENCES "CoordinadorLogistico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logistico" ADD CONSTRAINT "Logistico_idCoordinador_fkey" FOREIGN KEY ("idCoordinador") REFERENCES "CoordinadorLogistico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorLogistico" ADD CONSTRAINT "SupervisorLogistico_idCoordinador_fkey" FOREIGN KEY ("idCoordinador") REFERENCES "CoordinadorLogistico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Cubre" ADD CONSTRAINT "_Cubre_A_fkey" FOREIGN KEY ("A") REFERENCES "CentroDeDistribucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Cubre" ADD CONSTRAINT "_Cubre_B_fkey" FOREIGN KEY ("B") REFERENCES "Zona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
