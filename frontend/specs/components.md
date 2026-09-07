# Especificación de componentes — Fase 3

Documento de **especificación**, no de implementación. No contiene código React ni llamadas a la API.

Fuentes:

- Contrato verificado en Fase 1 (`http://localhost:8000/docs` y `openapi.json`), con respaldo en [backend/app/routes.py](../../backend/app/routes.py).
- Tipos de Fase 2: [frontend/specs/api-types.ts](../specs/api-types.ts) y [frontend/specs/param-types.ts](../specs/param-types.ts).
- Componentes existentes en [frontend/src](../src).

---

## 0. Convenciones observadas en el código actual

Estas convenciones son **reales** (verificadas en el repositorio) y toda la especificación las respeta:

| Convención | Evidencia |
|---|---|
| Componentes de dashboard exportados como **función nombrada** (`export function Xxx(...)`), sin `default` | [kpi-card.tsx](../src/components/dashboard/kpi-card.tsx), [kpi-row.tsx](../src/components/dashboard/kpi-row.tsx), [income-outcome-chart.tsx](../src/components/dashboard/income-outcome-chart.tsx) |
| Cada componente declara una **interfaz local `XxxProps`** no exportada | mismos archivos |
| Nombres de archivo en **kebab-case** dentro de `src/components/dashboard/` | listado de la carpeta |
| Prop `loading?: boolean` que renderiza un **early return con `Skeleton`** antes del contenido real | [kpi-card.tsx](../src/components/dashboard/kpi-card.tsx), [income-outcome-chart.tsx](../src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../src/components/dashboard/profit-percent-chart.tsx) |
| Contenedor visual siempre `Card` + `CardHeader`/`CardTitle`/`CardDescription`/`CardContent` de [ui/card.tsx](../src/components/ui/card.tsx) | ambos charts |
| Estado vacío in-situ con el literal `No data available to display` y altura fija `h-[280px]` | [income-outcome-chart.tsx](../src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../src/components/dashboard/profit-percent-chart.tsx) |
| Datos ya calculados **se pasan por props**; el componente no hace fetch. El único `fetch` está en [App.tsx](../src/App.tsx) | [App.tsx](../src/App.tsx) |
| Formato de moneda y porcentaje mediante `formatCurrency` / `formatPercent` de [financial-utils.ts](../src/lib/financial-utils.ts) | [kpi-row.tsx](../src/components/dashboard/kpi-row.tsx) |
| Gráficos con **recharts** (`ResponsiveContainer`, altura 280) e iconos con **lucide-react** | [package.json](../package.json), ambos charts |
| Alias `@/...` para imports entre carpetas de `src`; relativo dentro del mismo directorio | [.agents/rules/frontend-imports.md](../../.agents/rules/frontend-imports.md) |
| Textos de UI en inglés; textos de error de `App.tsx` en español | [kpi-row.tsx](../src/components/dashboard/kpi-row.tsx), [App.tsx](../src/App.tsx) |

**No existen hoy** en `src/components/ui/`: input, select, button, table, badge, alert, tooltip ni date-picker. Solo `card.tsx` y `skeleton.tsx`. Cualquier primitiva nueva debe crearse siguiendo el patrón de esos dos archivos (funciones nombradas, `React.ComponentProps<'...'>`, `cn`, `data-slot`).

### Estado actual del flujo de datos

[App.tsx](../src/App.tsx) mantiene cuatro estados (`metrics`, `monthlyData`, `loading`, `error`) y hace un único `fetch` a `/api/metrics` **sin parámetros**, dentro de un `useEffect` con array de dependencias vacío. Las tres funcionalidades requieren que ese efecto pase a depender de los filtros. Esa refactorización es **parte de la implementación (Fase 4)**; aquí solo se especifica el contrato.

---

## 1. Filtro por rango de fechas

### 1.1 Objetivo

Permitir acotar todo el dashboard a un rango `[start_date, end_date]`, ambos opcionales, enviados a la API en formato `YYYY-MM-DD`. Sin valores, se consulta el dataset completo. Junto a los inputs se muestran las fechas mínima y máxima disponibles.

