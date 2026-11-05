-- CreateEnum
CREATE TYPE "RolUser" AS ENUM ('COORDINADOR', 'REPARTIDOR');

-- CreateEnum
CREATE TYPE "RolCoordinador" AS ENUM ('SUPERVISOR', 'ADMINISTRADOR', 'LOGISTICO');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('Pendiente', 'Entregado', 'Fallido', 'En_Ruta');

-- CreateEnum
CREATE TYPE "EstadoRuta" AS ENUM ('Pendiente', 'En_Curso', 'Terminada');

-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('Paqueteria', 'Perecederos', 'Documentos', 'Sin_Clasificar');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('Baja', 'Media', 'Urgente');

-- CreateEnum
CREATE TYPE "EstadoParada" AS ENUM ('Pendiente', 'Visitada', 'Fallida');

-- DropForeignKey
ALTER TABLE "CoordinadorLogistico" DROP CONSTRAINT "CoordinadorLogistico_idUser_fkey";

-- DropForeignKey
ALTER TABLE "Logistico" DROP CONSTRAINT "Logistico_id_fkey";

-- DropForeignKey
ALTER TABLE "Parada" DROP CONSTRAINT "Parada_idPedido_fkey";

-- DropForeignKey
ALTER TABLE "Repartidor" DROP CONSTRAINT "Repartidor_flotaID_fkey";

-- DropForeignKey
ALTER TABLE "Repartidor" DROP CONSTRAINT "Repartidor_idUser_fkey";

-- DropForeignKey
ALTER TABLE "Ruta" DROP CONSTRAINT "Ruta_idSupervisor_fkey";

-- DropForeignKey
ALTER TABLE "SupervisorLogistico" DROP CONSTRAINT "SupervisorLogistico_id_fkey";

-- DropForeignKey
ALTER TABLE "_Asignar" DROP CONSTRAINT "_Asignar_A_fkey";

-- DropForeignKey
ALTER TABLE "_Asignar" DROP CONSTRAINT "_Asignar_B_fkey";

-- DropForeignKey
ALTER TABLE "_ConsultaC" DROP CONSTRAINT "_ConsultaC_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConsultaC" DROP CONSTRAINT "_ConsultaC_B_fkey";

-- DropForeignKey
ALTER TABLE "_ConsultaR" DROP CONSTRAINT "_ConsultaR_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConsultaR" DROP CONSTRAINT "_ConsultaR_B_fkey";

-- DropForeignKey
ALTER TABLE "_Crear Rutas" DROP CONSTRAINT "_Crear Rutas_A_fkey";

-- DropForeignKey
ALTER TABLE "_Crear Rutas" DROP CONSTRAINT "_Crear Rutas_B_fkey";

-- DropForeignKey
ALTER TABLE "_Pertence" DROP CONSTRAINT "_Pertence_A_fkey";

-- DropForeignKey
ALTER TABLE "_Pertence" DROP CONSTRAINT "_Pertence_B_fkey";

-- DropForeignKey
ALTER TABLE "_Validar Rutas" DROP CONSTRAINT "_Validar Rutas_A_fkey";

-- DropForeignKey
ALTER TABLE "_Validar Rutas" DROP CONSTRAINT "_Validar Rutas_B_fkey";

-- DropIndex
DROP INDEX "Realizar_repartidorId_key";

-- DropIndex
DROP INDEX "Realizar_vehiculoId_key";

-- DropIndex
DROP INDEX "Reprogramar_idRepartidor_key";

-- AlterTable
ALTER TABLE "CoordinadorLogistico" DROP COLUMN "especialidad",
ADD COLUMN     "especialidad" "RolCoordinador" NOT NULL;

-- AlterTable
ALTER TABLE "Logistico" ADD COLUMN     "nombre" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Parada" DROP COLUMN "idPedido",
DROP COLUMN "estadoEjecucion",
ADD COLUMN     "estadoEjecucion" "EstadoParada";

