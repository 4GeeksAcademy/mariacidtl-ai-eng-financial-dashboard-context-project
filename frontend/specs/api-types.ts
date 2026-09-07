/**
 * Tipos de respuesta de la API financiera.
 *
 * Fuente única de verdad: el contrato OpenAPI servido por el backend en
 * http://localhost:8000/openapi.json (documentado en http://localhost:8000/docs)
 * y los modelos Pydantic de `backend/app/routes.py`.
 *
 * No añadir campos que no existan en OpenAPI.
 */

/** Fecha ISO 8601 sin hora, formato `YYYY-MM-DD` (OpenAPI: `type: string, format: date`). */
export type ISODateString = string;

/** OpenAPI: enum `["income", "outcome"]`. */
export type OperationType = "income" | "outcome";

/** OpenAPI: enum `["B2B", "B2C"]`. */
export type BusinessType = "B2B" | "B2C";

/** OpenAPI: enum `["suppliers", "sales", "operational", "administrative", "others"]`. */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/** OpenAPI: enum `["day", "week", "month"]` (parámetro `group_by`). */
export type GroupBy = "day" | "week" | "month";

/**
 * Elemento de `GET /api/metrics`, `GET /api/metrics/b2b` y `GET /api/metrics/b2c`.
 * Schema OpenAPI: `FinancialMovement`. Todos los campos son `required`.
 */
export interface FinancialMovement {
  create_date: ISODateString;
  amount: number;
  operation_type: OperationType;
  category: Category;
  business_type: BusinessType;
}

/** Respuesta de `GET /api/metrics`: array de movimientos. */
export type MetricsResponse = FinancialMovement[];

/**
 * Respuesta de `GET /api/metrics/facets`.
 * Schema OpenAPI: `MetricsFacets` (objeto único, no array). Todos los campos son `required`.
 *
 * Verificado: los arrays llegan ordenados alfabéticamente, no en el orden de
 * declaración del enum. `min_date` / `max_date` dependen de `date.today()` en el
 * backend, por lo que no son valores fijos.
 */
export interface FacetsResponse {
  operation_types: OperationType[];
  business_types: BusinessType[];
  categories: Category[];
  min_date: ISODateString;
  max_date: ISODateString;
}

/**
 * Elemento de `GET /api/metrics/alerts`.
 * Schema OpenAPI: `MetricsAlert`. Todos los campos son `required`.
 *
 * `period` es una cadena cuyo formato depende del parámetro `group_by`:
 * `YYYY-MM-DD` (day), `YYYY-Www` (week) o `YYYY-MM` (month). OpenAPI solo
 * declara `type: string`, sin `format` ni `pattern`.
 *
 * `increase_ratio` es un ratio decimal, no un porcentaje (`0.7353` = +73,53 %).
 */
export interface AlertEntry {
  period: string;
  outcome_total: number;
  baseline_average: number;
  increase_ratio: number;
}

/** Respuesta de `GET /api/metrics/alerts`: array, posiblemente vacío. */
export type AlertsResponse = AlertEntry[];

/**
 * Elemento de `GET /api/metrics/categories/top`.
 * Schema OpenAPI: `TopCategoryItem`. Todos los campos son `required`.
 *
 * El schema NO incluye `business_type`: al comparar B2B vs B2C el cliente debe
 * recordar con qué valor de `business_type` se hizo cada llamada.
 */
export interface CategoryEntry {
  category: Category;
  operation_type: OperationType;
  total_amount: number;
}

/**
 * Respuesta de `GET /api/metrics/categories/top`: array ordenado por
 * `total_amount` descendente. Su longitud puede ser menor que `limit`.
 */
export type TopCategoriesResponse = CategoryEntry[];

/**
 * Cuerpo de error de validación de FastAPI (HTTP 422).
 * Schemas OpenAPI: `HTTPValidationError` y `ValidationError`.
 */
export interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
  /** OpenAPI declara `input` sin `type`: su forma no está especificada. */
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface HTTPValidationError {
  detail?: ValidationErrorItem[];
}
