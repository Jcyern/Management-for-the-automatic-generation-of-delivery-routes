# Zonas

## Contrato

- `GET /zona` → `Zona[]`
- `GET /zona/:id` → `Zona`
- `POST /zona` → `Zona` (solo `ADMINISTRADOR`)
- `PUT /zona/:id` → `Zona` (solo `ADMINISTRADOR`)
- `DELETE /zona/:id` → `Zona` (solo `ADMINISTRADOR`)
- `Zona = { id: number, nombre: string }`

## Editar una zona usada

Renombrar está permitido. El `id` no cambia, así que pedidos y rutas
conservan la relación. El nombre se normaliza con `trim`.

## Eliminar una zona usada

- Si la zona no existe: `404`.
- Si tiene pedidos o rutas asociadas: `400`.
- Si no tiene dependencias: se elimina y se devuelve la zona eliminada.

## Caminos

Zona no guarda caminos ni distancias. Esos datos viven en el módulo Grafo
(Neo4j) y se consultan a través de `GrafoService`.

## Frontera

Solo `features/zona/adapters/outbound/prisma/PrismaZonaRepository.ts`
usa `prisma.zona.*`.

Centro y Ruta pueden incluir zonas como parte de sus consultas, pero no
hacen CRUD de Zona.

## Errores

Los errores de dominio mantienen `message` y `error` para el frontend,
y agregan `codigo` y `mensaje`:

```json
{
  "statusCode": 404,
  "message": "Zona 99 no encontrado",
  "error": "Not Found",
  "codigo": "NO_ENCONTRADO",
  "mensaje": "Zona 99 no encontrado",
  "timestamp": "2026-11-25T00:00:00.000Z",
  "path": "/zona/99"
}
```
