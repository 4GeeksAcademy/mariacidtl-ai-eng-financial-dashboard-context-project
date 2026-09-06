# Reglas: componentes de `frontend/src/components/dashboard/`

Alcance: aplica únicamente a componentes dentro de `frontend/src/components/dashboard/`. No aplica a las primitivas genéricas de `frontend/src/components/ui/`, que siguen un patrón distinto (usan `React.ComponentProps<'div'>` en lugar de una interfaz `XxxProps` propia).

## Patrón de componente y props

- Debes: al crear o modificar un componente en `frontend/src/components/dashboard/`, exportarlo como función nombrada (`export function NombreComponente(...)`), no como `export default` ni como componente anónimo.
- Debes: declarar una interfaz local `NombreComponenteProps` inmediatamente antes de la función, en vez de tipar las props inline o reutilizar tipos genéricos.
- Motivo: los cinco componentes existentes en esta carpeta siguen este patrón sin excepción; introducir una variante rompe la consistencia y dificulta la lectura cruzada entre componentes.
- Evidencia: [frontend/src/components/dashboard/kpi-card.tsx](../../frontend/src/components/dashboard/kpi-card.tsx), [frontend/src/components/dashboard/kpi-row.tsx](../../frontend/src/components/dashboard/kpi-row.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](../../frontend/src/components/dashboard/income-outcome-chart.tsx), [frontend/src/components/dashboard/profit-percent-chart.tsx](../../frontend/src/components/dashboard/profit-percent-chart.tsx), [frontend/src/components/dashboard/dashboard-header.tsx](../../frontend/src/components/dashboard/dashboard-header.tsx).

## Reutilización de primitivas de UI

- Debes: usar `Card`/`CardContent`/`CardHeader`/`CardTitle`/`CardDescription` (de `frontend/src/components/ui/card.tsx`) como contenedor visual de cualquier componente nuevo de dashboard, en vez de crear un `div` con estilos de tarjeta propios.
- Debes: usar `Skeleton` (de `frontend/src/components/ui/skeleton.tsx`) para representar el estado `loading`, siguiendo el patrón existente de una rama `if (loading) { return (...) }` antes del render normal.
- Debes: usar `cn` (de `frontend/src/lib/utils.ts`) para combinar clases Tailwind condicionales o fusionar `className` recibido por props, en vez de concatenar strings de clases manualmente.
- Motivo: ningún componente existente en `dashboard/` define su propio contenedor de tarjeta o su propio esqueleto de carga; todos delegan en estas tres piezas. Una implementación paralela introduce inconsistencia visual y de comportamiento de carga.
- Evidencia: [frontend/src/components/dashboard/kpi-card.tsx](../../frontend/src/components/dashboard/kpi-card.tsx), [frontend/src/components/dashboard/income-outcome-chart.tsx](../../frontend/src/components/dashboard/income-outcome-chart.tsx), [frontend/src/components/dashboard/profit-percent-chart.tsx](../../frontend/src/components/dashboard/profit-percent-chart.tsx), [frontend/src/components/ui/card.tsx](../../frontend/src/components/ui/card.tsx), [frontend/src/components/ui/skeleton.tsx](../../frontend/src/components/ui/skeleton.tsx), [frontend/src/lib/utils.ts](../../frontend/src/lib/utils.ts).
