# Reglas: datos simulados del backend y pruebas

Alcance: aplica a `backend/app/routes.py` (función `generate_mock_movements` y su uso de `random`/`date`) y a `backend/tests/`.

## Comportamiento de `generate_mock_movements(seed=42)`

- Debes: tener en cuenta que `generate_mock_movements(seed=42)` es determinista en cantidad de registros (360) y en orden cronológico, pero el rango de fechas generado depende de `date.today()` en el momento de ejecución (a través de `_year_for_month`), por lo que se desplaza con el calendario aunque la semilla sea fija.
- No debes: escribir pruebas o lógica que dependan de fechas absolutas devueltas por esta función (por ejemplo, asumir que el primer movimiento es siempre `2024-01-02`). Verifica en su lugar propiedades relativas: cantidad total, orden cronológico, o que las fechas caen dentro de un rango relativo a `date.today()`.
- Motivo: comprobado ejecutando la función que, en fechas distintas, produce el mismo número de registros y el mismo orden, pero un rango de fechas distinto.
- Evidencia: [backend/app/routes.py](../../backend/app/routes.py), [backend/tests/test_routes.py](../../backend/tests/test_routes.py).

## Efecto colateral de `random.seed(seed)`

- Debes: tener en cuenta que `generate_mock_movements` llama a `random.seed(seed)`, lo cual muta el estado global del módulo `random` de Python para todo el proceso, no solo para esa función.
- No debes: asumir que el estado de `random` fuera de `generate_mock_movements` permanece inalterado después de invocarla, si se añade código nuevo que también use `random` en el mismo proceso (por ejemplo, en el mismo request o en el mismo proceso de tests).
- Motivo: comprobado ejecutando el código: llamar a `generate_mock_movements(seed=42)` cambia el siguiente valor devuelto por `random.random()` en el resto del proceso.
- Evidencia: [backend/app/routes.py](../../backend/app/routes.py).

## Dependencia de `conftest.py` para las pruebas

- No debes: eliminar o mover `backend/tests/conftest.py` sin preservar su efecto de insertar la raíz de `backend` en `sys.path`.
- Si cambias la estructura de carpetas del backend (por ejemplo, mover `app/` a otro nivel), debes: actualizar este mecanismo para que `import app...` siga funcionando en `backend/tests/test_routes.py`.
- Motivo: las pruebas dependen de este ajuste de `sys.path` para importar `app` sin que el proyecto esté instalado como paquete; romperlo hace fallar toda la suite de pytest por errores de import, no por fallos de aserciones.
- Evidencia: [backend/tests/conftest.py](../../backend/tests/conftest.py), [backend/tests/test_routes.py](../../backend/tests/test_routes.py).
