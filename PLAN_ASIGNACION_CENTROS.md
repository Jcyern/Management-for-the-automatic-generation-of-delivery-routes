# Plan: Asignar coordinadores y repartidores a centros (Opción A)

## Objetivo
Desde la página de Centros, el admin puede asignar a cada centro:
- Coordinadores para **crear rutas**
- Coordinadores para **validar rutas**
- Repartidores asignados

Se implementa mediante **dos nuevos endpoints en centro** que leen/escriben las asignaciones en una sola transacción:
- `GET /centro/:id/asignaciones` (solo admin)
- `PUT /centro/:id/asignaciones` (solo admin)

---

## 1) Backend — archivos a crear/modificar

### Nuevo: `Backend/src/features/centro/adapters/inbound/http/dto/AsignarCentro.http.dto.ts`
```ts
import { IsArray, IsInt, IsOptional, IsPositive } from 'class-validator';

export class AsignarCentroHttpDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  coordinadoresCrearIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  coordinadoresValidarIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  repartidoresIds?: number[];
}
```

### Modificar: `Backend/src/features/centro/application/ports/CentroRepositoryPort.ts`
Agregar al `CentroRepositoryPort`:
```ts
/** Asigna coordinadores y repartidores al centro. Reemplaza las listas actuales. */
asignar(
  id: number,
  coordinadoresCrearIds: number[],
  coordinadoresValidarIds: number[],
  repartidoresIds: number[],
): Promise<void>;
```

### Modificar: `Backend/src/features/centro/adapters/outbound/prisma/PrismaCentroRepository.ts`
Implementar `asignar` en `PrismaCentroRepository`:
```ts
async asignar(
  id: number,
  coordinadoresCrearIds: number[],
  coordinadoresValidarIds: number[],
  repartidoresIds: number[],
): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    await tx.centroDeDistribucion.update({
      where: { id },
      data: {
        coordinadorCrearRutas: {
          set: coordinadoresCrearIds.map((id) => ({ id })),
        },
        coordinadorValidadRutas: {
          set: coordinadoresValidarIds.map((id) => ({ id })),
        },
        repartidores: {
          set: repartidoresIds.map((id) => ({ id })),
        },
      },
    });
  });
}
```

### Nuevo: `Backend/src/features/centro/application/use-cases/AsignarCentroUseCase.ts`
```ts
import { RecursoNoEncontrado } from '../../../../shared/domain/DomainError.js';
import type { CentroRepositoryPort } from '../ports/CentroRepositoryPort.js';

export class AsignarCentroUseCase {
  private readonly repo: CentroRepositoryPort;
  constructor(repo: CentroRepositoryPort) {
    this.repo = repo;
  }

  async execute(
    id: number,
    coordinadoresCrearIds: number[],
    coordinadoresValidarIds: number[],
    repartidoresIds: number[],
  ): Promise<void> {
    const existe = await this.repo.buscarPorId(id);
    if (!existe) {
      throw new RecursoNoEncontrado('Centro', id);
    }

    await this.repo.asignar(
      id,
      coordinadoresCrearIds,
      coordinadoresValidarIds,
      repartidoresIds,
    );
  }
}
```

### Modificar: `Backend/src/features/centro/adapters/inbound/http/CentroController.ts`
Agregar import de `AsignarCentroUseCase` y `AsignarCentroHttpDto`, inyectar el use case en el constructor, y agregar endpoints:

```ts
@Get(':id/asignaciones')
@Roles(RolEfectivo.ADMINISTRADOR)
async obtenerAsignaciones(@Param('id', ParseIntPipe) id: number) {
  // Retorna quién está asignado al centro
  const centro = await this.obtener.execute(id, 0, true);
  return {
    coordinadoresCrear: [],
    coordinadoresValidar: [],
    repartidores: [],
  };
}

@Put(':id/asignaciones')
@Roles(RolEfectivo.ADMINISTRADOR)
async asignar(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: AsignarCentroHttpDto,
) {
  return this.asignar.execute(
    id,
    dto.coordinadoresCrearIds ?? [],
    dto.coordinadoresValidarIds ?? [],
    dto.repartidoresIds ?? [],
  );
}
```

