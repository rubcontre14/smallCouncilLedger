# The Small Council Ledger — Plan de Arquitectura

## Visión general

Aplicación monorepo para la **gestión de lealtades y traiciones** entre las casas del universo de *Juego de Tronos*. Estilo visual: mapa de Westeros, pergamino quemado y tipografía medieval tallada en piedra.

---

## 1. Propuesta de arquitectura (Frontend / Backend)

### 1.1 Enfoque general

- **Monorepo**: un único repositorio con paquetes `apps/web` (frontend Marko) y `apps/api` (backend Hapi).
- **API REST**: el frontend consume el backend vía HTTP; no SSR con Hapi para Marko en la primera versión (se puede añadir después).
- **FaunaDB**: base de datos serverless; el backend es el único cliente de Fauna (las API keys no se exponen al navegador).

### 1.2 Diagrama de capas

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Marko)                                                │
│  - Rutas/páginas (perfil, casas, alianzas, índice de poder)      │
│  - Componentes reutilizables (LordCard, HouseBadge, etc.)         │
│  - Estilos: pergamino, mapa Westeros, tipografía medieval        │
│  - Llamadas fetch() a la API del backend                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP/REST
┌──────────────────────────────▼──────────────────────────────────┐
│  BACKEND (Hapi.js)                                               │
│  - Rutas REST (lords, houses, alliances, betrayals, power-index) │
│  - Validación (Joi)                                               │
│  - Plugin Fauna: inyección del cliente en request/server          │
│  - Servicios de dominio (cálculo de Índice de Poder)              │
└──────────────────────────────┬──────────────────────────────────┘
                               │ FQL (Fauna Query Language)
┌──────────────────────────────▼──────────────────────────────────┐
│  FAUNADB                                                        │
│  - Colecciones: lords, houses, alliances, betrayals              │
│  - Índices para búsquedas (por casa, por lord, por fecha)         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Decisiones técnicas

| Área        | Decisión | Motivo |
|------------|----------|--------|
| Frontend   | Marko (con Marko Run / Vite) | Ligero, componentes, buen rendimiento y encaja con estética personalizable. |
| Backend    | Hapi.js  | Enfoque en configuración, plugins, validación y seguridad. |
| Base de datos | FaunaDB | Serverless, FQL flexible, adecuado para relaciones y consultas ad hoc. |
| Comunicación | REST JSON | Simple, fácil de documentar y consumir desde Marko. |

---

## 2. Modelo de datos

### 2.1 Entidades principales

#### **House (Casa)**

- Identificador de la casa (Stark, Lannister, Targaryen, Baratheon, Tyrell, Martell, Greyjoy, Arryn, Tully, etc.).
- Se puede almacenar como colección fija o como referencia (por nombre o ID).

| Campo     | Tipo   | Descripción                    |
|----------|--------|--------------------------------|
| `id`     | string | ID del documento (Fauna)       |
| `name`   | string | Nombre de la casa              |
| `sigil`  | string | Descripción o URL del emblema   |
| `motto`  | string | Lema de la casa (opcional)     |

#### **Lord / Lady (Perfil)**

| Campo        | Tipo   | Descripción                          |
|-------------|--------|--------------------------------------|
| `id`        | string | ID del documento                     |
| `name`      | string | Nombre del Lord/Lady                 |
| `title`     | string | Título (Lord, Lady, etc.)             |
| `houseId`   | string | Referencia a la casa elegida         |
| `createdAt` | string (ISO 8601) | Fecha de creación           |
| `updatedAt` | string (ISO 8601) | Fecha de última actualización |

#### **Alliance (Alianza)**

| Campo      | Tipo   | Descripción                                  |
|-----------|--------|----------------------------------------------|
| `id`      | string | ID del documento                             |
| `lordId`  | string | Lord que registra la alianza                  |
| `targetLordId` | string | Lord aliado                          |
| `houseId` | string | Casa del lord (redundante, para consultas)    |
| `targetHouseId` | string | Casa del aliado                      |
| `description` | string | Descripción opcional                  |
| `createdAt` | string | Fecha de registro                     |

#### **Betrayal (Traición)**

| Campo         | Tipo   | Descripción                                |
|--------------|--------|--------------------------------------------|
| `id`         | string | ID del documento                           |
| `lordId`     | string | Lord que registra la traición               |
| `targetLordId` | string | Lord traicionado                        |
| `houseId`    | string | Casa del lord                              |
| `targetHouseId` | string | Casa del traicionado                   |
| `description` | string | Descripción opcional                   |
| `createdAt`  | string | Fecha de registro                           |

### 2.2 Índice de Poder (cálculo)

- **Fórmula (propuesta)**:
  - Base por casa (valor fijo por casa, ej. Stark = 80, Lannister = 85).
  - Bonificación por alianzas: +N puntos por cada alianza activa (ej. +5 cada una).
  - Penalización por traiciones: -M puntos por cada traición registrada (ej. -10 cada una).
  - Opcional: factor temporal (alianzas/traiciones recientes pesan más).

- **Persistencia**: puede calcularse on-demand en el backend y devolverse en el endpoint de perfil o en un endpoint dedicado (`GET /lords/:id/power-index`), sin necesidad de guardar el índice en Fauna si se prefiere siempre valor actualizado.

### 2.3 Colecciones e índices en FaunaDB

