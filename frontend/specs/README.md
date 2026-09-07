# Contrato de datos/API para especificaciones frontend

## 1. Propósito

Este directorio contiene las especificaciones frontend de las nuevas funcionalidades solicitadas para el dashboard financiero. Estos documentos describen contratos, tipos y decisiones pendientes para una futura implementación.

Este directorio todavía **no constituye una implementación**: no define componentes React ejecutables, no construye URLs, no hace `fetch`, no gestiona estado de UI y no cambia el backend.

## 2. Fuentes de verdad

Las fuentes de verdad para este contrato son:

- OpenAPI/backend verificado en Fase 1 mediante `http://localhost:8000/docs` y `http://localhost:8000/openapi.json`, con respaldo en [../../backend/app/routes.py](../../backend/app/routes.py).
- Tipos de respuesta y parámetros de Fase 2: [api-types.ts](api-types.ts) y [param-types.ts](param-types.ts).
- Especificación de componentes de Fase 3: [components.md](components.md).

Cuando un requisito del PM no coincide con el comportamiento real de la API, este documento registra ambas cosas y deja la decisión como pendiente. No se inventan endpoints, parámetros, campos de respuesta ni transformaciones no respaldadas por OpenAPI o por las conclusiones ya verificadas.

## 3. Contrato de GET /api/metrics/facets

Método y ruta: `GET /api/metrics/facets`.

Parámetros: ninguno. OpenAPI no declara `parameters` para esta operación y [../../backend/app/routes.py](../../backend/app/routes.py) define `get_metrics_facets()` sin argumentos de query.

Respuesta: `FacetsResponse`, objeto único.

| Campo | Tipo frontend | Significado |
|---|---|---|
| `operation_types` | `OperationType[]` | Valores disponibles para `operation_type`: `income`, `outcome`. |
| `business_types` | `BusinessType[]` | Valores disponibles para `business_type`: `B2B`, `B2C`. |
| `categories` | `Category[]` | Valores disponibles de categoría: `suppliers`, `sales`, `operational`, `administrative`, `others`. |
| `min_date` | `ISODateString` | Fecha mínima presente en el dataset generado por el backend. Formato `YYYY-MM-DD`. |
| `max_date` | `ISODateString` | Fecha máxima presente en el dataset generado por el backend. Formato `YYYY-MM-DD`. |

`min_date` y `max_date` proceden del dataset/backend y no deben hardcodearse. En el backend actual las fechas dependen de `date.today()` dentro de la generación de datos simulados, así que pueden cambiar con el tiempo aunque la semilla sea fija.

Comportamiento ante errores:

- Un error de red o servidor impide conocer los límites disponibles; la futura UI no debe inventar fechas alternativas.
- La ausencia de `facets` no impide necesariamente consultar `/api/metrics`, pero sí impide mostrar límites verificados junto al filtro.
- Con el generador actual no se espera un dataset vacío para `facets`. El caso de `build_metrics_facets` con lista vacía no está verificado como contrato estable.

## 4. Contrato de GET /api/metrics

Método y ruta: `GET /api/metrics`.

Parámetros opcionales:

| Parámetro | Tipo frontend | OpenAPI | Valores permitidos / formato |
|---|---|---|---|
| `start_date` | `ISODateString \| null` dentro de `MetricsParams` | opcional; string `format: date` o `null` | `YYYY-MM-DD` |
| `end_date` | `ISODateString \| null` dentro de `MetricsParams` | opcional; string `format: date` o `null` | `YYYY-MM-DD` |
| `category` | `Category` | opcional | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `operation_type` | `OperationType` | opcional | `income`, `outcome` |

Este endpoint **no acepta `business_type`**. Aunque cada elemento de respuesta incluye `business_type`, OpenAPI no declara ese parámetro para `/api/metrics`.

Respuesta: `MetricsResponse`, equivalente a `FinancialMovement[]`.

| Campo de cada `FinancialMovement` | Tipo frontend | Significado |
|---|---|---|
| `create_date` | `ISODateString` | Fecha del movimiento en formato `YYYY-MM-DD`. |
| `amount` | `number` | Importe del movimiento. |
| `operation_type` | `OperationType` | `income` u `outcome`. |
| `category` | `Category` | Categoría del movimiento. |
| `business_type` | `BusinessType` | `B2B` o `B2C`. |

