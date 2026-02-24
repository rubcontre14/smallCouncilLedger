# The Small Council Ledger — Store local (FaunaDB en local)

Cuando no puedes usar [Fauna Dashboard](https://dashboard.fauna.com) o prefieres desarrollar sin dependencias externas, la API puede usar un **store local** en lugar de FaunaDB.

## Cuándo se usa el store local

El store local se activa en uno de estos casos:

1. **No existe `FAUNA_SECRET`** en el entorno (o en `apps/api/.env`).
2. **`USE_LOCAL_STORE=true`** (o `USE_LOCAL_STORE=1`) en el entorno, aunque tengas `FAUNA_SECRET`.

Al arrancar la API verás en consola:

```text
The Small Council Ledger API: usando store LOCAL (in-memory + archivo).
```

## Comportamiento

- **En memoria:** casas, lords, alianzas y traiciones se guardan en estructuras en memoria.
- **Persistencia opcional:** por defecto los datos se guardan también en un archivo JSON y se cargan al reiniciar.
- **Casas y lords al arrancar:** no hace falta ejecutar ningún script. Al arrancar la API con store local:
  - Si **no existe** `apps/api/data/local-store.json`, el store se rellena con las **nueve casas** (Stark, Lannister, Targaryen, etc.) y con **lords/ladies de ejemplo** (Eddard Stark, Catelyn Tully, Tywin Lannister, Daenerys Targaryen, Robert Baratheon, Margaery Tyrell, Oberyn Martell, Balon Greyjoy, Jon Arryn, etc.). Ya puedes usar `GET /api/houses`, `GET /api/lords` y el desplegable de casas en "Nuevo Lord".
  - Si **existe** el archivo, se cargan desde él casas, lords, alianzas y traiciones. Si el archivo tiene casas pero **no tiene lords**, se cargan automáticamente los lords de ejemplo.
  - El archivo se crea o actualiza cuando guardas un lord, una alianza o una traición (persistencia activada por defecto).

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `USE_LOCAL_STORE` | `true` o `1` para forzar store local. |
| `LOCAL_STORE_PERSIST` | `0` o `false` para **no** persistir en archivo (solo memoria). Por defecto la persistencia está activada. |
| `LOCAL_STORE_FILE` | Ruta completa del archivo JSON. Por defecto: `apps/api/data/local-store.json`. |
| `LOCAL_STORE_DATA_DIR` | Directorio para el archivo (alternativa a indicar ruta completa en `LOCAL_STORE_FILE`). |

## Ubicación del archivo de datos

Por defecto:

- **Directorio:** `apps/api/data/`
- **Archivo:** `local-store.json`

La carpeta `apps/api/data/` está en `.gitignore` para no subir datos locales al repositorio.

## API idéntica

Los endpoints REST son los mismos con store local o con FaunaDB. El frontend no necesita ningún cambio.

## Cambiar a FaunaDB más adelante

1. Configura Fauna (base de datos, colecciones, índices, API Key) según `apps/api/FAUNA-SETUP.md`.
2. Define `FAUNA_SECRET` en `apps/api/.env`.
3. Quita `USE_LOCAL_STORE` si lo tenías.
4. Reinicia la API. A partir de ese momento se usará FaunaDB (los datos del archivo local no se migran automáticamente; puedes usar el script `scripts/seed-houses.js` para las casas).