### 1.2 Endpoints implicados (verificados)

| Uso | Método y ruta | Parámetros |
|---|---|---|
| Límites disponibles | `GET /api/metrics/facets` | ninguno |
| Datos del dashboard | `GET /api/metrics` | `start_date`, `end_date`, `category`, `operation_type` (todos opcionales) |

`facets` devuelve `min_date` y `max_date`, que **no son fijos**: el backend los deriva de `date.today()`. Los límites del selector deben leerse siempre de la API, nunca hardcodearse.

### 1.3 Componentes afectados

| Componente | Impacto |
|---|---|
| [App.tsx](../src/App.tsx) | Pasa a ser el propietario del estado del rango y del resultado de `facets`; el `useEffect` debe reejecutarse al cambiar el rango. Es el único punto donde se construyen los query params. |
| [dashboard-header.tsx](../src/components/dashboard/dashboard-header.tsx) | Su prop `period?: string` recibe hoy el literal `"2024 - Full Year"` desde `App.tsx`, valor que **ya no corresponde** con las fechas reales de la API. Debe pasar a reflejar el rango activo. **Pendiente de implementación**: si el header solo muestra el texto y el selector vive fuera, o si el selector se aloja dentro del header. |
| [kpi-row.tsx](../src/components/dashboard/kpi-row.tsx) y [kpi-card.tsx](../src/components/dashboard/kpi-card.tsx) | Sin cambios de props; los KPIs se recalculan porque `computeKPIs` recibe menos movimientos. |
| [income-outcome-chart.tsx](../src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../src/components/dashboard/profit-percent-chart.tsx) | Sin cambios de props; ya gestionan el caso `hasData === false`, que se activará con rangos sin datos. |
| [financial-utils.ts](../src/lib/financial-utils.ts) | Sin cambios necesarios: el filtrado ocurre en el backend. `computeKPIs` y `computeMonthlyData` son puras y operan sobre lo que reciban. |

### 1.4 Componentes nuevos propuestos

| Archivo propuesto | Componente | Responsabilidad |
|---|---|---|
| `src/components/dashboard/date-range-filter.tsx` | `DateRangeFilter` | Dos campos de fecha, texto con rango disponible, botón de limpiar, y mensaje de rango inválido. Controlado: no guarda estado propio de negocio. |
| `src/components/ui/input.tsx` | `Input` | Primitiva ausente. Necesaria para los campos de fecha nativos. |

**Pendiente de implementación**: uso de `input type="date"` nativo frente a un date-picker propio. El proyecto no tiene ninguna dependencia de calendario ([package.json](../package.json)), por lo que el nativo es la opción sin coste; la decisión no está tomada.

> Nota de nomenclatura: el componente `DateRangeFilter` comparte nombre con la interfaz `DateRangeFilter` de [param-types.ts](../specs/param-types.ts). **Pendiente de implementación**: renombrar uno de los dos (por ejemplo `DateRangeFilterProps.value: DateRangeFilter`) para evitar colisión en los imports.

### 1.5 Props principales

`DateRangeFilterProps`:

| Prop | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `value` | `DateRangeFilter` (Fase 2) | sí | Rango activo. Sus campos son `start_date?: ISODateString \| null` y `end_date?: ISODateString \| null`. |
| `onChange` | `(next: DateRangeFilter) => void` | sí | Notifica el nuevo rango al propietario del estado. |
| `facets` | `FacetsResponse \| null` | sí | `null` mientras se cargan los límites. Se leen `min_date` y `max_date`. |
| `loading` | `boolean` (opcional) | no | Igual semántica que en el resto de componentes: renderiza `Skeleton`. |

Cambio en `DashboardHeaderProps`: la prop existente `period?: string` se mantiene; `App.tsx` debe pasarle una descripción del rango activo en lugar del literal fijo. No se propone añadir props nuevas al header.

### 1.6 Estados de UI

