# Configuración de FaunaDB para The Small Council Ledger

## Opción: Store local (sin Fauna, sin dashboard)

Si **no puedes acceder a [dashboard.fauna.com](https://dashboard.fauna.com)** o prefieres trabajar sin cuenta en la nube:

1. **No definas** `FAUNA_SECRET` en `apps/api/.env` (o no crees `.env`).
2. Arranca la API con `npm run dev` en `apps/api`. La API usará automáticamente un **store local** (en memoria con persistencia opcional en `apps/api/data/local-store.json`).
3. Las **casas** (Stark, Lannister, Targaryen, etc.) vienen ya precargadas en el store local.

Para forzar el store local aunque tengas `FAUNA_SECRET` definido, añade en `.env`:

```env
USE_LOCAL_STORE=true
```

Variables opcionales del store local:

| Variable | Descripción |
|----------|-------------|
| `LOCAL_STORE_PERSIST` | `0` o `false` para solo memoria (no guardar en archivo). Por defecto se persiste. |
| `LOCAL_STORE_FILE` | Ruta del archivo JSON (por defecto `data/local-store.json` dentro de `apps/api`). |

---

## FaunaDB en la nube (dashboard.fauna.com)

### 1. Crear base de datos

1. Entra en [Fauna Dashboard](https://dashboard.fauna.com).
2. Crea una base de datos (por ejemplo `small-council-ledger`).

## 2. Crear colecciones

En la pestaña **Collections**, crea estas colecciones (sin índices adicionales por ahora):

- `houses`
- `lords`
- `alliances`
- `betrayals`

## 3. Crear índices

En **Indexes**, crea:

| Nombre               | Colección  | Terms (Field)   |
|----------------------|------------|------------------|
| `lords_by_house`     | lords      | `data.houseId`   |
| `alliances_by_lord`  | alliances  | `data.lordId`   |
| `betrayals_by_lord`  | betrayals  | `data.lordId`   |

En Fauna v4 (Dashboard clásico): al crear el índice, en "Terms" añade el campo que indexar (p. ej. `data.houseId` para `lords_by_house`).

## 4. API Key

En **Security** > **Keys**, crea una clave con rol de administrador (o el rol que tenga permisos de lectura/escritura en las colecciones anteriores). Copia el **secret** y úsalo en `apps/api/.env` como `FAUNA_SECRET`.

## 5. Datos iniciales (opcional)

Puedes insertar casas desde el **Shell** de Fauna en el Dashboard. Ejemplo (adaptar a la API del Shell):

```javascript
// Ejemplo conceptual en FQL (Shell de Fauna)
Create(Collection("houses"), {
  data: {
    name: "Stark",
    motto: "Winter is Coming",
    powerBase: 80
  }
});
Create(Collection("houses"), {
  data: {
    name: "Lannister",
    motto: "Hear Me Roar",
    powerBase: 85
  }
});
```

O ejecutar el script de seed (ver más abajo) una vez tengas `FAUNA_SECRET` en `.env`.

## 6. Scripts de seed (Node)

Desde `apps/api`:

**Casas** (ejecutar primero):

```bash
node scripts/seed-houses.js
```

Crea las casas básicas (Stark, Lannister, Targaryen, etc.). Requiere `FAUNA_SECRET` en `.env`.

**Lords / Ladies** (ejecutar después de tener casas):

```bash
node scripts/seed-lords.js
```

Crea lords de ejemplo (Eddard Stark, Tywin Lannister, Daenerys Targaryen, etc.) asociados a las casas ya creadas. Requiere tener casas en Fauna (ej. haber ejecutado antes `seed-houses.js`).
