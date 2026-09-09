---
name: dashboard-qa
description: QA previo a merge para el dashboard financiero Vite + React + TypeScript.
---

# dashboard-qa

## Objetivo

Verificar que los cambios del frontend del dashboard financiero pasan los checks mínimos antes de merge.

## Inputs

- Rama o working tree actual.
- Cambios realizados en el frontend.
- Scripts definidos en [frontend/package.json](frontend/package.json).

## Output esperado

Un resumen breve con:
- resultado de tests;
- resultado de lint;
- resultado de build;
- resultado de `git diff --check`;
- lista de bloqueos si algún check falla.

## Criterios de aceptación

Antes de merge deben pasar:

1. `npm test` desde `frontend/`.
2. `npm run lint` desde `frontend/`.
3. `npm run build` desde `frontend/`.
4. `git diff --check` desde la raíz del repositorio.

La skill no debe modificar archivos. Si un check falla, debe reportar el comando fallido, el motivo principal y el archivo afectado cuando sea posible.