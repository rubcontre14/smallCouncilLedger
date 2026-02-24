# Notas IA — Prompt inicial (23 feb 2025)

## Prompt del usuario

Quiero diseñar una aplicación llamada "The Small Council Ledger" basada en el universo de "Juego de Tronos".
Debes ser el arquitecto senior full-stack pero primero quiero que me presentes el plan a seguir antes de generar el código. Quiero que sea una app monorepo en el que se utilice el siguiente stack:
- Frontend: Marko
- Backend: Node.js con Hapi
- Base de datos: FaunaDB
- Estilo visual: mapa de Westeros, pergamino quemado, tipografía medieval tallada en piedra.

El objetivo de la aplicación es crear un Sistema de gestión de lealtades y traiciones entre las casas de Juego de Tronos.
Entre las Funcionalidades principales de la aplicación tienen que estar estas:
- Crear perfil de Lord/Lady
- Elegir casa (Stark, Lannister, Targaryen, Baratheon, etc.)
- Registrar alianzas o traiciones
- Calcular automáticamente un "Índice de Poder"
- Persistir datos en FaunaDB

Respecto al plan quiero:
1. Propuesta de arquitectura (frontend/backend)
2. Modelo de datos
3. Estructura de carpetas
4. Endpoints REST
5. Cómo conectar Hapi con FaunaDB
6. Generar documentación y guardar cada prompt en la carpeta "Notas IA"

Responde con estructura clara y organizada. Todo debe guardarse en la carpeta "The Small Council Ledger".

---

## Resultado

Se generó el plan de arquitectura **sin código**, con documentación en:

- `docs/01-PLAN-ARQUITECTURA.md` — Arquitectura, diagrama de capas, decisiones técnicas.
- `docs/02-MODELO-DATOS.md` — Colecciones FaunaDB (houses, lords, alliances, betrayals) e índices.
- `docs/03-ENDPOINTS-REST.md` — Especificación de todos los endpoints REST.
- `docs/04-HAPI-FAUNADB.md` — Conexión Hapi + FaunaDB (plugin, env, uso en rutas/servicios).
- `Notas IA/2025-02-23-prompt-inicial.md` — Este archivo (prompt y resumen).

Próximo paso acordado: cuando el usuario lo indique, generar el código del monorepo (apps/api y apps/web) siguiendo este plan.
