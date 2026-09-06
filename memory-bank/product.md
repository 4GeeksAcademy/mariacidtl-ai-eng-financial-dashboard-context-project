# Producto

## Qué es
Dashboard de métricas financieras: frontend en React + TypeScript, backend en FastAPI.
Fuente: [README.md](../README.md), [README.es.md](../README.es.md).

## Qué problema resuelve
Presenta una visión ejecutiva de ingresos, gastos y rentabilidad a partir de movimientos
financieros (income/outcome), con desglose por categoría y tipo de negocio (B2B/B2C).
Fuente: modelos y endpoints en [backend/app/routes.py](../backend/app/routes.py).

## Qué muestra actualmente
La pantalla única (`App.tsx`) muestra:
- Cabecera con periodo fijo ("2024 - Full Year", hardcodeado, no calculado).
- 5 KPI cards: ingresos totales, gastos totales, beneficio, margen de beneficio (%) y
  número de transacciones.
- Gráfico de líneas ingresos vs. gastos por mes.
- Gráfico de líneas de margen de beneficio (%) por mes.
Fuente: [frontend/src/App.tsx](../frontend/src/App.tsx),
[frontend/src/components/dashboard/kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx),
[frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx),
[frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).

## No verificado
No hay evidencia en el repositorio de autenticación, roles de usuario, ni persistencia
de datos reales (los datos son simulados; ver `current-state.md`).
