# The Small Council Ledger — Endpoints REST

Base URL: `http://localhost:3000/api` (configurable vía `API_BASE_URL`).

Formato: JSON. Códigos HTTP estándar (200, 201, 400, 404, 500).

---

## Houses (Casas)

### GET /houses

Lista todas las casas.

**Respuesta 200:**

```json
[
  { "id": "...", "name": "Stark", "sigil": "...", "motto": "Winter is Coming", "powerBase": 80 },
  { "id": "...", "name": "Lannister", "sigil": "...", "motto": "Hear Me Roar", "powerBase": 85 }
]
```

### GET /houses/:id

Obtiene una casa por ID.

**Respuesta 200:** objeto casa. **404** si no existe.

---

## Lords (Perfiles Lord/Lady)

### GET /lords

Lista lords. Query opcional: `houseId` para filtrar por casa.

**Respuesta 200:**

```json
[
  { "id": "...", "name": "Eddard", "title": "Lord", "houseId": "...", "createdAt": "...", "updatedAt": "..." }
]
```

### GET /lords/:id

Obtiene un lord por ID.

**Respuesta 200:** objeto lord. **404** si no existe.

### POST /lords

Crea un perfil de Lord/Lady.

**Body:**

```json
{
  "name": "string (requerido)",
  "title": "string (opcional)",
  "houseId": "string (requerido)"
}
```

**Respuesta 201:** lord creado con `id`, `createdAt`, `updatedAt`.

### PATCH /lords/:id

Actualiza un lord (campos enviados se reemplazan).

**Body:** parcial (name, title, houseId).

**Respuesta 200:** lord actualizado. **404** si no existe.

### DELETE /lords/:id

Elimina un lord. Opcional: eliminar o anular alianzas/traiciones asociadas (definir en implementación).

**Respuesta 204** sin cuerpo. **404** si no existe.

---

## Alianzas

### GET /lords/:lordId/alliances

Lista alianzas del lord.

**Respuesta 200:**

```json
[
  { "id": "...", "lordId": "...", "targetLordId": "...", "description": "...", "createdAt": "..." }
]
```

### POST /alliances

Registra una alianza.

**Body:**

```json
{
  "lordId": "string (requerido)",
  "targetLordId": "string (requerido)",
  "description": "string (opcional)"
}
```

**Respuesta 201:** alianza creada. **400** si validación falla o si la alianza duplicada no está permitida.

---

## Traiciones

### GET /lords/:lordId/betrayals

Lista traiciones del lord.

**Respuesta 200:** array de objetos traición.

### POST /betrayals

Registra una traición.

**Body:**

```json
{
  "lordId": "string (requerido)",
  "targetLordId": "string (requerido)",
  "description": "string (opcional)"
}
```

**Respuesta 201:** traición creada.

---

## Índice de Poder

### GET /lords/:id/power-index

Calcula y devuelve el índice de poder del lord.

**Respuesta 200:**

```json
{
  "lordId": "...",
  "powerIndex": 95,
  "breakdown": {
    "base": 80,
    "alliancesBonus": 15,
    "betrayalsPenalty": 0
  }
}
```

**404** si el lord no existe.

---

## Resumen rápido

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /houses | Listar casas |
| GET | /houses/:id | Obtener casa |
| GET | /lords | Listar lords (?houseId=) |
| GET | /lords/:id | Obtener lord |
| POST | /lords | Crear lord |
| PATCH | /lords/:id | Actualizar lord |
| DELETE | /lords/:id | Eliminar lord |
| GET | /lords/:lordId/alliances | Alianzas del lord |
| POST | /alliances | Crear alianza |
| GET | /lords/:lordId/betrayals | Traiciones del lord |
| POST | /betrayals | Crear traición |
| GET | /lords/:id/power-index | Índice de poder |
