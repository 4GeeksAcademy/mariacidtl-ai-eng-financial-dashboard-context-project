# Reglas: `frontend/src/lib/financial-utils.ts`

Alcance: aplica únicamente a las funciones exportadas por `frontend/src/lib/financial-utils.ts` (`computeKPIs`, `computeMonthlyData`, `formatCurrency`, `formatPercent`) y a sus funciones auxiliares privadas.

## Pureza de las funciones

- Debes: mantener estas funciones puras. No debes introducir `fetch`, acceso a `localStorage`/`sessionStorage`, variables de módulo mutables, ni ningún otro efecto secundario dentro de ellas.
- Motivo: las pruebas actuales en `frontend/src/lib/financial-utils.test.ts` invocan estas funciones directamente con arrays de ejemplo y comparan igualdad estructural (`toEqual`), sin mocks. Introducir efectos secundarios rompe esa forma de testear y acopla la capa de cálculo a detalles de entorno.
- Evidencia: [frontend/src/lib/financial-utils.ts](../../frontend/src/lib/financial-utils.ts), [frontend/src/lib/financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts).

## Protección ante división por cero

- Debes: al agregar una nueva función que calcule un porcentaje o ratio sobre un total que pueda ser 0 (por ejemplo, ingresos totales), seguir el patrón ya usado en `computeKPIs` y `computeMonthlyData`: comprobar explícitamente que el denominador es mayor que 0 antes de dividir, devolviendo 0 en caso contrario.
- Motivo: evita `NaN` o `Infinity` en los valores mostrados en la interfaz cuando no hay datos de ingresos.
- Evidencia: [frontend/src/lib/financial-utils.ts](../../frontend/src/lib/financial-utils.ts) (`totalIncome > 0 ? ... : 0`, `income > 0 ? ... : 0`).
