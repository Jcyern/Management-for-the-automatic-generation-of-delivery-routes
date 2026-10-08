# 🚀 Guía de Configuración del Proyecto

Guía paso a paso para configurar el entorno de desarrollo.

---

## 📋 Requisitos previos

### 1. Node.js 24 LTS

Verifica tu versión:

```bash
node -v
```

Debe decir `v24.x.x`. Si no, instala `nvm` y luego Node 24:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm alias default 'lts/*'
```

Verifica después: `node -v` → `v24.x.x` y `npm -v` → `11.x.x`

### 2. Sin VPN al trabajar con Neon

El VPN **rompe el SSL** con Neon. Solo se usa VPN para descargar paquetes (ver más abajo).

---

## 🚀 Pasos de instalación

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/Jcyern/Management-for-the-automatic-generation-of-delivery-routes.git
cd Management-for-the-automatic-generation-of-delivery-routes
```

### Paso 2: Configurar npm para redes lentas

```bash
npm config set fetch-timeout 600000
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
```

### Paso 3: Instalar dependencias

```bash
npm install
```

> ⚠️ Puede tardar varios minutos. **No lo interrumpas.**
> Si da error `ETIMEDOUT`, activa VPN temporalmente para esta descarga y luego desactívalo.

### Paso 4: Crear el archivo `.env`

El `.env` **no viene en Git** (por seguridad). Cada uno lo crea en la raíz del proyecto con las credenciales que se comparten **por privado**.

Contenido:

```env
# Conexión para la aplicación (con pooler)
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST-POOLER.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Conexión para migraciones (directa, sin pooler)
DIRECT_URL="postgresql://USUARIO:PASSWORD@HOST.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

> ⚠️ El `.env` va en la **raíz** del proyecto, al mismo nivel que `package.json`.
> ⚠️ **Nunca** lo subas a Git. Ya está en `.gitignore`.

### Paso 5: Generar el cliente de Prisma

```bash
npx prisma generate
```

> Si da error `ETIMEDOUT`, activa VPN temporalmente para este comando.

### Paso 6: Verificar la conexión con Neon

```bash
npx prisma db pull
```

> ⚠️ **SIN VPN.** Este comando sí se conecta a Neon.

Si dice `The introspected database was empty` o `Introspected N models`, ¡todo está bien!

---

## 🌐 Cuándo usar VPN y cuándo NO

| Acción | ¿VPN? |
| :--- | :---: |
| `npm install` | ✅ Sí |
| `npx prisma init` | ✅ Sí |
| `npx prisma generate` | ✅ Sí |
| `npx prisma db pull` | ❌ NO |
| `npx prisma migrate` | ❌ NO |
| Usar `PrismaClient` en código | ❌ NO |

**Regla:** si el comando **descarga** algo → VPN. Si **conecta** a Neon → sin VPN.

---

## 🔧 Herramientas instaladas

| Herramienta | Versión | Tipo | Para qué sirve |
| :--- | :--- | :--- | :--- |
| Node.js | 24 LTS | Sistema | Runtime de JS/TS |
| npm | 11.x | Sistema | Gestor de paquetes |
| TypeScript | 5.9.3 | Dev | Compila `.ts` a `.js` |
| ts-node | 10.9.2 | Dev | Ejecuta `.ts` sin compilar |
| @types/node | 24.19.1 | Dev | Tipos de Node.js |
| prisma | 6.19.3 | Dev | CLI de Prisma |
| @prisma/client | 6.19.3 | Prod | Cliente para la BD |
| dotenv | último | Dev | Lee el `.env` |

---

## 🗄️ ¿Qué es Neon?

[Neon](https://neon.tech) es un servicio de PostgreSQL en la nube, **gratis**, donde vive nuestra base de datos. No hay que instalarlo en la PC, solo conectarse con las credenciales.

- **Base de datos:** `neondb`
- **Región:** Ohio, EE. UU.

---

## ⚠️ Advertencias importantes

1. **No uses VPN** al conectarte a Neon.
2. **No subas el `.env`** a Git.
3. **No compartas credenciales** por GitHub, capturas públicas ni grupos generales. Solo por privado.
4. **No ejecutes `npx prisma migrate dev`** sin avisar al responsable. Las migraciones cambian la estructura para todos.
5. Si tienes errores de red, configura los timeouts de npm (Paso 2).

---

## 📋 Checklist

Antes de empezar a trabajar, verifica:

- [ ] Node.js 24 LTS instalado
- [ ] npm configurado con timeouts largos
- [ ] Dependencias instaladas (`npm install` sin errores)
- [ ] Archivo `.env` creado en la raíz
- [ ] Cliente de Prisma generado (`npx prisma generate`)
- [ ] Conexión a Neon verificada (`npx prisma db pull`)
- [ ] Sin VPN activo al trabajar con la BD

---

## 💬 Problemas comunes

| Error | Causa | Solución |
| :--- | :--- | :--- |
| `ETIMEDOUT` al instalar | Red lenta / bloqueada | Activa VPN temporalmente |
| `password authentication failed` | Credenciales incorrectas | Revisa el `.env` |
| `connection timeout` a Neon | VPN activo | Desactiva el VPN |
| `Environment variable not found` | Falta el `.env` | Crea el `.env` en la raíz |
| Otros errores | — | Avisa al responsable |

---

## 👥 Equipo

- No hagan migraciones :)