| Estado | Condición | Comportamiento esperado |
|---|---|---|
| Ambos vacíos | `start_date` y `end_date` ausentes o `null` | No se envía ningún parámetro de fecha. Se consulta el dataset completo. Es el estado inicial. |
| Solo fecha inicial | `start_date` presente, `end_date` ausente | Se envía únicamente `start_date`. El backend filtra desde esa fecha inclusive hasta el final del dataset. |
| Solo fecha final | `end_date` presente, `start_date` ausente | Se envía únicamente `end_date`. Filtra desde el inicio del dataset hasta esa fecha inclusive. |
| Rango completo | ambas presentes y `start_date <= end_date` | Se envían ambos. Filtro **inclusivo en ambos extremos** (verificado en `filter_movements_by_date`). |
| Intervalo inválido | ambas presentes y `start_date > end_date` | La API responde **HTTP 200 con `[]`**, no error. La UI debe detectarlo antes de llamar y mostrar un mensaje de validación local; **pendiente de implementación**: si además se bloquea la petición o se deja pasar y se muestra el estado vacío. |
| Fuera de límites | fecha anterior a `min_date` o posterior a `max_date` | No es un error de la API: devuelve 200 con menos o los mismos datos. Solo se restringe visualmente con los atributos de límite del input. |
| Formato inválido | cadena que no es `YYYY-MM-DD` | La API responde **HTTP 422** (`type: "date_from_datetime_parsing"`). No debería alcanzarse con un input de tipo fecha; si ocurre, se trata como error de API. |
| Cargando | petición en vuelo | `loading` activo en los componentes hijos, siguiendo el patrón `Skeleton` existente. |

### 1.7 Comportamiento ante datos vacíos

- `GET /api/metrics` devuelve `[]`: `computeKPIs` produce ceros (protegida contra división por cero, verificado en [financial-utils.test.ts](../src/lib/financial-utils.test.ts)) y `computeMonthlyData` devuelve `[]`. Los charts muestran su estado vacío existente. **Los KPIs no deben ocultarse**: se muestran a cero.
- `GET /api/metrics/facets` no puede devolver una lista vacía con el generador actual, pero mientras `facets` sea `null` el texto de rango disponible no debe renderizarse con valores inventados.

### 1.8 Comportamiento ante errores de API

- Se reutiliza el patrón actual de [App.tsx](../src/App.tsx): un estado `error: string \| null` y un bloque con `border-destructive/30 bg-destructive/10`.
- El fallo de `facets` y el fallo de `/api/metrics` deben distinguirse: si falla solo `facets`, el dashboard sigue siendo utilizable sin mostrar los límites disponibles. **Pendiente de implementación**: si se usan dos estados de error separados o uno solo.
- Un 422 debe presentarse como error de validación, no como fallo genérico. El cuerpo se corresponde con `HTTPValidationError` de [api-types.ts](../specs/api-types.ts).
- Tras un error, el rango seleccionado **no se revierte**; el usuario debe poder corregirlo.

### 1.9 Relación con los tipos de Fase 2

- Estado del rango: `DateRangeFilter`.
- Params de la petición de datos: `MetricsParams` (extiende `DateRangeFilter`).
- Respuesta de límites: `FacetsResponse` (`min_date`, `max_date` de tipo `ISODateString`).
- Respuesta de datos: `MetricsResponse` = `FinancialMovement[]`, estructuralmente idéntica al `FinancialMovement` ya existente en [financial-types.ts](../src/lib/financial-types.ts). **Pendiente de implementación**: si `src/lib/financial-types.ts` pasa a reexportar los tipos de `specs/` o se mantiene la duplicación actual (riesgo ya identificado en Fase 1).

---

## 2. Tabla de alertas de anomalías

### 2.1 Objetivo

Mostrar, debajo de los gráficos existentes, una tabla de periodos con gasto anómalo, con umbral configurable, que respeta el filtro de fechas y que **nunca desaparece silenciosamente** cuando no hay anomalías.

### 2.2 Endpoint implicado (verificado)

