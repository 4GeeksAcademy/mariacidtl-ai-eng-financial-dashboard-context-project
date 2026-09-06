# Stack tecnológico (verificado en el repositorio)

## Frontend
- React 19, TypeScript, Vite, Tailwind CSS 4, Recharts (gráficos), lucide-react (iconos).
- Fuente: [frontend/package.json](../frontend/package.json).

## Backend
- FastAPI, Uvicorn (con `--reload`), Pydantic (vía FastAPI), debugpy (depuración remota).
- Fuente: [backend/requirements.txt](../backend/requirements.txt), [backend/Dockerfile](../backend/Dockerfile).

## Tests
- Frontend: Vitest (`npm run test` / `test:watch` / `test:coverage`).
  Fuente: [frontend/package.json](../frontend/package.json).
- Backend: pytest, pytest-cov, httpx (vía `TestClient` de FastAPI).
  Fuente: [backend/requirements.txt](../backend/requirements.txt), [backend/tests/test_routes.py](../backend/tests/test_routes.py).

## Lint / tipado
- ESLint (recomendado JS + TypeScript + React Hooks + React Refresh).
  Fuente: [frontend/eslint.config.js](../frontend/eslint.config.js).
- TypeScript con `noUnusedLocals`, `noUnusedParameters`, `noEmit`.
  Fuente: [frontend/tsconfig.app.json](../frontend/tsconfig.app.json).

## Docker / Compose
- Dos servicios: `frontend` (puerto 5173) y `backend` (puertos 8000 y 5678 para debugpy).
- Volúmenes monta el código fuente en ambos contenedores; backend corre con `--reload`.
  Configurado para desarrollo, no se verificó una configuración de producción.
- Fuente: [docker-compose.yml](../docker-compose.yml), [frontend/Dockerfile](../frontend/Dockerfile), [backend/Dockerfile](../backend/Dockerfile).

## No verificado
Comando exacto para ejecutar pytest fuera de Docker; no hay CI (`.github`) en el repositorio.
