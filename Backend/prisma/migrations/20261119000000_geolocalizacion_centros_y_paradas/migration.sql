-- AlterTable
ALTER TABLE "CentroDeDistribucion" ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Parada" ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "distanciaDesdeAnteriorKm" DOUBLE PRECISION,
ADD COLUMN     "tiempoEstimadoMin" INTEGER;

-- AlterTable
ALTER TABLE "Pedido" ALTER COLUMN "idParada" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_idParada_fkey";

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idParada_fkey" FOREIGN KEY ("idParada") REFERENCES "Parada"("id") ON DELETE SET NULL ON UPDATE CASCADE;