Comportamiento de fechas:

- `start_date` y `end_date` son opcionales e independientes.
- Si se omiten ambos, se consulta todo el dataset disponible.
- Si se envía solo `start_date`, el filtro aplica desde esa fecha inclusive.
- Si se envía solo `end_date`, el filtro aplica hasta esa fecha inclusive.
- Si se envían ambos, el rango es inclusivo en ambos extremos.
- Si `start_date > end_date`, la API responde HTTP 200 con `[]`; no responde 422.

Errores 422 relevantes:

- Fecha con formato inválido, por ejemplo no compatible con `YYYY-MM-DD`.
- `category` fuera del enum permitido.
- `operation_type` fuera del enum permitido.

## 5. Contrato de GET /api/metrics/alerts

Método y ruta: `GET /api/metrics/alerts`.

Parámetros:

| Parámetro | Tipo frontend | Obligatorio | Default real API | Restricción real API |
|---|---|---|---|---|
| `threshold` | `number` | no | `0.3` | `minimum: 0` |
| `group_by` | `GroupBy` | no | `month` | `day`, `week`, `month` |
| `start_date` | `ISODateString \| null` | no | sin default explícito | string `format: date` o `null` |
| `end_date` | `ISODateString \| null` | no | sin default explícito | string `format: date` o `null` |
| `business_type` | `BusinessType` | no | sin default explícito | `B2B`, `B2C` |

`threshold` es un ratio decimal, no un porcentaje. Enviar `0.3` significa +30 %. No debe convertirse a porcentaje al enviarlo. Para mostrar `increase_ratio` como porcentaje en UI, la futura implementación deberá multiplicar por 100 antes de usar un formateador porcentual.

Respuesta: `AlertsResponse`, equivalente a `AlertEntry[]`.

| Campo de cada `AlertEntry` | Tipo frontend | Significado |
|---|---|---|
| `period` | `string` | Periodo agregado. Su formato depende de `group_by`; OpenAPI solo declara `string`, sin `format` ni `pattern`. |
| `outcome_total` | `number` | Total de gastos registrado en ese periodo. |
| `baseline_average` | `number` | Media acumulativa expansiva de los periodos anteriores usada como baseline por el backend. |
| `increase_ratio` | `number` | Incremento relativo frente al baseline, en ratio decimal. |

Comportamientos relevantes:

- Si no hay alertas, la respuesta normal es HTTP 200 con `[]`.
- La condición de detección es estricta: se incluye una alerta solo cuando `increase_ratio > threshold`.
- La primera fila agregada nunca puede ser alerta porque el backend aún no tiene periodos anteriores para calcular baseline.
- Un `threshold` negativo produce 422.
- Un `group_by` fuera de `day`, `week` o `month` produce 422.

Discrepancia PM/API pendiente:

La API **no proporciona una media móvil de 3 periodos**. El campo disponible, `baseline_average`, es una media acumulativa expansiva de todos los periodos anteriores, calculada y usada por el backend para decidir qué filas son anomalías. Esta discrepancia está identificada en [components.md](components.md) y queda como decisión pendiente; este contrato no la resuelve por cuenta propia.

## 6. Contrato de GET /api/metrics/categories/top

Método y ruta: `GET /api/metrics/categories/top`.

Parámetros:

| Parámetro | Tipo frontend | Obligatorio | Default real API | Restricción real API |
|---|---|---|---|---|
| `operation_type` | `OperationType` | no | `outcome` | `income`, `outcome` |
| `limit` | `TopCategoriesLimit` | no | `5` | entero entre `1` y `20` |
| `start_date` | `ISODateString \| null` | no | sin default explícito | string `format: date` o `null` |
| `end_date` | `ISODateString \| null` | no | sin default explícito | string `format: date` o `null` |
| `business_type` | `BusinessType` | no | sin default explícito | `B2B`, `B2C` |

Este endpoint **no acepta `category`**. OpenAPI no declara ese parámetro para `/api/metrics/categories/top`.

Respuesta: `TopCategoriesResponse`, equivalente a `CategoryEntry[]`.

