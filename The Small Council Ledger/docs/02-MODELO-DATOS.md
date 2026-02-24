# The Small Council Ledger — Modelo de datos (FaunaDB)

## Colecciones

### 1. `houses`

Casas del reino (Stark, Lannister, Targaryen, etc.). Pueden ser documentos semilla creados al desplegar.

| Campo   | Tipo   | Requerido | Descripción |
|---------|--------|-----------|-------------|
| `name`  | string | sí        | Nombre de la casa |
| `sigil` | string | no        | Descripción o URL del emblema |
| `motto` | string | no        | Lema de la casa |
| `powerBase` | number | no     | Puntos base para el Índice de Poder (ej. 80) |
| `removedAlliancesCount` | number | no | Alianzas quitadas (penalización -10 por cada una); por defecto 0 |

**Índices:**

- Por defecto: `Ref` del documento para lookups por ID.

---

### 2. `lords`

Perfiles de Lord/Lady.

| Campo       | Tipo   | Requerido | Descripción |
|------------|--------|-----------|-------------|
| `name`     | string | sí        | Nombre del Lord/Lady |
| `title`    | string | no        | Título (Lord, Lady, etc.) |
| `houseId`  | string | sí        | ID (Ref) de la casa |
| `createdAt` | string | sí       | ISO 8601 |
| `updatedAt` | string | sí       | ISO 8601 |

**Índices en Fauna:**

- `lords_by_house`: términos `["data", "houseId"]` — listar lords por casa.
- Opcional: `lords_by_created`: términos `["data", "createdAt"]` — orden por fecha.

---

### 3. `alliances`

Alianzas entre **casas** (no entre lords).

| Campo          | Tipo   | Requerido | Descripción |
|----------------|--------|-----------|-------------|
| `houseId`      | string | sí        | Ref de una casa |
| `targetHouseId` | string | sí       | Ref de la casa aliada |
| `createdAt`   | string | sí        | ISO 8601 |

**Reglas de negocio:** una alianza es entre dos casas; al eliminarla, ambas casas reciben penalización (-10 en índice de poder). No duplicar la misma pareja de casas.

---

### 4. `betrayals`

Traiciones registradas.

| Campo           | Tipo   | Requerido | Descripción |
|-----------------|--------|-----------|-------------|
| `lordId`        | string | sí        | Lord que traiciona |
| `targetLordId`  | string | sí        | Lord traicionado |
| `houseId`       | string | no        | Casa del lord |
| `targetHouseId` | string | no        | Casa del traicionado |
| `description`   | string | no        | Nota opcional |
| `createdAt`    | string | sí        | ISO 8601 |

**Índices:**

- `betrayals_by_lord`: términos `["data", "lordId"]`.
- `betrayals_by_target_lord`: términos `["data", "targetLordId"]`.

---

## Cálculo del Índice de Poder (por casa)

El índice de poder es de la **casa** (todos los lords de la casa comparten el mismo valor). Fórmula:

```
powerIndex = housePowerBase + (alliancesCount * BONUS_PER_ALLIANCE) - (removedAlliancesCount * PENALTY_PER_REMOVED)
```

Constantes:

- `BONUS_PER_ALLIANCE`: 5 (por cada alianza activa de la casa)
- `PENALTY_PER_REMOVED`: 5 (por cada alianza eliminada; efecto total -10 al quitar una)
- `housePowerBase`: `houses.powerBase` (ej. Stark 80).
- `removedAlliancesCount`: campo en `houses`, se incrementa al eliminar una alianza en la que participaba la casa.

Se expone en `GET /api/lords/:id/power-index` (devuelve el índice de la casa del lord).

---

## Relaciones (refs Fauna)

- `lords.houseId` → `houses` (Ref)
- `alliances.houseId`, `alliances.targetHouseId` → `houses` (Ref)
- `betrayals.lordId`, `betrayals.targetLordId` → `lords` (Ref)

En FQL se usan `Ref` de Fauna; en API REST se pueden enviar/recibir como string (ID del documento).
