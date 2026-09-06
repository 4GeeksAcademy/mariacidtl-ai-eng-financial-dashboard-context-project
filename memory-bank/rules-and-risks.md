# Reglas y riesgos (resumen de `.agents/rules/`)

Este archivo resume las reglas ya documentadas en `.agents/rules/`. Para el detalle
completo (motivo extendido y evidencia), consulta cada archivo enlazado; no se
duplica aquí el contenido completo.

## Componentes de dashboard
Función nombrada + interfaz `XxxProps`; reutilizar `Card`/`Skeleton`/`cn`, no crear
contenedores o esqueletos de carga propios.
Ver: [.agents/rules/dashboard-components.md](../.agents/rules/dashboard-components.md).

## Imports y alias `@`
Alias `@` entre carpetas distintas de `src`; ruta relativa dentro del mismo directorio.
Si se cambia el alias, sincronizar `vite.config.ts` y `tsconfig.app.json`.
Ver: [.agents/rules/frontend-imports.md](../.agents/rules/frontend-imports.md).

## Contrato backend/frontend
No renombrar campos de `FinancialMovement` ni valores de los `Literal`
(`OperationType`, `Category`, `BusinessType`) sin actualizar el lado equivalente en
TypeScript. `GET /api/metrics` es el único endpoint consumido por el frontend hoy;
los demás no tienen consumidor.
Ver: [.agents/rules/backend-frontend-contract.md](../.agents/rules/backend-frontend-contract.md).

## Utilidades financieras
Las funciones de `financial-utils.ts` deben permanecer puras (sin `fetch` ni efectos
secundarios) y proteger divisiones por cero como ya hacen `computeKPIs`/`computeMonthlyData`.
Ver: [.agents/rules/financial-utils.md](../.agents/rules/financial-utils.md).

## Datos simulados y tests del backend
`generate_mock_movements(seed=42)` es determinista en cantidad/orden pero no en fechas
absolutas (depende de `date.today()`); `random.seed(seed)` muta el estado global de
`random`. No eliminar `backend/tests/conftest.py` sin preservar su ajuste de `sys.path`.
Ver: [.agents/rules/backend-mock-data-and-tests.md](../.agents/rules/backend-mock-data-and-tests.md).

## Historial de verificación
Los hallazgos que sustentan estas reglas están documentados con más detalle,
fase a fase, en [verification.md](../verification.md).
