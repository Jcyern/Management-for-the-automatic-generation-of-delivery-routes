-- AlterTable
ALTER TABLE "Parada" ADD COLUMN     "idPedido" INTEGER;

-- AddForeignKey
ALTER TABLE "Parada" ADD CONSTRAINT "Parada_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