`GET /api/metrics/alerts` con `threshold` (`number`, default `0.3`, `minimum: 0`), `group_by` (`day|week|month`, default `month`), `start_date`, `end_date`, `business_type`. Respuesta: `AlertEntry[]`, posiblemente vacío con HTTP 200.

### 2.3 Discrepancias verificadas entre el requisito del PM y la API

Se documentan sin resolverlas por invención:

1. **"Media móvil de 3 periodos" no existe en la API.** El campo disponible es `baseline_average`, y `detect_outcome_alerts` en [backend/app/routes.py](../../backend/app/routes.py) lo calcula como la **media acumulativa expansiva de todos los periodos anteriores**, no como una ventana de 3. Además el propio filtrado de anomalías del backend usa esa media, así que recalcular una media de 3 en cliente cambiaría la columna pero no qué filas aparecen. Opciones: (a) etiquetar la columna como `Baseline average` y mostrar `baseline_average` tal cual; (b) recalcular una media móvil de 3 en cliente a partir de `GET /api/metrics/summary`, asumiendo incoherencia con el criterio de alerta del backend; (c) cambiar el backend. **Pendiente de decisión de producto**; no se elige ninguna en esta especificación.
2. **Rango de threshold `0.01`–`1.0` es más restrictivo que la API**, que solo impone `minimum: 0` y no declara máximo. Es una restricción de UI válida; debe aplicarse en el control y no confiarse a la API. Enviar un valor negativo produce HTTP 422.
3. **`threshold` es un ratio, no un porcentaje.** `0.3` = +30 %. Igualmente `increase_ratio` viene como ratio (`0.7353`); mostrarlo como porcentaje requiere multiplicar por 100. `formatPercent` de [financial-utils.ts](../src/lib/financial-utils.ts) espera ya el valor en escala porcentual, así que recibiría `increase_ratio * 100`.
4. **La primera fila del periodo nunca puede ser una alerta**: el backend necesita al menos un periodo previo para calcular baseline. No es un bug de la UI.

### 2.4 Componentes afectados

| Componente | Impacto |
|---|---|
| [App.tsx](../src/App.tsx) | Añade estado para las alertas, para el threshold y para su propio `loading`/`error`; añade una `section` nueva después de la `section` con `aria-label="Financial charts"`. Debe disparar la petición al cambiar el rango o el threshold. |
| [income-outcome-chart.tsx](../src/components/dashboard/income-outcome-chart.tsx), [profit-percent-chart.tsx](../src/components/dashboard/profit-percent-chart.tsx) | Sin cambios. Solo definen la posición: la tabla va **debajo** de su contenedor grid. |

### 2.5 Componentes nuevos propuestos

| Archivo propuesto | Componente | Responsabilidad |
|---|---|---|
| `src/components/dashboard/alerts-table.tsx` | `AlertsTable` | Card con título, control de threshold, tabla de alertas y estado vacío explícito. |
| `src/components/dashboard/alerts-threshold-control.tsx` | `AlertsThresholdControl` | Control del umbral aislado. **Pendiente de implementación**: podría vivir dentro de `alerts-table.tsx` si no se reutiliza; el proyecto no tiene precedente de sub-componentes en archivo separado salvo `KPIRow`/`KPICard`. |
| `src/components/ui/table.tsx` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | Primitiva ausente, siguiendo el patrón compositivo de [ui/card.tsx](../src/components/ui/card.tsx). |

### 2.6 Props principales

`AlertsTableProps`:

| Prop | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `alerts` | `AlertsResponse` (= `AlertEntry[]`) | sí | Filas ya obtenidas. Un array vacío es un valor válido y significativo. |
| `threshold` | `number` | sí | Valor activo, en escala de ratio. |
| `onThresholdChange` | `(next: number) => void` | sí | Notifica el cambio al propietario del estado. |
| `loading` | `boolean` (opcional) | no | Patrón `Skeleton` existente. |
| `error` | `string \| null` (opcional) | no | Mensaje de fallo específico de esta sección. |

