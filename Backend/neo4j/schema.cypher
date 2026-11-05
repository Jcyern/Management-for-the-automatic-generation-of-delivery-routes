// Unicidad de identificadores (alineados con los id de Prisma)
CREATE CONSTRAINT zona_id IF NOT EXISTS
FOR (z:Zona) REQUIRE z.id IS UNIQUE;

CREATE CONSTRAINT centro_id IF NOT EXISTS
FOR (c:Centro) REQUIRE c.id IS UNIQUE;

// Índices de apoyo para búsquedas por nombre
CREATE INDEX zona_nombre IF NOT EXISTS
FOR (z:Zona) ON (z.nombre);

CREATE INDEX centro_nombre IF NOT EXISTS
FOR (c:Centro) ON (c.nombre);