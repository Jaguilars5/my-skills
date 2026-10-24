---
name: mcp-project-brain
description: Mapeo y memoria canónica del proyecto mediante MCP Brain y grafo project_memory.json. Protocolo pre-tarea de consulta y post-tarea de registro atómico.
---

# Memoria Canónica y Protocolo del Project Brain: `mcp-project-brain`

Cualquier proyecto de ingeniería avanzado debe mantener un cerebro o memoria técnica estructurada (**Project Brain**) accesible mediante herramientas MCP o directamente en `./agents/brain/project_memory.json` (o `.antigravity/brain.json`).

El objetivo es garantizar que los agentes de IA no sufran amnesia de sesión, comprendan las dependencias cruzadas y mantengan un registro auditable del progreso y la deuda técnica.

---

## 1. Protocolo Pre-Tarea Obligatorio (Lectura y Verificación)

Antes de planificar, refactorizar o modificar cualquier archivo del proyecto:

1. **Consulta del Brain**:
   - Invocar la herramienta MCP `query_brain` o leer `./agents/brain/project_memory.json`.
   - Verificar el estado actual del módulo objetivo en `master_module_index` (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
2. **Evaluación de Dependencias**:
   - Comprobar que los módulos o tablas de base de datos predecesoras requeridas existan y estén en estado funcional.
3. **Revisión de Invariantes de Dominio**:
   - Verificar reglas críticas de negocio en `domain_invariants` (ej. segregación de funciones, no alteración de tablas históricas, validaciones criptográficas).

---

## 2. Protocolo Post-Tarea Obligatorio (Registro y Sincronización)

Al culminar cualquier hito, refactorización o corrección de bugs:

1. **Registro de Entidades y Relaciones**:
   - Invocar `record_entity` y `record_relation`, o actualizar `./agents/brain/project_memory.json`.
   - Registrar con precisión:
     - **Archivos creados o modificados**: Rutas relativas exactas.
     - **Contratos expuestos**: Nombres de esquemas Zod, clases de dominio, rutas REST, canales IPC y eventos Socket.IO con sus permisos RBAC exigidos.
     - **Tablas y modelos**: Entidades de base de datos modificadas o creadas.
2. **Registro de Deuda Técnica o de Seguridad**:
   - Si se detecta una vulnerabilidad o parche temporal que no se pueda resolver inmediatamente en la sesión, registrar obligatoriamente como `TechnicalDebt` o `SecurityDebt` con su severidad y propuesta de mitigación.
3. **Preservación de la Integridad JSON**:
   - Actualizar el campo `last_updated` con la fecha y hora actual en formato ISO.
   - Validar que el archivo resultante sea un JSON estrictamente válido.

---

## 3. Estructura Estándar de `project_memory.json`

```json
{
  "project_name": "MyProject",
  "version": "1.0.0",
  "last_updated": "2026-10-24T00:00:00.000Z",
  "master_module_index": {
    "MOD-01-AUTH": {
      "name": "Módulo de Autenticación y RBAC",
      "status": "COMPLETED",
      "files": ["src/features/auth/auth.service.ts", "src/features/auth/auth.types.ts"],
      "contracts": ["POST /api/v1/auth/login", "POST /api/v1/auth/refresh"]
    }
  },
  "database_schema": {
    "tables": ["users", "sessions", "audit_logs"]
  },
  "technical_debt": []
}
```