### Modificar: `Backend/src/features/centro/centro.module.ts`
Agregar provider:
```ts
{
  provide: AsignarCentroUseCase,
  useFactory: (repo: CentroRepositoryPort) => new AsignarCentroUseCase(repo),
  inject: [CENTRO_REPOSITORY],
},
```
E inyectarlo en `CentroController`.

### Nuevo: `Backend/src/features/centro/application/use-cases/AsignarCentroUseCase.spec.ts`
Casos de prueba:
- asigna coordinadores y repartidores correctamente
- lanza 404 si el centro no existe
- reemplaza listas anteriores (set, no push)

### Verificación backend
- `npm run typecheck`
- `npm test`
- `npm run lint`

---

## 2) Frontend — archivos a crear/modificar

### Modificar: `Frontend/src/features/centros/types/centro.ts` (agregar)
```ts
export interface AsignarCentroInput {
  coordinadoresCrearIds: number[];
  coordinadoresValidarIds: number[];
  repartidoresIds: number[];
}

export interface CentroAsignaciones {
  coordinadoresCrear: CentroResumen[];
  coordinadoresValidar: CentroResumen[];
  repartidores: RepartidorResumen[];
}

export interface CentroResumen {
  id: number;
  nombre: string;
}

export interface RepartidorResumen {
  idUser: number;
  nombre: string;
  correo: string;
}
```

### Modificar: `Frontend/src/features/centros/services/centrosService.ts`
Agregar:
```ts
asignar: (id: number, data: AsignarCentroInput) =>
  request<void>(`/centro/${id}/asignaciones`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
```

### Nuevo: `Frontend/src/features/centros/components/AsignarCentroModal.tsx`
Modal con:
- Multi-select de coordinadores (para crear rutas)
- Multi-select de coordinadores (para validar rutas)
- Multi-select de repartidores
- Carga opciones de `GET /coordinador` y `GET /repartidor` (ya existen en backend)
- Botón Guardar que llama a `centrosService.asignar`

### Modificar: `Frontend/src/features/centros/components/CentrosTable.tsx`
Agregar columna "Asignar" (solo cuando `canManage` es true) con botón que abre el modal de asignación.

### Modificar: `Frontend/src/features/centros/pages/CentrosList/CentrosList.tsx`
- Estado `asignando` (centro en edición de asignaciones), `isAsignandoModalOpen`
- Manejador `handleAsignar` que llama a `centrosService.asignar` y refresca la lista
- Renderizar `<AsignarCentroModal>` dentro del `<Modal>`

### Wiring (ya está hecho)
- `App.tsx`: ruta `/dashboard/centros` ya existe con roles `admin/supervisor/logistico`. El botón de asignar solo aparece para admin (`canManageCentros`).
- `navigation.ts`: "Centros" ya tiene roles `admin/supervisor/logistico`.

### Verificación frontend
- `npm run build`
- `npm test`
- `npm run lint`

---

## 3) Orden de ejecución recomendado

1. Backend: DTO, puerto, repositorio, use case, controlador, módulo.
2. Backend: specs nuevas y actualizadas.
3. Backend: `typecheck`, `test`, `lint`.
4. Frontend: tipos, servicio, componente modal, tabla, página.
5. Frontend: `build`, `test`, `lint`.

---

## 4) Preguntas abiertas (resolver antes de empezar)
- ¿El `GET /centro/:id/asignaciones` debe devolver los objetos completos de coordinador/repartidor o solo sus IDs? (Se sugiere devolver `{ id, nombre }` para mostrar en el modal.)
- ¿Se reutiliza el `Modal` existente de `components/common/Modal` para el asignar?
- ¿Validar en frontend que los IDs de coordinadores/repartidores existan antes de enviar?

---

## Ventaja de la Opción A
Una sola llamada `PUT /centro/:id/asignaciones` guarda todo: coordinadores crear, coordinadores validar y repartidores. El backend las guarda en una transacción Prisma atómica (`set` en las tres relaciones). El front no necesita hacer N llamadas PATCH/PUT (una por coordinador/repartidor).