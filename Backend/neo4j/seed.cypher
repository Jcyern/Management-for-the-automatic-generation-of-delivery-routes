// --- Zonas ---
UNWIND [
  {id: 1, nombre: 'Zona Norte'},
  {id: 2, nombre: 'Zona Sur'},
  {id: 3, nombre: 'Zona Este'},
  {id: 4, nombre: 'Zona Oeste'},
  {id: 5, nombre: 'Zona Centro'},
  {id: 6, nombre: 'Zona Poniente'}
] AS z
MERGE (n:Zona {id: z.id}) SET n.nombre = z.nombre;

// --- Centros de distribucion ---
UNWIND [
  {id: 1, nombre: 'Centro Habana', programaLogistico: 'PL-1'},
  {id: 2, nombre: 'Centro Plaza', programaLogistico: 'PL-2'}
] AS c
MERGE (n:Centro {id: c.id})
SET n.nombre = c.nombre, n.programaLogistico = c.programaLogistico;

// --- Conexiones (vias, sin direccion) ---
UNWIND [
  {a: 1, b: 5, distanciaKm: 5.0, tiempoMin: 12, tipoVia: 'avenida'},
  {a: 5, b: 2, distanciaKm: 6.0, tiempoMin: 15, tipoVia: 'avenida'},
  {a: 1, b: 3, distanciaKm: 8.0, tiempoMin: 20, tipoVia: 'calle'},
  {a: 3, b: 2, distanciaKm: 7.0, tiempoMin: 18, tipoVia: 'calle'},
  {a: 1, b: 4, distanciaKm: 6.0, tiempoMin: 14, tipoVia: 'calle'},
  {a: 4, b: 5, distanciaKm: 5.0, tiempoMin: 12, tipoVia: 'avenida'},
  {a: 5, b: 3, distanciaKm: 4.0, tiempoMin: 10, tipoVia: 'calle'},
  {a: 2, b: 6, distanciaKm: 5.0, tiempoMin: 12, tipoVia: 'avenida'},
  {a: 5, b: 6, distanciaKm: 3.0, tiempoMin: 8, tipoVia: 'avenida'},
  {a: 4, b: 6, distanciaKm: 4.0, tiempoMin: 9, tipoVia: 'calle'}
] AS c
MATCH (a:Zona {id: c.a}), (b:Zona {id: c.b})
MERGE (a)-[r:CONECTA]-(b)
SET r.distanciaKm = c.distanciaKm, r.tiempoMin = c.tiempoMin, r.tipoVia = c.tipoVia;

// --- Cobertura de zonas por centro ---
UNWIND [
  {centro: 1, zona: 1}, {centro: 1, zona: 3}, {centro: 1, zona: 5},
  {centro: 2, zona: 2}, {centro: 2, zona: 4}, {centro: 2, zona: 6}
] AS c
MATCH (ce:Centro {id: c.centro}), (zo:Zona {id: c.zona})
MERGE (ce)-[:CUBRE]->(zo);