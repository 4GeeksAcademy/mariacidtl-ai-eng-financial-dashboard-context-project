#Fase 1 - Verificación del proyecto

Se contrastó el resumen del proyecto con el código y la configuración del repositorio.

## Aspectos verificados

- Ejecución local con `docker compose up --build` y URLs publicadas: [README.es.md](README.es.md).
- Servicios `frontend` y `backend`, puertos, volúmenes y dependencia entre servicios: [docker-compose.yml](docker-compose.yml).
- Scripts, dependencias y servidor de desarrollo del frontend: [frontend/package.json](frontend/package.json) y [frontend/Dockerfile](frontend/Dockerfile).
- Proxy de Vite desde `/api` hacia el servicio `backend`: [frontend/vite.config.ts](frontend/vite.config.ts).
- Consumo del endpoint `/api/metrics` desde la aplicación React: [frontend/src/App.tsx](frontend/src/App.tsx).
- Inicio de FastAPI, configuración CORS y registro de rutas: [backend/app/main.py](backend/app/main.py).
- Rutas de la API y generación de datos financieros simulados: [backend/app/routes.py](backend/app/routes.py).
- Cobertura de pruebas de rutas del backend: [backend/tests/test_routes.py](backend/tests/test_routes.py).

## Resultado

Las afirmaciones importantes del resumen fueron contrastadas con los archivos indicados y resultaron correctas. No fue necesario corregir ninguna afirmación.

## Fase 2 — Convenciones y riesgos verificados

Se analizaron convenciones de implementación y riesgos relevantes para futuros contribuidores o coding agents, ligados a archivos, carpetas o comportamientos concretos del repositorio.

- Componentes en `frontend/src/components/dashboard/` exportados como función nombrada con una interfaz local `XxxProps`: [frontend/src/components/dashboard/kpi-card.tsx](frontend/src/components/dashboard/kpi-card.tsx), [frontend/src/components/dashboard/kpi-row.tsx](frontend/src/components/dashboard/kpi-row.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](frontend/src/components/dashboard/income-outcome-chart.tsx), [frontend/src/components/dashboard/profit-percent-chart.tsx](frontend/src/components/dashboard/profit-percent-chart.tsx), [frontend/src/components/dashboard/dashboard-header.tsx](frontend/src/components/dashboard/dashboard-header.tsx).
- Alias `@` definido en dos archivos que deben mantenerse sincronizados: [frontend/vite.config.ts](frontend/vite.config.ts) y [frontend/tsconfig.app.json](frontend/tsconfig.app.json).
- Duplicación manual de nombres de campo y tipos `Literal`/union entre backend y frontend, sin generador compartido: [backend/app/routes.py](backend/app/routes.py) y [frontend/src/lib/financial-types.ts](frontend/src/lib/financial-types.ts).
- Acceso por nombre literal a campos del payload de la API en las utilidades de cálculo: [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts).
- Funciones puras y protegidas contra división por cero, verificadas también por sus pruebas: [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts) y [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).
- Reutilización consistente de primitivas de UI (`Card`, `Skeleton`, `cn`) en los componentes de dashboard: [frontend/src/components/ui/card.tsx](frontend/src/components/ui/card.tsx), [frontend/src/components/ui/skeleton.tsx](frontend/src/components/ui/skeleton.tsx), [frontend/src/lib/utils.ts](frontend/src/lib/utils.ts).
- `generate_mock_movements(seed=42)` es determinista en cantidad y orden, pero el rango de fechas depende de `date.today()`, y `random.seed(seed)` muta el estado global de `random`; comportamiento comprobado ejecutando el código de [backend/app/routes.py](backend/app/routes.py).
- Dependencia de `backend/tests/conftest.py` para que las pruebas puedan importar `app` sin instalación como paquete: [backend/tests/conftest.py](backend/tests/conftest.py), [backend/tests/test_routes.py](backend/tests/test_routes.py).
- El frontend solo consume `GET /api/metrics`; el resto de endpoints del backend no tienen consumidor actual: [frontend/src/App.tsx](frontend/src/App.tsx), [backend/app/routes.py](backend/app/routes.py).

Las reglas accionables derivadas de estos hallazgos se documentarán en la Fase 3.
