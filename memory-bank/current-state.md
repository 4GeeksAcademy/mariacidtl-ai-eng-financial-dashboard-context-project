# Estado actual

## Implementado
- Backend con datos simulados y 9 endpoints (ver abajo).
- Frontend que consume 1 solo endpoint y calcula KPIs/series mensuales en cliente.
- Suite de tests en backend (integración HTTP) y frontend (funciones puras).

## Cómo se ejecuta
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Docs API: http://localhost:8000/docs
Fuente: [README.md](../README.md), [docker-compose.yml](../docker-compose.yml).

## Servicios
`frontend` y `backend`, sin base de datos ni servicios externos declarados.
Fuente: [docker-compose.yml](../docker-compose.yml).

## Endpoints del backend
`/health`, `/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`,
`/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`,
`/api/metrics/b2b`, `/api/metrics/b2c`.
Fuente: [backend/app/routes.py](../backend/app/routes.py).

**El frontend solo consume `GET /api/metrics`** (única llamada HTTP en el código).
El resto de endpoints no tienen consumidor en el frontend actual.
Fuente: [frontend/src/App.tsx](../frontend/src/App.tsx).

## Cómo se generan los datos
`generate_mock_movements(seed=42)` genera 360 movimientos simulados en memoria (no hay
base de datos). Es determinista en cantidad y orden, pero el rango de fechas depende de
`date.today()` (usa `_year_for_month`), y `random.seed(seed)` muta el estado global de
`random` de Python para el resto del proceso. Comportamiento comprobado en ejecución
durante la Fase 2 (ver `verification.md`).
Fuente: [backend/app/routes.py](../backend/app/routes.py).

## Estado de los tests
- Backend: `backend/tests/test_routes.py` cubre todos los endpoints listados arriba
  y las funciones auxiliares `generate_mock_movements`/`filter_movements_by_date`.
  Requiere `backend/tests/conftest.py` para insertar la raíz de `backend` en `sys.path`.
- Frontend: `frontend/src/lib/financial-utils.test.ts` tiene 11 tests y cubre
  `computeKPIs`, `computeTransactionCount`, `computeMonthlyData` y los formateadores,
  incluyendo entradas vacías, meses con solo `outcome` y agregación de varias
  operaciones en el mismo mes. No hay tests de componentes ni de la llamada `fetch`
  en `App.tsx`.
- Se exploraron los temas "testing" y "typescript" y se seleccionó la skill
  `anthropics/skills@webapp-testing` porque complementa las skills de accessibility
  y React best practices ya aplicadas, mejorando la cobertura de las funciones
  financieras puras sin introducir nuevas dependencias.
Fuente: [backend/tests/test_routes.py](../backend/tests/test_routes.py),
[backend/tests/conftest.py](../backend/tests/conftest.py),
[frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts).

## Limitaciones y riesgos conocidos
- Contrato API duplicado manualmente entre Python y TypeScript, sin generador compartido.
- El periodo mostrado en la cabecera ("2024 - Full Year") es un texto fijo, no calculado
  a partir de los datos reales (que se desplazan con `date.today()`).
Fuente: [frontend/src/App.tsx](../frontend/src/App.tsx).

## Agent Skills - Progress
- Skills aplicadas: accessibility, vercel-react-best-practices y webapp-testing.
- Cambios verificados: accessibility, optimizaciones React/performance y tests de
  `financial-utils`.
- Skill del ecosistema elegida: `anthropics/skills@webapp-testing`, porque complementa
  accessibility y React best practices con una auditoría de testing enfocada en el
  frontend sin introducir nuevas dependencias.
- Skill interna creada: [.skills/dashboard-qa/SKILL.md](../.skills/dashboard-qa/SKILL.md),
  que define checks de QA antes del merge: tests, lint, build y `git diff --check`.
