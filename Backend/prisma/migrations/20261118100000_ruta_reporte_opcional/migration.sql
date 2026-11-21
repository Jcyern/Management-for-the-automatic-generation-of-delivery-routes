-- DropForeignKey
ALTER TABLE "Ruta" DROP CONSTRAINT "Ruta_idReporte_fkey";

-- AlterTable
ALTER TABLE "Ruta" ALTER COLUMN "idReporte" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_idReporte_fkey" FOREIGN KEY ("idReporte") REFERENCES "Reporte"("id") ON DELETE SET NULL ON UPDATE CASCADE;
