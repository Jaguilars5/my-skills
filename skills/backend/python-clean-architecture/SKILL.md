---
name: python-clean-architecture
description: Estándares modernos en Python: tipado estricto con mypy/typing, gestión con uv/poetry, linting con ruff y testing con pytest.
---

# Clean Architecture y Estándares Modernos en Python: `python-clean-architecture`

Esta regla define los estándares de calidad, tipado estricto y herramientas recomendadas para proyectos desarrollados en Python 3.11+.

---

## 1. Tipado Estricto con `mypy` y Módulo `typing`

- **Tipar Obligatoriamente**: Parámetros de funciones, retornos y atributos de clase.
- **Prohibido el uso de `Any`**: Utilizar `object`, tipos genéricos `TypeVar` o `Union` discriminadas.
- **Protocolos para Inversión de Dependencias (*Protocols*)**:
  ```python
  from typing import Protocol, runtime_checkable

  @runtime_checkable
  class InvoiceRepositoryProtocol(Protocol):
      def get_by_id(self, invoice_id: int) -> Invoice | None:
          ...
      def save(self, invoice: Invoice) -> Invoice:
          ...
  ```
- **Dataclasses Inmutables o Pydantic para Modelos de Dominio**:
  ```python
  from dataclasses import dataclass
  from datetime import datetime

  @dataclass(frozen=True, slots=True)
  class Money:
      amount: float
      currency: str = "USD"
  ```

---

## 2. Herramientas Modernas: `uv`, `ruff` y `pytest`

1. **Gestión de Entornos y Dependencias con `uv`**:
   - Priorizar `uv` o `poetry` sobre `pip` directo para resolver árboles de dependencias con archivos lock reproducibles.
2. **Formateo y Linting con `ruff`**:
   - Reemplazar flake8, black, isort y pylint con `ruff check` y `ruff format`.
   - Reglas innegociables: ordenación de imports automática, detección de variables sin usar y prevención de mutabilidad en argumentos por defecto (`def bad(items=[])`).
3. **Pruebas Automatizadas con `pytest`**:
   - Fixtures desacoplados con ámbito (*scope*) adecuado (`session`, `function`).
   - Mocks estrictos con `unittest.mock` solo en las fronteras de red/disco; preferir implementaciones falsas en memoria (*In-Memory Fakes*) para repositorios.

---

## 3. Manejo Explícito de Excepciones de Dominio

Nunca capturar excepciones genéricas con `except Exception: pass`:

```python
# Definición de jerarquía de errores de dominio:
class DomainError(Exception):
    """Clase base para todos los errores de negocio."""
    pass

class ConcurrencyConflictError(DomainError):
    def __init__(self, entity_id: str, version: int):
        super().__init__(f"Conflicto de concurrencia en entidad {entity_id} con versión {version}.")

class ResourceNotFoundError(DomainError):
    pass
```
