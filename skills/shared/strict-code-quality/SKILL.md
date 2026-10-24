---
name: strict-code-quality
description: Cero deuda técnica, cero type sniffing, sin casts inseguros, concurrencia CAS (version), semántica RFC 9110 y límites de complejidad.
---

# Calidad Estricta de Código y Eliminación de Deuda Técnica

Esta regla define los estándares técnicos no negociables para el desarrollo y refactorización en TypeScript y Python. El objetivo es erradicar la deuda técnica oculta, los errores silenciosos y los parches frágiles.

---

## 1. Integridad de Tipos y Contratos

1. **Cero Type Sniffing**:
   - ❌ `if (typeof x === 'object' && x !== null && 'id' in x)` para adivinar contratos rotos o tipos incompletos.
   - ✅ Diseñar contratos explícitos con uniones discriminadas o esquemas de validación en tiempo de ejecución (Zod / Pydantic).
2. **Cero Type Casts Inseguros**:
   - ❌ `as any`, `as never`, `x as unknown as TargetType`.
   - ✅ Tipado estricto en parámetros y retornos. Si los datos provienen del exterior (I/O, IPC, red), tipar como `unknown` y parsear formalmente.
3. **Cero Fallbacks Silenciosos**:
   - Si un contrato o argumento obligatorio no es válido, **no** proporcionar un valor por defecto que disfrace la inconsistencia. Reportar o lanzar un error tipado de dominio.
4. **Imports Explícitos y de Tipos**:
   - ✅ Usar siempre alias de ruta `@/...`, **NUNCA** rutas relativas anidadas (`../../..`).
   - ✅ Usar `import type { ... }` para tipos e interfaces en TypeScript.
   - ✅ Usar `pnpm` sobre `npm` para cualquier script o comando (`pnpm run ...`).

---

## 2. Concurrencia y Control de Versiones Optimista (CAS)

En cualquier operación de mutación de base de datos (`update`, `softDelete`, `hardDelete`):
- El campo `version` (entero incremental) es **estrictamente obligatorio**.
- La sentencia SQL debe validar:
  ```sql
  UPDATE table_name
  SET field = ?, version = version + 1, updated_at = ?
  WHERE id = ? AND version = ?;
  ```
- Si las filas afectadas son 0, lanzar inmediatamente un conflicto de concurrencia (**409 Conflict** / `CONCURRENCY_CONFLICT`).

---

## 3. Semántica de Respuestas y Errores (RFC 9110)

- **Conflicto de Unicidad**:
  - `UNIQUE constraint failed` en SQLite / PostgreSQL $\rightarrow$ Siempre **409 Conflict** con código `ALREADY_EXISTS` (nunca 400 Bad Request).
- **Recurso No Encontrado**:
  - **404 Not Found** con código `NOT_FOUND`.
- **Validación Fallida**:
  - **422 Unprocessable Entity** o **400 Bad Request** con el desglose exacto de los campos inválidos.

---

## 4. Límites de Complejidad y Modularidad

- **Límite de Líneas**: Máximo 50 líneas por función. Si una función supera este límite, es señal obligatoria de refactorización en funciones puras o sub-procedimientos.
- **Límite de Anidación**: Máximo 3 niveles de indentación (`if`, `for`, `try`). Si supera 3 niveles, aplicar cláusulas de guarda (*early returns*) o extraer a funciones pequeñas.
- **Responsabilidad Única**: Una función debe realizar una sola operación clara y comprobable.
