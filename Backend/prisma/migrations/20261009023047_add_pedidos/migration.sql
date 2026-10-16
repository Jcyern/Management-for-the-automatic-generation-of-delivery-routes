-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "prioridad" TEXT NOT NULL,
    "tipoEntrega" TEXT NOT NULL,
    "zona" TEXT NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);
