# Notas IA — Generación de código (23 feb 2025)

## Prompt del usuario

"Genera el código"

## Resultado

Se generó el código completo del monorepo según el plan de arquitectura:

### Backend (apps/api)

- **Hapi** con plugin **Fauna** (`faunadb`), rutas REST bajo `/api`.
- **Servicios:** houseService, lordService, allianceService, betrayalService, powerIndexService (cálculo de Índice de Poder).
- **Rutas:** houses, lords, lords/:id/power-index, alliances, betrayals.
- **Configuración:** `.env.example`, `FAUNA-SETUP.md`, script `scripts/seed-houses.js` para poblar casas.

### Frontend (apps/web)

- **Marko Run** (Vite + Marko 5), rutas: `/`, `/houses`, `/lords`, `/lords/new`, `/lords/[id]`.
- **Layout** con estilo pergamino y tipografía Cinzel/Cinzel Decorative.
- **Estilos:** `src/styles/theme.css` (pergamino, quemado, medieval).
- **Llamadas a la API** desde el cliente (fetch) con base URL configurable (`VITE_API_URL` o `__API_BASE__`).

### Raíz

- `package.json` con workspaces (`apps/*`).
- `.gitignore` para node_modules, .env, dist, etc.

### Cómo ejecutar

1. `npm install` en la raíz.
2. Configurar Fauna (colecciones, índices, `FAUNA_SECRET`) según `apps/api/FAUNA-SETUP.md`.
3. Opcional: `node apps/api/scripts/seed-houses.js` para casas de ejemplo.
4. Terminal 1: `cd apps/api && npm run dev` (API en :3000).
5. Terminal 2: `cd apps/web && npm run dev` (Web en :8080).
