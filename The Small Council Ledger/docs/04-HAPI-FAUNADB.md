# The Small Council Ledger — Conexión Hapi + FaunaDB

## 1. Dependencia

En `apps/api`:

```bash
npm install fauna
```

Driver oficial para Fauna (v10). Consultar [Fauna JavaScript Driver](https://docs.fauna.com/fauna/current/build/drivers/js-client/) por la API exacta según la versión instalada.

---

## 2. Variable de entorno

Crear en `apps/api/.env` (y documentar en `.env.example`):

```
FAUNA_SECRET=fnAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Obtener el secret en el dashboard de Fauna (API Keys). No subir `.env` al repositorio.

En el código:

```js
const secret = process.env.FAUNA_SECRET;
if (!secret) throw new Error('FAUNA_SECRET is required');
```

---

## 3. Plugin de Hapi para Fauna

Objetivo: crear un único cliente Fauna al arrancar el servidor y exponerlo en `server.app.fauna` para que las rutas y servicios no instancien el cliente en cada request.

**Archivo sugerido:** `apps/api/src/plugins/fauna.js`

Pasos del plugin:

1. En `register(server, options)`:
   - Leer `process.env.FAUNA_SECRET` (o `options.secret`).
   - Instanciar el cliente de Fauna con ese secret.
   - Asignar el cliente a `server.app.fauna`.
2. Opcional: en `request` extension (o en un decorator), exponer `request.fauna = server.app.fauna` para acceso directo en handlers.

Ejemplo de estructura (adaptar a la API real del paquete `fauna`):

```js
// Ejemplo conceptual; revisar API del driver instalado
const { Client } = require('fauna'); // o el import que indique la doc

const plugin = {
  name: 'fauna',
  version: '1.0.0',
  register: async (server, options) => {
    const secret = options.secret || process.env.FAUNA_SECRET;
    if (!secret) throw new Error('FAUNA_SECRET is required for fauna plugin');
    const client = new Client({ secret });
    server.app.fauna = client;
    server.decorate('request', 'fauna', function () {
      return this.server.app.fauna;
    });
  },
};

module.exports = plugin;
```

Registrar el plugin al iniciar Hapi (en `apps/api/src/index.js` o donde montes el servidor):

```js
await server.register(require('./plugins/fauna'));
```

---

## 4. Uso en rutas y servicios

En cualquier handler o servicio que reciba el servidor o el request:

```js
// En un handler de ruta
handler: async (request, h) => {
  const fauna = request.server.app.fauna; // o request.fauna() si usas decorator
  // Ejecutar queries FQL usando fauna.query(...)
  const result = await fauna.query(/* FQL */);
  return h.response(result).code(200);
}
```

Recomendación: no escribir FQL crudo en los handlers. Crear **servicios** en `apps/api/src/services/` (por ejemplo `lordService.js`, `allianceService.js`) que reciban el cliente Fauna (o el `request`) y encapsulen:

- Crear/leer/actualizar/eliminar documentos.
- Uso de índices (Match, Paginate, Get, etc.).

Así las rutas solo validan entrada, llaman al servicio y devuelven la respuesta.

---

## 5. Ejemplo de FQL (referencia)

Con el driver actual de Fauna, las consultas se construyen con FQL. Ejemplos típicos:

- **Crear documento:** `Create(Collection('lords'), { data: { name: 'Eddard', houseId: '...', createdAt: ..., updatedAt: ... } })`
- **Obtener por ID:** `Get(Ref(Collection('lords'), id))`
- **Listar por índice:** `Paginate(Match(Index('lords_by_house'), houseId))` y luego `Map` con `Get` para obtener los documentos.

La sintaxis exacta depende de la versión del driver (v4 vs v10); consultar la documentación oficial de Fauna para el cliente JavaScript actual.

---

## 6. Seguridad

- El secret de Fauna solo debe vivir en el backend (variables de entorno o secret manager).
- No exponer el secret al frontend ni en respuestas API.
- En producción, usar un secret con permisos mínimos necesarios para las colecciones usadas.

---

## 7. Nota sobre Fauna

Fauna ha anunciado fin de servicio para mayo de 2025. Si el proyecto va más allá de esa fecha, valorar migración a otra base (por ejemplo PostgreSQL + Prisma) o alternativas serverless. La arquitectura con plugin Hapi y capa de servicios facilita cambiar el almacenamiento sin tocar las rutas REST.