| Campo de cada `CategoryEntry` | Tipo frontend | Significado |
|---|---|---|
| `category` | `Category` | Categoría agregada. |
| `operation_type` | `OperationType` | Tipo de operación usado para el agregado. |
| `total_amount` | `number` | Suma de importes de esa categoría para el filtro aplicado. |

Comportamientos relevantes:

- Los resultados llegan ordenados por `total_amount` descendente.
- `limit=5` es un máximo, no garantiza cinco elementos. La respuesta puede contener menos filas.
- La respuesta no incluye `business_type`; el cliente debe asociarla al parámetro usado en la llamada.
- `limit=0` o `limit=21` produce 422.
- Para la funcionalidad B2B vs B2C de ingresos, `operation_type` debe enviarse explícitamente como `income`, porque el default real del endpoint es `outcome`.

## 7. Contrato para B2B vs B2C

La comparación B2B vs B2C no tiene un endpoint único. La futura implementación debe diferenciar los grupos mediante dos llamadas a `GET /api/metrics/categories/top`:

| Grupo | Parámetros necesarios |
|---|---|
| B2B | `operation_type=income`, `limit=5`, `business_type=B2B`, y el rango de fechas activo si existe |
| B2C | `operation_type=income`, `limit=5`, `business_type=B2C`, y el rango de fechas activo si existe |

Como `CategoryEntry` no contiene `business_type`, el cliente debe conservar el contexto de cada respuesta: los datos recibidos de la llamada con `business_type=B2B` pertenecen a B2B, y los de la llamada con `business_type=B2C` pertenecen a B2C.

No existe ni debe inventarse un endpoint como `/api/metrics/b2b-vs-b2c`, `/api/metrics/business-comparison` o equivalente. Tampoco debe asumirse que omitir `business_type` devuelve un desglose; omitirlo devuelve el agregado.

## 8. Reglas de construcción de query params

La futura implementación debe construir query params conceptualmente con estas reglas:

- Enviar solo parámetros que tengan valor real.
- No enviar `undefined`.
- Si un estado permite `null`, tratarlo como ausencia de valor salvo que el endpoint defina explícitamente otro comportamiento. En los contratos actuales, `null` en los tipos refleja OpenAPI, pero la forma práctica del query string debe evitar strings como `start_date=null`.
- Enviar fechas únicamente en formato `YYYY-MM-DD`.
- Enviar `threshold` como ratio decimal: `0.3` significa +30 %. No convertirlo a `30` ni añadir `%`.
- Enviar `limit` como entero dentro de `1..20`.
- Enviar enums únicamente con valores definidos por los tipos `OperationType`, `BusinessType`, `Category` y `GroupBy`.
- No enviar parámetros que el endpoint no soporta: por ejemplo, no enviar `business_type` a `/api/metrics` y no enviar `category` a `/api/metrics/categories/top`.
- No depender de valores hardcodeados para `min_date`, `max_date` ni opciones de facets.

Este documento no define código para construir URLs.

## 9. Mapeo requisito → endpoint → tipo

| Necesidad PM | Funcionalidad | Endpoint | Parámetros | Tipo de respuesta |
|---|---|---|---|---|
| Filtro de fechas sobre el dashboard | Filtro por rango de fechas | `GET /api/metrics` | `start_date`, `end_date`; opcionalmente `category`, `operation_type` si se usan en futuras extensiones | `MetricsResponse` |
| Límites del dataset para mostrar cerca de los inputs | Filtro por rango de fechas | `GET /api/metrics/facets` | ninguno | `FacetsResponse` |
| Alertas de anomalías | Tabla de alertas | `GET /api/metrics/alerts` | `threshold`, `group_by`, `start_date`, `end_date`, `business_type` | `AlertsResponse` |
| Top categorías B2B | Comparación B2B vs B2C | `GET /api/metrics/categories/top` | `operation_type=income`, `limit=5`, `business_type=B2B`, `start_date`, `end_date` | `TopCategoriesResponse` |
| Top categorías B2C | Comparación B2B vs B2C | `GET /api/metrics/categories/top` | `operation_type=income`, `limit=5`, `business_type=B2C`, `start_date`, `end_date` | `TopCategoriesResponse` |
| Selector de categorías | Comparación B2B vs B2C | `GET /api/metrics/facets` | ninguno | `FacetsResponse.categories` |

