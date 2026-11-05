/*
  Warnings:

  - Added the required column `destinatario` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Estado_Pedido" AS ENUM ('Pendiente', 'Entregado', 'Fallido', 'En_Ruta');

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "destinatario" TEXT NOT NULL,
ADD COLUMN     "direccion" TEXT NOT NULL,
ADD COLUMN     "estado" "Estado_Pedido" NOT NULL DEFAULT 'Pendiente',
ADD COLUMN     "fechaCreado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fechaLimite" TIMESTAMP(3);