`AlertsThresholdControlProps` (si se extrae): `value: number`, `onChange: (next: number) => void`, `min: number`, `max: number`, y opcionalmente `step`. Valores fijados por el requisito: `min = 0.01`, `max = 1.0`, default `0.3`. **Pendiente de implementación**: `step` y si el control es slider, input numérico o ambos.

### 2.7 Columnas de la tabla

| Columna (etiqueta propuesta) | Origen | Formato |
|---|---|---|
| Period | `AlertEntry.period` | Cadena tal cual. Su forma depende de `group_by`: `YYYY-MM` con el default `month`. |
| Outcome | `AlertEntry.outcome_total` | `formatCurrency` |
| Baseline average | `AlertEntry.baseline_average` | `formatCurrency`. Ver discrepancia 2.3.1 sobre la etiqueta "media móvil de 3 periodos". |
| Increase | `AlertEntry.increase_ratio` | `formatPercent(increase_ratio * 100)` |

No existe ningún campo de identificador en `AlertEntry`; `period` es el único candidato a clave de fila, y es único dentro de una misma respuesta porque el backend agrupa por periodo.

### 2.8 Estados de UI

| Estado | Condición | Comportamiento esperado |
|---|---|---|
| Cargando | petición en vuelo | Card visible con `Skeleton` en lugar de las filas, siguiendo el patrón de los charts. |
| Con alertas | `alerts.length > 0` | Filas ordenadas tal como las devuelve la API (cronológicas por `period`). |
| Sin alertas | `alerts.length === 0` | **La Card y su cabecera siguen visibles.** Mensaje explícito indicando que no se detectaron anomalías con el umbral actual, y sugerencia de bajarlo. Requisito expreso del PM. |
| Umbral en el límite | `threshold` en `0.01` o `1.0` | El control no permite salir del rango; no se emite petición con valores fuera de rango. |
| Rango de fechas sin datos | filtro que deja el dataset vacío | La API devuelve `[]`; se muestra el mismo estado vacío. **Pendiente de implementación**: si se diferencia el texto de "sin anomalías" del de "sin datos en el rango". |
| Error | fallo de red o 422 | Mensaje de error dentro de la Card, sin desmontar la sección. |

### 2.9 Comportamiento ante datos vacíos

`[]` con HTTP 200 es la respuesta normal cuando no hay anomalías (verificado con `threshold=5`). No debe tratarse como error ni provocar el desmontaje de la tabla. La comparación del backend es estrictamente mayor que el umbral, por lo que un valor exactamente igual al threshold no genera fila.

### 2.10 Comportamiento ante errores de API

- Error de red o 5xx: mensaje dentro de la Card; el resto del dashboard sigue funcionando.
- 422: solo alcanzable si se envía un threshold negativo o un `group_by` no permitido; con el control acotado no debería ocurrir. Si ocurre, mostrar mensaje de validación.
- El fallo de esta sección **no debe** poner en error el estado global de `App.tsx`. **Pendiente de implementación**: granularidad exacta de los estados de error.

### 2.11 Relación con los tipos de Fase 2

- Params: `AlertsParams` (extiende `DateRangeFilter`; incluye `threshold`, `group_by`, `business_type`).
- Defaults del backend: `ALERTS_PARAM_DEFAULTS` (`threshold: 0.3`, `group_by: "month"`).
- Cota inferior de la API: `ALERTS_THRESHOLD_MIN` (`0`), distinta del mínimo de UI (`0.01`).
- Respuesta: `AlertsResponse` / `AlertEntry`.
- `group_by`: `GroupBy`. **Pendiente de implementación**: si se expone al usuario o se fija en `month`; el requisito del PM habla de "periodos" sin especificar granularidad.

---

## 3. Sección de comparación B2B vs B2C

### 3.1 Objetivo

Mostrar dos bloques paralelos, B2B y B2C, cada uno con sus 5 categorías principales de ingresos (nombre, ingresos totales y porcentaje sobre el total del grupo), más un gráfico que compara el ingreso total de ambos grupos, todo bajo el mismo filtro de fechas.

### 3.2 Endpoints implicados (verificados)

