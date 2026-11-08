# Seed de flotas y usuarios

Este documento explica cómo funciona el seed del proyecto y cómo agregar flotas, coordinadores y repartidores sin romper la base de datos.

## 1. Qué hace el seed

El seed es el encargado de crear datos iniciales en PostgreSQL:

- Crea flotas.
- Crea usuarios.
- Crea el perfil de coordinador (`Administrador`, `Logistico` o `SupervisorLogistico`).
- Crea el perfil de repartidor y lo enlaza con una flota.

El seed es **idempotente**:

- Una flota no se duplica si ya existe un registro con el mismo nombre.
- Un usuario no se duplica si ya existe un registro con el mismo correo.

Si el dato ya existe, el seed imprime `[omitido]` y continúa.

## 2. Orden de ejecución

El archivo `prisma/seed.ts` ejecuta primero las flotas y después los usuarios:

```ts
async function main() {
  await CreateFlota(prisma);
  await CreateUsuarios(prisma);
}
```

Este orden es obligatorio porque un repartidor necesita que su flota exista antes de crearse.

## 3. Estructura de archivos

```text
Backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── seed/
│       ├── client.ts
│       ├── createRows.ts
│       ├── tipos.ts
│       └── data/
│           └── datos.ts
└── src/
    └── common/
        └── text.ts
```

Responsabilidad de cada archivo:

| Archivo | Responsabilidad |
|---|---|
| `prisma/seed.ts` | Punto de entrada. Llama a las funciones del seed. |
| `prisma/seed/client.ts` | Crea el `PrismaClient` compartido. |
| `prisma/seed/createRows.ts` | Lógica para crear flotas, usuarios y perfiles. |
| `prisma/seed/tipos.ts` | Tipos de los datos del seed. |
| `prisma/seed/data/datos.ts` | Datos que se van a insertar. |
| `src/common/text.ts` | Función `capitalizeCase` para normalizar nombres. |

## 4. Cómo ejecutar el seed

Desde la carpeta `Backend`:

```bash
npx prisma db seed
```

También funciona:

```bash
npm run seed:admin
```

Ambos comandos ejecutan:

```text
tsx prisma/seed.ts
```

Antes de ejecutarlo, el archivo `.env` debe tener:

```env
DATABASE_URL="..."
DIRECT_URL="..."
```

## 5. Datos actuales

En `prisma/seed/data/datos.ts` están los datos del seed.

Flotas actuales:

```ts
export const flotas: string[] = [
  'Lisa',
  'Habana del Este',
  'Cerro',
];
```

Usuarios actuales:

| Correo | Rol | Perfil |
|---|---|---|
| `admin@deliveryroutes.com` | `COORDINADOR` | `ADMINISTRADOR` |
| `logic@deliveryroutes.com` | `COORDINADOR` | `LOGISTICO` |
| `superv@deliveryroutes.com` | `COORDINADOR` | `SUPERVISOR` |
| `repartidor@deliveryroutes.com` | `REPARTIDOR` | Repartidor en flota `Cerro` |

Las contraseñas del archivo están en texto plano, pero el seed las guarda hasheadas con bcrypt. No se debe poner un hash directamente en `password`.

## 6. Cómo agregar una flota

1. Abrir `prisma/seed/data/datos.ts`.
2. Agregar el nombre al arreglo `flotas`.
3. Ejecutar el seed.

Ejemplo:

```ts
export const flotas: string[] = [
  'Lisa',
  'Habana del Este',
  'Cerro',
  'Playa',
];
```

El seed normaliza el nombre con `capitalizeCase`, así que:

```text
'PLAYA'            -> 'Playa'
'HABAna del ESTe'  -> 'Habana Del Este'
```

La búsqueda de duplicados no distingue mayúsculas de minúsculas.

## 7. Cómo agregar un coordinador

Agregar un objeto al arreglo `usuarios` con:

- `email`
- `password` en texto plano
- `nombre`
- `roluser: 'COORDINADOR'`
- `rol`: `'ADMINISTRADOR'`, `'LOGISTICO'` o `'SUPERVISOR'`

Ejemplo:

