# AGENTS.md

## Estructura del repositorio

- `Backend/` — NestJS (v12, ESM, TypeScript). Prisma + Neo4j + grafo de rutas.
- `Frontend/` — Vite + React + TypeScript (sin scripts útiles definidos).
- `prisma/` no existe en la raíz; todo está en `Backend/prisma/`.
- `.env` en la raíz tiene credenciales reales de Neon (no subir; está en `.gitignore`).
- `Backend/.env.example` es la plantilla segura.

## Comandos principales

**Backend (`Backend/`):**
- `npm run start:dev` — levantar servidor NestJS en modo watch
- `npm run build` — compilar producción
- `npm run lint` — oxlint con reglas type-aware
- `npm run test` — vitest (unitarios)
- `npm run test:e2e` — pruebas e2e
- `npm run seed:neo4j` — cargar esquema y datos iniciales en Neo4j

**Prisma (desde `Backend/`):**
- `npx prisma migrate make <nombre>` — crear nueva migración
- `npx prisma migrate deploy` — aplicar migraciones pendientes
- `npx prisma generate` — regenerar cliente Prisma (output: `Backend/generated/prisma`)

**Neo4j (Docker):**
- `docker compose up -d neo4j` — levantar Neo4j 5.26 con APOC
- `node Backend/neo4j/seed.mjs` — aplicar `schema.cypher` + `seed.cypher`

## Conexiones y variables de entorno

- Postgres (Neon): `DATABASE_URL` (pooler) + `DIRECT_URL` (directo) en `.env` raíz
- Neo4j: `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`, `NEO4J_DATABASE` en `Backend/.env`
- `docker-compose.yml` solo levanta Neo4j, no Postgres

## Modelo de datos

- **Prisma (Postgres):** `Usuario`, `Repartidor`, `CoordinadorLogistico`, `Logistico`, `SupervisorLogistico`, `Pedido`, `CentroDeDistribucion`, `Zona`, `Ruta`, `Parada`, `Flota`, `Vehiculo`, `Reporte`, `Reprogramar`, `Realizar` (relación ternaria Vehiculo-Repartidor-Ruta)
- **Neo4j:** Nodos `Zona` y `Centro`; relaciones `CONECTA` (con distancia/tiempo) y `CUBRE`. IDs alineados con Prisma.
- Endpoints grafo: `GET /grafo/zonas/:origenId/camino-mas-corto`, `GET /grafo/zonas/:origenId/rutas-alternativas`

## Convención de commits

Siempre dos versiones: primero **español** (para leer/verificar), luego **inglés** (para el push a GitHub).

```
feat: título en español
description en español

feat: title in English
description in English
```

## Ramas

- `Base-de-Datos` — rama de trabajo principal (protegida en remoto)
- Otras ramas: `Adrián`, `Alejandro`, `Backend`, `frontend`, `main`

## Gotchas

- `.env` de la raíz tiene credenciales reales de Neon; nunca commitear.
- `agent.md` (sin S) está en `.gitignore`; `AGENTS.md` no.
- Prisma cliente genera en `Backend/generated/prisma` (ignorado en `.gitignore`).
- Neo4j requiere plugin APOC para los endpoints de camino más corto y rutas alternativas.
- Prisma está en v6.19.3; `prisma.config.ts` fue eliminado por incompatibilidad con esta versión.
- Node modules de `Frontend/` y `Backend/` son independientes (`npm install` en cada uno).