-- AlterTable
ALTER TABLE "Pedido" DROP COLUMN "fechaCreado",
DROP COLUMN "fechaLimite",
DROP COLUMN "zona",
ADD COLUMN     "fechaEntrega" TIMESTAMP(3),
ADD COLUMN     "fechaPrevista" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idParada" INTEGER NOT NULL,
ADD COLUMN     "idRuta" INTEGER NOT NULL,
ADD COLUMN     "idZona" INTEGER NOT NULL,
DROP COLUMN "prioridad",
ADD COLUMN     "prioridad" "Prioridad" NOT NULL DEFAULT 'Baja',
DROP COLUMN "tipoEntrega",
ADD COLUMN     "tipoEntrega" "TipoPedido" NOT NULL DEFAULT 'Sin_Clasificar',
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoPedido" NOT NULL DEFAULT 'Pendiente';

-- AlterTable
ALTER TABLE "Realizar" DROP CONSTRAINT "Realizar_pkey",
DROP COLUMN "id",
DROP COLUMN "repartidorId",
DROP COLUMN "rutaId",
DROP COLUMN "vehiculoId",
ADD COLUMN     "idRepartidor" INTEGER NOT NULL,
ADD COLUMN     "idRuta" INTEGER NOT NULL,
ADD COLUMN     "idVehiculo" INTEGER NOT NULL,
ADD CONSTRAINT "Realizar_pkey" PRIMARY KEY ("idRuta");

-- AlterTable
ALTER TABLE "Repartidor" DROP COLUMN "flotaID",
ADD COLUMN     "idFlota" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Reporte" DROP COLUMN "idRepartidor",
ADD COLUMN     "EnTiempo" BOOLEAN NOT NULL,
ADD COLUMN     "Entregado" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Reprogramar" DROP COLUMN "idRuta",
ADD COLUMN     "idPedido" INTEGER NOT NULL,
ADD COLUMN     "resultado" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Ruta" DROP COLUMN "idSupervisor",
DROP COLUMN "parametros",
ADD COLUMN     "estado" "EstadoRuta" NOT NULL DEFAULT 'Pendiente',
ADD COLUMN     "fechaRealizacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "idReporte" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SupervisorLogistico" ADD COLUMN     "nombre" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "rol",
ADD COLUMN     "rol" "RolUser" NOT NULL;

-- DropTable
DROP TABLE "_Asignar";

-- DropTable
DROP TABLE "_ConsultaC";

-- DropTable
DROP TABLE "_ConsultaR";

-- DropTable
DROP TABLE "_Crear Rutas";

-- DropTable
DROP TABLE "_Pertence";

-- DropTable
DROP TABLE "_Validar Rutas";

-- DropEnum
DROP TYPE "Estado_Pedido";

-- DropEnum
DROP TYPE "Rol";

-- CreateTable
CREATE TABLE "Administrador" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asignar" (
    "idRuta" INTEGER NOT NULL,
    "idcoordinador" INTEGER NOT NULL,
    "idrepartidor" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asignar_pkey" PRIMARY KEY ("idRuta")
);

-- CreateTable
CREATE TABLE "Validar" (
    "idRuta" INTEGER NOT NULL,
    "idSupervisor" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,
    "aprobadoRechazado" BOOLEAN NOT NULL,

    CONSTRAINT "Validar_pkey" PRIMARY KEY ("idRuta")
);

-- CreateTable
CREATE TABLE "_AsignarCentro" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AsignarCentro_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CrearRutas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CrearRutas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ValidarRutas" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ValidarRutas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ContieneParada" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ContieneParada_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AsignarCentro_B_index" ON "_AsignarCentro"("B");

-- CreateIndex
CREATE INDEX "_CrearRutas_B_index" ON "_CrearRutas"("B");

-- CreateIndex
CREATE INDEX "_ValidarRutas_B_index" ON "_ValidarRutas"("B");