```ts
{
  email: 'coordinador2@deliveryroutes.com',
  password: 'Coordinador123!',
  nombre: 'Carlos Pérez',
  roluser: 'COORDINADOR',
  rol: 'LOGISTICO',
},
```

El seed crea automáticamente:

```text
Usuario
  -> CoordinadorLogistico
      -> Logistico
```

Si el rol es `ADMINISTRADOR`, crea `Administrador`.

Si el rol es `SUPERVISOR`, crea `SupervisorLogistico`.

## 8. Cómo agregar un repartidor

Un repartidor necesita una flota existente.

1. Agregar la flota al arreglo `flotas`.
2. Agregar el usuario con `roluser: 'REPARTIDOR'`.
3. Usar el nombre de la flota en el campo `flota`, no un `idFlota`.
4. Ejecutar el seed.

Ejemplo:

```ts
{
  email: 'repartidor2@deliveryroutes.com',
  password: 'Repartidor123!',
  nombre: 'Miguel Torres',
  roluser: 'REPARTIDOR',
  edad: 28,
  flota: 'Playa',
},
```

El seed hace esta búsqueda:

```ts
const flota = await tx.flota.findFirst({
  where: {
    nombre: {
      equals: capitalizeCase(datos.flota),
      mode: 'insensitive',
    },
  },
});
```

Luego crea el repartidor con el id real de la flota:

```ts
await tx.repartidor.create({
  data: {
    idUser: iduser,
    idFlota: flota.id,
    nombre: datos.nombre,
    edad: datos.edad,
  },
});
```

Si la flota no existe, el seed lanza un error y no crea ese repartidor.

## 9. Reglas de roles

No mezclar estos dos conceptos:

```text
Usuario.rol
  COORDINADOR
  REPARTIDOR

CoordinadorLogistico.especialidad
  ADMINISTRADOR
  LOGISTICO
  SUPERVISOR
```

Un coordinador siempre tiene:

```ts
roluser: 'COORDINADOR'
rol: 'ADMINISTRADOR' | 'LOGISTICO' | 'SUPERVISOR'
```

Un repartidor siempre tiene:

```ts
roluser: 'REPARTIDOR'
edad: number
flota: string
```

## 10. Contraseñas

El seed nunca guarda la contraseña original.

```ts
password: await hash(datos.password, BCRYPT_ROUNDS)
```

Se usa bcrypt con 12 rondas.

En la base de datos se ve algo así:

```text
$2b$12$...
```

Importante:

- En `datos.ts` se escribe la contraseña en texto plano.
- No se debe escribir un hash en `password`.
- Si el usuario ya existe, el seed lo omite y no actualiza su contraseña.
- Para cambiar la contraseña de un usuario existente, hay que borrarlo y volver a ejecutar el seed, o actualizarlo manualmente.

## 11. Capitalize

La función está en `src/common/text.ts`:

```ts
export function capitalizeCase(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/\S+/g, (palabra) => {
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    });
}
```

Ejemplos:

```ts
capitalizeCase('LISA');            // 'Lisa'
capitalizeCase('HABAna del ESTe'); // 'Habana Del Este'
capitalizeCase('  ana   maría  '); // 'Ana   María'
```

Uso actual:

- En `CreateFlota`, para normalizar el nombre de cada flota.
- En `createRepartidor`, para buscar la flota por nombre.

En este momento no existe un decorador de NestJS para DTOs. Si más adelante se quiere usar en peticiones HTTP, se puede crear un decorador con `@Transform` de `class-transformer` y aplicar `capitalizeCase`.

## 12. Cómo verificar los datos

Opción visual:

```bash
npx prisma studio
```

Tablas importantes:

- `Usuario`
- `CoordinadorLogistico`
- `Repartidor`
- `Logistico`
- `SupervisorLogistico`
- `Administrador`
- `Flota`

Verificar que el repartidor tenga un `idFlota` que exista en `Flota`.

## 13. Comandos útiles

```bash
# Ejecutar seed
npx prisma db seed

# Abrir Prisma Studio
npx prisma studio

# Verificar TypeScript
npm run typecheck

# Verificar lint
npm run lint

# Ejecutar tests
npm test

# Reset completo de la base de desarrollo
npx prisma migrate reset
```
