/*
  Warnings:

  - Added the required column `especialidad` to the `CoordinadorLogistico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cantidadTotalPedidos` to the `Ruta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idLogistico` to the `Ruta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idSupervisor` to the `Ruta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parametros` to the `Ruta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proporcionPedidosTipoEntrega` to the `Ruta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CoordinadorLogistico" ADD COLUMN     "especialidad" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Ruta" ADD COLUMN     "cantidadTotalPedidos" INTEGER NOT NULL,
ADD COLUMN     "idLogistico" INTEGER NOT NULL,
ADD COLUMN     "idSupervisor" INTEGER NOT NULL,
ADD COLUMN     "parametros" TEXT NOT NULL,
ADD COLUMN     "proporcionPedidosTipoEntrega" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Realizar" (
    "id" SERIAL NOT NULL,
    "repartidorId" INTEGER,
    "vehiculoId" INTEGER,
    "rutaId" INTEGER NOT NULL,

    CONSTRAINT "Realizar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repartidor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "flotaID" INTEGER NOT NULL,

    CONSTRAINT "Repartidor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flota" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Flota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" SERIAL NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "flotaID" INTEGER NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parada" (
    "id" SERIAL NOT NULL,
    "estadoEjecucion" TEXT NOT NULL,

    CONSTRAINT "Parada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "idRepartidor" INTEGER NOT NULL,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reprogramar" (
    "id" SERIAL NOT NULL,
    "idCoordinador" INTEGER NOT NULL,
    "idRepartidor" INTEGER NOT NULL,
    "idRuta" INTEGER NOT NULL,
    "fechaSolicitada" TIMESTAMP(3) NOT NULL,
    "fechaResultado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reprogramar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Crear Rutas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Crear Rutas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Validar Rutas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Validar Rutas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Asignar" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Asignar_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CubrirZonas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CubrirZonas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConsultaC" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConsultaC_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConsultaR" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConsultaR_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Pertence" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Pertence_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Realizar_repartidorId_key" ON "Realizar"("repartidorId");

-- CreateIndex
CREATE UNIQUE INDEX "Realizar_vehiculoId_key" ON "Realizar"("vehiculoId");

-- CreateIndex
CREATE UNIQUE INDEX "Reprogramar_idRepartidor_key" ON "Reprogramar"("idRepartidor");

-- CreateIndex
CREATE INDEX "_Crear Rutas_B_index" ON "_Crear Rutas"("B");

-- CreateIndex
CREATE INDEX "_Validar Rutas_B_index" ON "_Validar Rutas"("B");

-- CreateIndex
CREATE INDEX "_Asignar_B_index" ON "_Asignar"("B");

-- CreateIndex
CREATE INDEX "_CubrirZonas_B_index" ON "_CubrirZonas"("B");

-- CreateIndex
CREATE INDEX "_ConsultaC_B_index" ON "_ConsultaC"("B");

-- CreateIndex
CREATE INDEX "_ConsultaR_B_index" ON "_ConsultaR"("B");

-- CreateIndex
CREATE INDEX "_Pertence_B_index" ON "_Pertence"("B");

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_idLogistico_fkey" FOREIGN KEY ("idLogistico") REFERENCES "Logistico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_idSupervisor_fkey" FOREIGN KEY ("idSupervisor") REFERENCES "SupervisorLogistico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repartidor" ADD CONSTRAINT "Repartidor_flotaID_fkey" FOREIGN KEY ("flotaID") REFERENCES "Flota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_flotaID_fkey" FOREIGN KEY ("flotaID") REFERENCES "Flota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Crear Rutas" ADD CONSTRAINT "_Crear Rutas_A_fkey" FOREIGN KEY ("A") REFERENCES "CentroDeDistribucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Crear Rutas" ADD CONSTRAINT "_Crear Rutas_B_fkey" FOREIGN KEY ("B") REFERENCES "CoordinadorLogistico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Validar Rutas" ADD CONSTRAINT "_Validar Rutas_A_fkey" FOREIGN KEY ("A") REFERENCES "CentroDeDistribucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Validar Rutas" ADD CONSTRAINT "_Validar Rutas_B_fkey" FOREIGN KEY ("B") REFERENCES "CoordinadorLogistico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Asignar" ADD CONSTRAINT "_Asignar_A_fkey" FOREIGN KEY ("A") REFERENCES "CentroDeDistribucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Asignar" ADD CONSTRAINT "_Asignar_B_fkey" FOREIGN KEY ("B") REFERENCES "Repartidor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CubrirZonas" ADD CONSTRAINT "_CubrirZonas_A_fkey" FOREIGN KEY ("A") REFERENCES "Ruta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CubrirZonas" ADD CONSTRAINT "_CubrirZonas_B_fkey" FOREIGN KEY ("B") REFERENCES "Zona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultaC" ADD CONSTRAINT "_ConsultaC_A_fkey" FOREIGN KEY ("A") REFERENCES "CoordinadorLogistico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultaC" ADD CONSTRAINT "_ConsultaC_B_fkey" FOREIGN KEY ("B") REFERENCES "Reporte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultaR" ADD CONSTRAINT "_ConsultaR_A_fkey" FOREIGN KEY ("A") REFERENCES "Repartidor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConsultaR" ADD CONSTRAINT "_ConsultaR_B_fkey" FOREIGN KEY ("B") REFERENCES "Reporte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Pertence" ADD CONSTRAINT "_Pertence_A_fkey" FOREIGN KEY ("A") REFERENCES "Parada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Pertence" ADD CONSTRAINT "_Pertence_B_fkey" FOREIGN KEY ("B") REFERENCES "Ruta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
