# Reglas: contrato de datos entre backend y frontend

Alcance: aplica a cambios en `backend/app/routes.py` que afecten los modelos `FinancialMovement`, `OperationType`, `Category`, `BusinessType`, y a sus equivalentes en `frontend/src/lib/financial-types.ts` y `frontend/src/lib/financial-utils.ts`.

## Nombres de campo

- No debes: renombrar, eliminar o cambiar el formato de los campos de `FinancialMovement` en `backend/app/routes.py` (`create_date`, `amount`, `operation_type`, `category`, `business_type`) sin actualizar en el mismo cambio la interfaz `FinancialMovement` en `frontend/src/lib/financial-types.ts` y los accesos por nombre literal (`m.create_date`, `m.operation_type`, `m.amount`, etc.) en `frontend/src/lib/financial-utils.ts`.
- Motivo: estos nombres están duplicados manualmente entre Python y TypeScript sin generador compartido. Un cambio unilateral no produce un error de compilación en el frontend; produce valores `undefined` en tiempo de ejecución, que son más difíciles de diagnosticar.
- Debes: mantener `snake_case` únicamente en los tipos que reflejan el payload de la API (`FinancialMovement`); mantener `camelCase` en los tipos derivados para presentación (`KPIMetrics`, `MonthlyDataPoint`), tal como ya distingue el código existente.
- Evidencia: [backend/app/routes.py](../../backend/app/routes.py), [frontend/src/lib/financial-types.ts](../../frontend/src/lib/financial-types.ts), [frontend/src/lib/financial-utils.ts](../../frontend/src/lib/financial-utils.ts).

## Tipos `Literal` y union types

- No debes: añadir o quitar un valor de los tipos `Literal` del backend (`OperationType`, `Category`, `BusinessType` en `backend/app/routes.py`) sin replicar exactamente el mismo cambio en los union types equivalentes de `frontend/src/lib/financial-types.ts`.
- Motivo: un valor nuevo solo en el backend no genera error de compilación en TypeScript; el valor llega como string no reconocido por el union type local, sin verificación estática que lo detecte.
- Evidencia: [backend/app/routes.py](../../backend/app/routes.py), [frontend/src/lib/financial-types.ts](../../frontend/src/lib/financial-types.ts).

## Relación entre `GET /api/metrics` y el frontend

- Debes: tener en cuenta que `GET /api/metrics` (definido en `backend/app/routes.py`) es, a día de la verificación, el único endpoint consumido por el frontend, a través de `fetchFinancialData` en `frontend/src/App.tsx`. El resto de endpoints del backend (`/api/metrics/summary`, `/api/metrics/b2b`, `/api/metrics/b2c`, `/api/metrics/facets`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`) no tienen consumidor en el frontend actual.
- No debes: asumir que modificar un endpoint distinto de `/api/metrics` es sin riesgo para el frontend solo porque no lo consume hoy; confirma primero si hay planes de consumirlo antes de descartar el impacto.
- Si decides mover a `/api/metrics/summary` (o similar) el cálculo que hoy hace `computeKPIs`/`computeMonthlyData` en el cliente, debes: actualizar explícitamente `frontend/src/App.tsx` para consumir el endpoint especializado, en vez de dejar lógica de agregación duplicada entre cliente y servidor.
- Evidencia: [frontend/src/App.tsx](../../frontend/src/App.tsx), [backend/app/routes.py](../../backend/app/routes.py).