-- CreateIndex
CREATE INDEX "_ContieneParada_B_index" ON "_ContieneParada"("B");

-- AddForeignKey
ALTER TABLE "CoordinadorLogistico" ADD CONSTRAINT "CoordinadorLogistico_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logistico" ADD CONSTRAINT "Logistico_id_fkey" FOREIGN KEY ("id") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorLogistico" ADD CONSTRAINT "SupervisorLogistico_id_fkey" FOREIGN KEY ("id") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrador" ADD CONSTRAINT "Administrador_id_fkey" FOREIGN KEY ("id") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ruta" ADD CONSTRAINT "Ruta_idReporte_fkey" FOREIGN KEY ("idReporte") REFERENCES "Reporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idParada_fkey" FOREIGN KEY ("idParada") REFERENCES "Parada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idRuta_fkey" FOREIGN KEY ("idRuta") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_idZona_fkey" FOREIGN KEY ("idZona") REFERENCES "Zona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repartidor" ADD CONSTRAINT "Repartidor_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repartidor" ADD CONSTRAINT "Repartidor_idFlota_fkey" FOREIGN KEY ("idFlota") REFERENCES "Flota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Realizar" ADD CONSTRAINT "Realizar_idRuta_fkey" FOREIGN KEY ("idRuta") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Realizar" ADD CONSTRAINT "Realizar_idRepartidor_fkey" FOREIGN KEY ("idRepartidor") REFERENCES "Repartidor"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Realizar" ADD CONSTRAINT "Realizar_idVehiculo_fkey" FOREIGN KEY ("idVehiculo") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignar" ADD CONSTRAINT "Asignar_idRuta_fkey" FOREIGN KEY ("idRuta") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignar" ADD CONSTRAINT "Asignar_idcoordinador_fkey" FOREIGN KEY ("idcoordinador") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignar" ADD CONSTRAINT "Asignar_idrepartidor_fkey" FOREIGN KEY ("idrepartidor") REFERENCES "Repartidor"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validar" ADD CONSTRAINT "Validar_idRuta_fkey" FOREIGN KEY ("idRuta") REFERENCES "Ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validar" ADD CONSTRAINT "Validar_idSupervisor_fkey" FOREIGN KEY ("idSupervisor") REFERENCES "SupervisorLogistico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reprogramar" ADD CONSTRAINT "Reprogramar_idCoordinador_fkey" FOREIGN KEY ("idCoordinador") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reprogramar" ADD CONSTRAINT "Reprogramar_idRepartidor_fkey" FOREIGN KEY ("idRepartidor") REFERENCES "Repartidor"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reprogramar" ADD CONSTRAINT "Reprogramar_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AsignarCentro" ADD CONSTRAINT "_AsignarCentro_A_fkey" FOREIGN KEY ("A") REFERENCES "CentroDeDistribucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AsignarCentro" ADD CONSTRAINT "_AsignarCentro_B_fkey" FOREIGN KEY ("B") REFERENCES "Repartidor"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrearRutas" ADD CONSTRAINT "_CrearRutas_A_fkey" FOREIGN KEY ("A") REFERENCES "CentroDeDistribucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrearRutas" ADD CONSTRAINT "_CrearRutas_B_fkey" FOREIGN KEY ("B") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ValidarRutas" ADD CONSTRAINT "_ValidarRutas_A_fkey" FOREIGN KEY ("A") REFERENCES "CentroDeDistribucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ValidarRutas" ADD CONSTRAINT "_ValidarRutas_B_fkey" FOREIGN KEY ("B") REFERENCES "CoordinadorLogistico"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContieneParada" ADD CONSTRAINT "_ContieneParada_A_fkey" FOREIGN KEY ("A") REFERENCES "Parada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContieneParada" ADD CONSTRAINT "_ContieneParada_B_fkey" FOREIGN KEY ("B") REFERENCES "Ruta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