| Uso | Llamada | Notas |
|---|---|---|
| Top categorías B2B | `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B` | |
| Top categorías B2C | `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C` | |
| Valores del selector | `GET /api/metrics/facets` | Sin parámetros |

Se requieren **dos llamadas**: omitir `business_type` devuelve el agregado, no un desglose. La respuesta `TopCategoryItem` **no incluye `business_type`**, así que el cliente debe asociar cada resultado a la llamada que lo originó.

### 3.3 Restricciones verificadas que condicionan el diseño

1. **`limit=5` es un máximo, no un tamaño garantizado.** Verificado en Fase 1: con `operation_type=income` la respuesta real tiene **2 elementos** (`sales`, `others`), porque el generador solo asigna esas dos categorías a los ingresos. La UI no puede asumir 5 filas ni reservar 5 huecos.
2. **`/api/metrics/categories/top` NO acepta un parámetro `category`.** El requisito "el selector de categoría debe utilizar únicamente valores procedentes de facets" no puede aplicarse a este endpoint filtrando en servidor. Opciones: (a) el selector filtra en cliente las filas ya recibidas; (b) el selector aplica a `/api/metrics`, que sí acepta `category`, afectando a otra parte del dashboard. **Pendiente de decisión de producto.** Lo que sí está fijado: los valores del selector deben salir de `FacetsResponse.categories`, nunca de una lista hardcodeada. Nótese que `facets.categories` devuelve las **cinco** categorías del dataset completo, incluidas las que nunca aparecen en ingresos, por lo que el selector puede ofrecer opciones que produzcan un resultado vacío.
3. **No existe un endpoint que devuelva el total de ingresos B2B vs B2C en una sola respuesta.** Alternativas verificadas: sumar `total_amount` de cada respuesta de `categories/top` (correcto solo mientras `limit` no trunque el conjunto), o usar `GET /api/metrics/summary?business_type=...&operation_type=income`, que sí devuelve el total agregado por periodo. **Pendiente de implementación**: elección de fuente.
4. **"Porcentaje sobre el total del grupo"**: el denominador puede ser la suma de las filas devueltas o el ingreso total real del grupo. Coinciden solo si `limit` no trunca. Con los datos actuales coinciden, pero la spec no debe depender de ese accidente. **Pendiente de decisión de producto.**

### 3.4 Componentes afectados

| Componente | Impacto |
|---|---|
| [App.tsx](../src/App.tsx) | Debe alojar la nueva sección y su estado, o delegar en un contenedor. La sección comparte el estado del rango de fechas con la funcionalidad 1. |
| [dashboard-header.tsx](../src/components/dashboard/dashboard-header.tsx) | Sin cambios adicionales a los de la funcionalidad 1. |
| Resto de componentes de dashboard | Sin cambios. |

**Pendiente de decisión de producto**: si es una **sección** dentro del dashboard actual o una **página** separada. El proyecto no tiene router (no hay dependencia de routing en [package.json](../package.json)); una página real exigiría introducirlo. Esta especificación asume sección dentro de `App.tsx`, opción sin coste añadido.

### 3.5 Componentes nuevos propuestos

| Archivo propuesto | Componente | Responsabilidad |
|---|---|---|
| `src/components/dashboard/business-comparison-section.tsx` | `BusinessComparisonSection` | Contenedor de la funcionalidad: dispone los dos paneles y el gráfico. Recibe datos por props; no hace fetch. |
| `src/components/dashboard/top-categories-panel.tsx` | `TopCategoriesPanel` | Un panel por grupo de negocio. Card con título, lista/tabla de categorías y estado vacío. Se instancia dos veces. |
| `src/components/dashboard/business-income-chart.tsx` | `BusinessIncomeChart` | Gráfico comparativo del ingreso total B2B vs B2C. |
| `src/components/dashboard/category-select.tsx` | `CategorySelect` | Selector cuyas opciones proceden exclusivamente de `FacetsResponse.categories`. |
| `src/components/ui/select.tsx` | `Select` | Primitiva ausente. **Pendiente de implementación**: `select` nativo frente a componente propio; no hay dependencia de Radix en [package.json](../package.json). |

