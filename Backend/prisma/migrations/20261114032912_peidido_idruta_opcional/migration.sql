-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_idRuta_fkey";

-- AlterTable
ALTER TABLE "Pedido" ALTER COLUMN "idRuta" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idRuta_fkey" FOREIGN KEY ("idRuta") REFERENCES "Ruta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