Para el selector de categorías, `facets` proporciona los valores permitidos, pero `/api/metrics/categories/top` no acepta `category`. Por tanto, el comportamiento de filtrado de ese selector sigue siendo una decisión pendiente y no se resuelve en este contrato.

## 10. Errores y estados vacíos

Casos normales:

- HTTP 200 con `[]` en `/api/metrics`: rango sin movimientos o rango invertido (`start_date > end_date`). Es un estado vacío de datos, no un error HTTP.
- HTTP 200 con `[]` en `/api/metrics/alerts`: no hay anomalías para el rango, grupo y threshold seleccionados. Es un estado normal.
- HTTP 200 con menos de `limit` elementos en `/api/metrics/categories/top`: normal; `limit` es un máximo.
- Una categoría seleccionada que no produzca filas es un caso de "sin resultados" si el selector se aplica en cliente. No es un error de API.

Errores de validación:

- HTTP 422 por fechas con formato inválido.
- HTTP 422 por enums fuera de los valores permitidos.
- HTTP 422 por `threshold < 0` en `/api/metrics/alerts`.
- HTTP 422 por `limit < 1` o `limit > 20` en `/api/metrics/categories/top`.

Errores de red/servidor:

- Fallos de conexión, timeouts o respuestas 5xx deben tratarse como errores de API.
- Un fallo en `facets` impide conocer límites/opciones verificadas; no autoriza a inventarlas.
- Un fallo en una sección no implica necesariamente que todo el dashboard deba quedar inutilizable. La granularidad exacta del error pertenece a la futura implementación.

Diferencia entre "sin datos" y "sin resultados":

- "Sin datos" significa que el backend devuelve una lista vacía para el dataset o filtro principal.
- "Sin resultados" significa que hay dataset/facets disponibles, pero una vista concreta no tiene filas que mostrar bajo los filtros actuales.
- Ambos casos pueden ser HTTP 200 y deben manejarse como estados vacíos explícitos, no como errores silenciosos.

## 11. Decisiones pendientes

Decisiones abiertas relacionadas con datos/API, tomadas de [components.md](components.md):

| Decisión pendiente | Motivo contractual |
|---|---|
| Resolver la discrepancia entre "media móvil de 3 periodos" y `baseline_average` acumulativo | La API no entrega la media móvil pedida por PM y el backend usa otro criterio para detectar alertas. |
| Decidir si `group_by` se expone al usuario o se fija en `month` | La API soporta `day`, `week`, `month`; el requisito PM no fija granularidad. |
| Distinguir en UI/datos "sin anomalías" de "sin datos en el rango" | Ambos pueden llegar como HTTP 200 con `[]` desde `/api/metrics/alerts`. |
| Definir qué filtra el selector de categoría | `facets` entrega categorías, pero `/api/metrics/categories/top` no acepta `category`. |
| Definir el denominador del porcentaje de categorías | La API no devuelve porcentaje; puede calcularse sobre suma de filas devueltas o total real del grupo. |
| Elegir la fuente del total B2B/B2C para el gráfico | No existe endpoint único; sumar `categories/top` puede depender de `limit`, mientras otros endpoints implicarían otro contrato. |
| Decidir si el rango invertido bloquea la consulta o se deja llegar a la API | `/api/metrics` responde 200 con `[]`; la futura implementación puede validar localmente antes de consultar. |
| Definir la granularidad de errores por sección | Los endpoints pueden fallar de forma independiente; la estrategia afecta al contrato de estado de datos. |
| Decidir si se unifican los tipos de `frontend/src/lib/financial-types.ts` con `frontend/specs/api-types.ts` | Existe duplicación manual entre tipos usados por la app actual y tipos de contrato. |

No se repiten decisiones puramente visuales o de estructura interna de componentes.

## 12. Fuera de alcance

Este documento no implementa:

- Funciones de `fetch`.
- Construcción real de URLs o `URLSearchParams`.
- React, componentes, hooks o estado de UI.
- Cambios en `frontend/src/`.
- Cambios en el backend.
- Tests.
- Commit o push.