`TopCategoriesPanel` se instancia dos veces desde `BusinessComparisonSection`, replicando el patrón de [kpi-row.tsx](../src/components/dashboard/kpi-row.tsx), que instancia `KPICard` cinco veces con props distintas.

### 3.6 Props principales

`BusinessComparisonSectionProps`:

| Prop | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `b2bCategories` | `TopCategoriesResponse` | sí | Resultado de la llamada con `business_type=B2B`. |
| `b2cCategories` | `TopCategoriesResponse` | sí | Resultado de la llamada con `business_type=B2C`. |
| `facets` | `FacetsResponse \| null` | sí | Fuente de las opciones del selector de categoría. |
| `selectedCategory` | `Category \| null` | sí | `null` = sin filtro de categoría. |
| `onCategoryChange` | `(next: Category \| null) => void` | sí | |
| `loading` | `boolean` (opcional) | no | Patrón `Skeleton` existente. |
| `error` | `string \| null` (opcional) | no | |

`TopCategoriesPanelProps`:

| Prop | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `businessType` | `BusinessType` | sí | `"B2B"` o `"B2C"`. Necesaria porque `CategoryEntry` no la incluye. |
| `entries` | `TopCategoriesResponse` | sí | Ya ordenadas por `total_amount` descendente por la API. |
| `groupTotal` | `number` | sí | Denominador del porcentaje. Se pasa calculado; ver 3.3.4. |
| `loading` | `boolean` (opcional) | no | |

`BusinessIncomeChartProps`: `b2bTotal: number`, `b2cTotal: number`, `loading?: boolean`. **Pendiente de implementación**: tipo de gráfico (recharts `BarChart` es lo natural para dos categorías, pero el proyecto solo usa `LineChart` hoy).

`CategorySelectProps`: `categories: Category[]` (procedentes de `FacetsResponse.categories`), `value: Category | null`, `onChange: (next: Category | null) => void`, `disabled?: boolean`.

### 3.7 Columnas / campos de cada panel

| Campo (etiqueta propuesta) | Origen | Formato |
|---|---|---|
| Category | `CategoryEntry.category` | Cadena del enum. **Pendiente de implementación**: si se muestran etiquetas legibles o el valor crudo; no existe hoy ningún mapa de etiquetas en el proyecto. |
| Total income | `CategoryEntry.total_amount` | `formatCurrency` |
| Share | `total_amount / groupTotal * 100` | `formatPercent`. Calculado en cliente: **la API no devuelve ningún campo de porcentaje**. |

El cálculo del porcentaje debe protegerse contra `groupTotal === 0`, siguiendo el patrón ya presente en [financial-utils.ts](../src/lib/financial-utils.ts) (`income > 0 ? ... : 0`). **Pendiente de implementación**: si esa función auxiliar se añade a `financial-utils.ts` o vive en el componente.

### 3.8 Estados de UI

| Estado | Condición | Comportamiento esperado |
|---|---|---|
| Cargando | alguna de las dos peticiones en vuelo | Ambos paneles y el gráfico en `Skeleton`. |
| Ambos grupos con datos | las dos respuestas no vacías | Paneles en paralelo y gráfico comparativo. |
| Un grupo vacío | una respuesta `[]` | Ese panel muestra su estado vacío; el otro se renderiza normal. El gráfico sigue mostrándose con el grupo vacío a cero. |
| Ambos grupos vacíos | ambas `[]` | Estado vacío en ambos paneles y en el gráfico, reutilizando el literal `No data available to display`. La sección **no** se oculta. |
| Menos de 5 categorías | `entries.length < 5` | Comportamiento normal, no un error. Es el caso real con los datos actuales (2 categorías). |
| Categoría seleccionada sin resultados | filtro que no coincide con ninguna fila | Estado vacío con indicación de que el filtro no produce resultados. |
| Rango de fechas activo | filtro de la funcionalidad 1 | Las dos llamadas envían los mismos `start_date`/`end_date`. |
| Error parcial | falla una de las dos llamadas | **Pendiente de implementación**: mostrar el panel disponible con el otro en error, u ocultar la sección entera. |