- **Colecciones**: `houses`, `lords`, `alliances`, `betrayals`.
- **Índices sugeridos**:
  - `lords_by_house`: términos `houseId` para listar lords por casa.
  - `alliances_by_lord`: términos `lordId` (y opcionalmente `createdAt`).
  - `alliances_by_target_lord**: términos `targetLordId`.
  - `betrayals_by_lord`: términos `lordId`.
  - `betrayals_by_target_lord`: términos `targetLordId`.

---

## 3. Estructura de carpetas (monorepo)

```
The Small Council Ledger/
├── apps/
│   ├── web/                    # Frontend Marko
│   │   ├── src/
│   │   │   ├── components/     # Componentes Marko reutilizables
│   │   │   ├── routes/         # Páginas (file-based routing si usas Marko Run)
│   │   │   ├── assets/         # Imágenes, fuentes, mapa de Westeros
│   │   │   └── styles/         # CSS (pergamino, tipografía medieval)
│   │   ├── package.json
│   │   └── marko.config.json
│   │
│   └── api/                    # Backend Hapi
│       ├── src/
│       │   ├── plugins/        # Plugin de Fauna, auth si aplica
│       │   ├── routes/         # Definición de rutas REST
│       │   ├── services/       # Lógica de negocio (PowerIndex, etc.)
│       │   ├── lib/            # Cliente Fauna, utilidades
│       │   └── index.js        # Entrada del servidor
│       ├── package.json
│       └── .env.example
│
├── docs/                       # Documentación del proyecto
│   ├── 01-PLAN-ARQUITECTURA.md
│   ├── 02-MODELO-DATOS.md
│   ├── 03-ENDPOINTS-REST.md
│   └── 04-HAPI-FAUNADB.md
│
├── Notas IA/                   # Prompts y notas de diseño con IA
│   └── 2025-02-23-prompt-inicial.md
│
├── package.json                # Workspace root (npm workspaces o pnpm)
└── README.md
```

---

## 4. Endpoints REST

Base URL sugerida: `http://localhost:3000/api` (o variable de entorno `API_BASE_URL`).

### 4.1 Casas (Houses)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/houses` | Listar todas las casas |
| GET | `/houses/:id` | Obtener una casa por ID |

### 4.2 Lords / Ladies

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/lords` | Listar lords (query: `?houseId=xxx`) |
| GET | `/lords/:id` | Obtener perfil de un lord |
| POST | `/lords` | Crear perfil (body: name, title, houseId) |
| PATCH | `/lords/:id` | Actualizar perfil |
| DELETE | `/lords/:id` | Eliminar perfil (y opcionalmente sus alianzas/traiciones) |

### 4.3 Alianzas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/lords/:lordId/alliances` | Alianzas de un lord |
| POST | `/alliances` | Registrar alianza (lordId, targetLordId, description?) |

### 4.4 Traiciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/lords/:lordId/betrayals` | Traiciones de un lord |
| POST | `/betrayals` | Registrar traición (lordId, targetLordId, description?) |

### 4.5 Índice de Poder

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/lords/:id/power-index` | Obtener el índice de poder calculado del lord |

Respuesta sugerida: `{ lordId, powerIndex, breakdown: { base, alliancesBonus, betrayalsPenalty } }`.

---

## 5. Conexión Hapi + FaunaDB

### 5.1 Enfoque recomendado: plugin de Hapi

1. **Dependencia**: `fauna` (driver oficial actual para Fauna v10).
2. **Plugin** (`apps/api/src/plugins/fauna.js`):
   - Registrar un plugin que cree el cliente Fauna con el secret desde `process.env.FAUNA_SECRET` (o `FAUNA_KEY`).
   - Exponer el cliente en `server.app.fauna` y/o en `request.server.app.fauna` para que las rutas lo usen sin instanciarlo en cada request.
3. **Inicialización**: al arrancar Hapi, registrar el plugin antes de las rutas que lo usen.
4. **Seguridad**: nunca exponer el secret al frontend; todas las operaciones pasan por el backend.

### 5.2 Uso en rutas

- En cada handler: `const fauna = request.server.app.fauna`.
- Ejecutar FQL con `fauna.query(...)` (o el método equivalente del driver actual).
- Crear helpers o servicios en `services/` que reciban el cliente y encapsulen las queries (CRUD lords, alliances, betrayals, power index).

### 5.3 Documento detallado

La guía paso a paso (creación del plugin, variables de entorno, ejemplo de FQL para una colección) se detalla en `docs/04-HAPI-FAUNADB.md`.

---

## 6. Documentación y Notas IA

- **Documentación**: en `docs/` se guardan los documentos del plan (este archivo), modelo de datos, endpoints y Hapi+FaunaDB.
- **Notas IA**: en `Notas IA/` se guarda cada prompt relevante con fecha y título (por ejemplo `2025-02-23-prompt-inicial.md`) para trazabilidad y futuras iteraciones.

---

## Próximos pasos (cuando desees generar código)

1. Inicializar monorepo (npm/pnpm workspaces).
2. Crear `apps/api` con Hapi, plugin Fauna y rutas REST.
3. Crear `apps/web` con Marko (Marko Run o Vite), páginas y componentes.
4. Definir estilos (pergamino, mapa de Westeros, tipografía medieval).
5. Implementar cálculo del Índice de Poder en el backend.
6. Conectar frontend a la API y poblar datos de ejemplo (casas, lords, alianzas, traiciones).

---

*Documento generado como parte del plan de arquitectura para The Small Council Ledger. Versión: 1.0.*
