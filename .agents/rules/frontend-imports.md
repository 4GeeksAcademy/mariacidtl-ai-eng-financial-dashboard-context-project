# Reglas: alias de imports `@` en el frontend

Alcance: aplica a imports dentro de `frontend/src/`. No aplica al backend, que no tiene un mecanismo equivalente.

## Uso del alias

- Debes: usar el alias `@/...` para imports entre carpetas distintas de `src` (por ejemplo, un componente en `components/dashboard` importando algo de `lib`, o `App.tsx` importando de `components`/`lib`).
- Puedes: usar rutas relativas (`./archivo`) para imports dentro del mismo directorio, como ya ocurre en `frontend/src/lib/financial-utils.ts` al importar tipos de `./financial-types`.
- No debes: asumir que el alias `@` debe usarse siempre sin excepción; el propio código usa rutas relativas para imports dentro del mismo directorio.
- Evidencia de ambos usos: [frontend/src/components/dashboard/kpi-card.tsx](../../frontend/src/components/dashboard/kpi-card.tsx) (`@/components/ui/card`, `@/lib/utils`), [frontend/src/App.tsx](../../frontend/src/App.tsx) (`@/components/dashboard/...`, `@/lib/financial-utils`), [frontend/src/lib/financial-utils.ts](../../frontend/src/lib/financial-utils.ts) (import relativo `./financial-types`).

## Sincronización de la configuración del alias

- Debes: si necesitas modificar el alias `@` o su destino, actualizarlo simultáneamente en `frontend/vite.config.ts` (`resolve.alias`) y en `frontend/tsconfig.app.json` (`compilerOptions.paths`).
- Motivo: ambos archivos definen el mismo alias en herramientas distintas (bundler de Vite y compilador de TypeScript); modificar solo uno provoca fallos de resolución en tiempo de build o errores de tipos que no reflejan el comportamiento real en ejecución.
- Evidencia: [frontend/vite.config.ts](../../frontend/vite.config.ts), [frontend/tsconfig.app.json](../../frontend/tsconfig.app.json).
