/**
 * Tipos de los parámetros de query de la API financiera.
 *
 * Fuente única de verdad: el contrato OpenAPI servido por el backend en
 * http://localhost:8000/openapi.json (documentado en http://localhost:8000/docs).
 *
 * Todos los parámetros modelados aquí son de query (`in: "query"`). Ninguno de
 * los endpoints cubiertos declara parámetros de path, header ni body.
 */

import type {
  BusinessType,
  Category,
  GroupBy,
  ISODateString,
  OperationType,
} from "./api-types";

/**
 * Rango de fechas compartido por `/api/metrics`, `/api/metrics/alerts` y
 * `/api/metrics/categories/top`.
 *
 * Ambos parámetros son opcionales (`required: false`, sin `default`): omitirlos
 * equivale a no filtrar. El filtro del backend es inclusivo en ambos extremos.
 * Un rango invertido (`start_date` > `end_date`) devuelve HTTP 200 con lista vacía.
 */
export interface DateRangeFilter {
  start_date?: ISODateString | null;
  end_date?: ISODateString | null;
}

/** Parámetros de `GET /api/metrics`. Este endpoint NO acepta `business_type`. */
export interface MetricsParams extends DateRangeFilter {
  category?: Category;
  operation_type?: OperationType;
}

/**
 * `GET /api/metrics/facets` no acepta ningún parámetro: la operación no declara
 * `parameters` en OpenAPI.
 */
export type FacetsParams = Record<string, never>;

/**
 * Parámetros de `GET /api/metrics/alerts`.
 *
 * `threshold` es un ratio decimal, no un porcentaje (`0.3` = +30 %), con
 * `minimum: 0`. La comparación en el backend es estrictamente mayor que el umbral.
 */
export interface AlertsParams extends DateRangeFilter {
  threshold?: number;
  group_by?: GroupBy;
  business_type?: BusinessType;
}

/** Valores por defecto que aplica el backend cuando el parámetro se omite. */
export const ALERTS_PARAM_DEFAULTS = {
  threshold: 0.3,
  group_by: "month",
} as const satisfies Required<Pick<AlertsParams, "threshold" | "group_by">>;

/** Restricción `minimum: 0` de `threshold`. */
export const ALERTS_THRESHOLD_MIN = 0;

/**
 * Valores permitidos por `limit` en `/api/metrics/categories/top`
 * (`type: integer`, `minimum: 1`, `maximum: 20`).
 */
export type TopCategoriesLimit =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20;

/**
 * Parámetros de `GET /api/metrics/categories/top`.
 *
 * `limit` es un máximo, no un tamaño garantizado: la respuesta puede tener menos
 * elementos. Omitir `business_type` devuelve el agregado, no un desglose; la
 * comparativa B2B vs B2C requiere dos llamadas.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  operation_type?: OperationType;
  limit?: TopCategoriesLimit;
  business_type?: BusinessType;
}

/** Valores por defecto que aplica el backend cuando el parámetro se omite. */
export const TOP_CATEGORIES_PARAM_DEFAULTS = {
  operation_type: "outcome",
  limit: 5,
} as const satisfies Required<
  Pick<TopCategoriesParams, "operation_type" | "limit">
>;