### 3.9 Comportamiento ante datos vacíos

`[]` con HTTP 200 es válido y esperable, especialmente con un rango de fechas estrecho. Nunca debe interpretarse como error. El total del grupo será `0` y el porcentaje debe mostrarse como `0` en lugar de `NaN`.

### 3.10 Comportamiento ante errores de API

- 422 posible si se envía `limit` fuera de `1..20` o un `operation_type` no válido; con `TopCategoriesLimit` de Fase 2 el primer caso queda bloqueado en tiempo de compilación.
- Fallo de red: mensaje de error dentro de la sección, sin afectar a KPIs ni charts.
- Un fallo en `facets` deja el `CategorySelect` sin opciones: en ese caso debe deshabilitarse, **nunca** rellenarse con una lista hardcodeada.

### 3.11 Relación con los tipos de Fase 2

- Params de cada llamada: `TopCategoriesParams` (extiende `DateRangeFilter`), con `operation_type: "income"`, `limit: 5` (dentro de `TopCategoriesLimit`) y `business_type`.
- Defaults del backend: `TOP_CATEGORIES_PARAM_DEFAULTS` (`operation_type: "outcome"`, `limit: 5`). Ojo: el default de `operation_type` es `outcome`, así que esta funcionalidad **debe enviarlo explícitamente** como `income`.
- Respuestas: `TopCategoriesResponse` / `CategoryEntry`.
- Selector y grupos: `Category` y `BusinessType`, con los valores tomados en runtime de `FacetsResponse`.

---

## 4. Resumen de decisiones pendientes

| # | Pendiente | Tipo | Funcionalidad |
|---|---|---|---|
| 1 | Selector de fecha nativo vs. componente propio | Implementación | 1 |
| 2 | Ubicación del filtro: dentro de `DashboardHeader` o adyacente | Implementación | 1 |
| 3 | Colisión de nombre `DateRangeFilter` (componente vs. tipo) | Implementación | 1 |
| 4 | Bloquear la petición con rango invertido o dejar que devuelva `[]` | Implementación | 1 |
| 5 | Granularidad de los estados de error (uno global vs. uno por sección) | Implementación | 1, 2, 3 |
| 6 | Unificar `src/lib/financial-types.ts` con `specs/api-types.ts` o mantener duplicación | Implementación | 1 |
| 7 | "Media móvil de 3 periodos" vs. `baseline_average` acumulativo del backend | **Producto** | 2 |
| 8 | Exponer o no `group_by` al usuario | Implementación | 2 |
| 9 | `step` y tipo de control del threshold | Implementación | 2 |
| 10 | Extraer o no `AlertsThresholdControl` a archivo propio | Implementación | 2 |
| 11 | Distinguir "sin anomalías" de "sin datos en el rango" | Implementación | 2 |
| 12 | Qué filtra realmente el selector de categoría (el endpoint no acepta `category`) | **Producto** | 3 |
| 13 | Denominador del porcentaje: suma de filas devueltas vs. total real del grupo | **Producto** | 3 |
| 14 | Fuente del total B2B/B2C para el gráfico (`categories/top` sumado vs. `summary`) | Implementación | 3 |
| 15 | Sección dentro del dashboard vs. página con router | **Producto** | 3 |
| 16 | Tipo de gráfico comparativo (el proyecto solo usa `LineChart` hoy) | Implementación | 3 |
| 17 | Etiquetas legibles para los valores de `Category` | Implementación | 3 |
| 18 | Ubicación del cálculo de porcentaje (`financial-utils.ts` vs. componente) | Implementación | 3 |
| 19 | Primitivas de UI a crear: `input`, `table`, `select` | Implementación | 1, 2, 3 |

---

## 5. Fuera del alcance de esta especificación

- Implementación de componentes React.
- Implementación de las llamadas a la API y de la construcción de query strings.
- Modificaciones en `frontend/src/`.
- Tests.
