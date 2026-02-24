# The Small Council Ledger

Sistema de gestión de lealtades y traiciones entre las casas del universo de *Juego de Tronos*.

## Stack

- **Frontend:** Marko  
- **Backend:** Node.js con Hapi  
- **Base de datos:** FaunaDB  
- **Estilo:** Mapa de Westeros, pergamino quemado, tipografía medieval tallada en piedra  

---

## Requisitos previos

- **Node.js** 18, 20 o 22 (recomendado LTS).
- **npm** (viene con Node.js) o **pnpm** si usas workspaces.
- Cuenta en [Fauna](https://fauna.com) para obtener la API key (secret).

Comprobar versiones en tu equipo:

```bash
node -v   # debe ser v18+
npm -v
```

---

## Librerías a instalar

### En la raíz del monorepo (workspace)

Si el proyecto usa workspaces, desde la raíz:

```bash
npm install
```

Esto instalará las dependencias de `apps/web` y `apps/api` según estén definidas en cada `package.json`.

### Backend (apps/api)

Librerías necesarias en `apps/api/package.json`:

| Paquete | Uso |
|---------|-----|
| `@hapi/hapi` | Servidor HTTP y rutas REST |
| `@hapi/joi` | Validación de payloads |
| `faunadb` | Cliente FaunaDB (FQL v4) |

Instalación manual (si no usas workspace):

```bash
cd apps/api
npm install @hapi/hapi @hapi/joi faunadb
```

### Frontend (apps/web)

Librerías necesarias en `apps/web/package.json`:

| Paquete | Uso |
|---------|-----|
| `marko` | Framework de componentes y templates |
| `@marko/run` | Servidor de desarrollo (Vite + Marko Run) |

Instalación manual (si no usas workspace):

```bash
cd apps/web
npm install marko @marko/run
```

---

## Pasos para poner el proyecto en marcha

### 1. Clonar o descargar el repositorio

```bash
git clone <url-del-repositorio> "The Small Council Ledger"
cd "The Small Council Ledger"
```

### 2. Instalar dependencias

Desde la raíz del proyecto (monorepo):

```bash
npm install
```

O por aplicación:

```bash
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..
```

### 3. Base de datos: local o FaunaDB

**Opción A — Store local (recomendado si no puedes usar Fauna):**

- No crees `.env` en `apps/api` (o no definas `FAUNA_SECRET`).
- Al arrancar la API se usará un **store local** (memoria + archivo `apps/api/data/local-store.json`).
- Las casas (Stark, Lannister, Targaryen, etc.) vienen precargadas. No hace falta configurar nada más.

**Opción B — FaunaDB en la nube** (requiere [dashboard.fauna.com](https://dashboard.fauna.com)):

1. Crear base de datos, colecciones e índices (ver `apps/api/FAUNA-SETUP.md`).
2. Crear una API Key y copiar el secret.
3. En `apps/api`: `copy .env.example .env` (Windows) o `cp .env.example .env` (Linux/Mac).
4. Editar `.env` y definir `FAUNA_SECRET=fnAExxxxxxxxx...`
5. (Opcional) `node scripts/seed-houses.js` para poblar casas.

Para **forzar store local** aunque tengas `FAUNA_SECRET`, añade en `.env`: `USE_LOCAL_STORE=true`.

### 4. Arrancar el backend (API)

```bash
cd apps/api
npm run dev
```

Por defecto la API queda en `http://localhost:3000`. Si ves **EADDRINUSE: address already in use 0.0.0.0:3000**, el puerto está ocupado (p. ej. por una instancia anterior). Opciones: cerrar ese proceso (en Windows: `netstat -ano | findstr :3000` para ver el PID, luego `taskkill /PID <número> /F`) o usar otro puerto: `$env:PORT=3001; npm run dev` (y en el frontend, si aplica, `VITE_API_URL=http://localhost:3001`).

### 5. Arrancar el frontend (web)

En otra terminal:

```bash
cd apps/web
npm run dev
```

El frontend suele estar en `http://localhost:8080` o el puerto que indique la plantilla de Marko.

### 6. Usar la aplicación

- Abrir en el navegador la URL del frontend (ej. `http://localhost:8080`).
- Asegurarse de que la variable de entorno del frontend (si existe) apunte a la URL del API, por ejemplo `VITE_API_URL=http://localhost:3000/api` o la que use el proyecto.

---

## Resumen de comandos

| Acción | Comando (desde raíz) |
|--------|----------------------|
| Instalar todo | `npm install` |
| Solo API | `cd apps/api && npm install && npm run dev` |
| Solo Web | `cd apps/web && npm install && npm run dev` |
| Ejecutar todo (si hay script en root) | `npm run dev` (si está definido en el monorepo) |

---

## Documentación del plan

El plan de arquitectura está en la carpeta `docs/`:

| Documento | Contenido |
|-----------|------------|
| [01-PLAN-ARQUITECTURA.md](docs/01-PLAN-ARQUITECTURA.md) | Arquitectura frontend/backend, diagrama de capas, decisiones técnicas |
| [02-MODELO-DATOS.md](docs/02-MODELO-DATOS.md) | Modelo de datos (houses, lords, alliances, betrayals) e índices FaunaDB |
| [03-ENDPOINTS-REST.md](docs/03-ENDPOINTS-REST.md) | Especificación de endpoints REST |
| [04-HAPI-FAUNADB.md](docs/04-HAPI-FAUNADB.md) | Conexión Hapi + FaunaDB (plugin, variables de entorno, uso) |
| [05-STORE-LOCAL.md](docs/05-STORE-LOCAL.md) | Store local (uso sin Fauna, en memoria y/o archivo JSON) |

## Estructura prevista (monorepo)

```
apps/
  web/     → Frontend Marko
  api/     → Backend Hapi
docs/      → Documentación
Notas IA/  → Prompts y notas de diseño con IA
```

## Funcionalidades principales

- Crear perfil de Lord/Lady  
- Elegir casa (Stark, Lannister, Targaryen, Baratheon, etc.)  
- Registrar alianzas o traiciones  
- Calcular automáticamente un Índice de Poder  
- Persistir datos en FaunaDB  

---

*El código de la aplicación se generará en una siguiente fase; este repositorio contiene primero el plan y la documentación.*
