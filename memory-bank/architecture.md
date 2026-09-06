# Arquitectura y relaciones importantes

## Estructura del frontend
- `frontend/src/components/dashboard/`: componentes de negocio (KPI cards, gráficos,
  cabecera). Patrón: función nombrada + interfaz `XxxProps` local.
- `frontend/src/components/ui/`: primitivas genéricas (`Card`, `Skeleton`), con un
  patrón distinto (`React.ComponentProps<'div'>`).
- `frontend/src/lib/`: `financial-types.ts` (contratos), `financial-utils.ts`
  (cálculos puros), `utils.ts` (`cn`), `mock-data.ts` (dataset estático sin uso
  actual en el código fuente).
Fuente: árbol de archivos de `frontend/src/`.

## Estructura del backend
Todo concentrado en `backend/app/routes.py`: modelos Pydantic, generación de datos,
funciones de filtrado/agregación y los 9 handlers HTTP. `backend/app/main.py` solo
crea la app FastAPI, configura CORS e incluye el router.
Fuente: [backend/app/main.py](../backend/app/main.py), [backend/app/routes.py](../backend/app/routes.py).

## Relación entre API y tipos del frontend
- `FinancialMovement` (Python) y `FinancialMovement` (TypeScript) comparten los mismos
  5 campos en `snake_case`, duplicados manualmente sin generador compartido.
- Los tipos derivados para presentación (`KPIMetrics`, `MonthlyDataPoint`) usan
  `camelCase` y se calculan en `financial-utils.ts` a partir del payload de la API.
- El proxy de Vite redirige `/api` a `http://backend:8000` (nombre del servicio Compose).
Fuente: [backend/app/routes.py](../backend/app/routes.py),
[frontend/src/lib/financial-types.ts](../frontend/src/lib/financial-types.ts),
[frontend/vite.config.ts](../frontend/vite.config.ts).

## Dónde están los cálculos financieros
- Backend: agregaciones específicas por endpoint (`summarize_movements`,
  `build_top_categories`, `calculate_net_value`, `detect_outcome_alerts`), no usadas
  hoy por el frontend.
- Frontend: `computeKPIs`, `computeMonthlyData`, `computeTransactionCount` en
  `financial-utils.ts`, ejecutadas sobre el payload de `/api/metrics`.
Fuente: [backend/app/routes.py](../backend/app/routes.py),
[frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts).

## Patrones verificados
- Componentes de dashboard: función nombrada + `XxxProps`, reutilización de
  `Card`/`Skeleton`/`cn`.
- Imports: alias `@` entre carpetas distintas de `src`; ruta relativa dentro del
  mismo directorio.
- Alias `@` definido en dos sitios que deben sincronizarse: `vite.config.ts` y
  `tsconfig.app.json`.
Fuente: reglas detalladas en `.agents/rules/dashboard-components.md` y
`.agents/rules/frontend-imports.md` (resumen ampliado en `rules-and-risks.md`).
