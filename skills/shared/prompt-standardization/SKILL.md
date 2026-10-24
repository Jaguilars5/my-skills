---
name: prompt-standardization
description: Refinador de requerimientos. Corrección automática de errores ortográficos, estructuración en especificaciones trazables BDD y cierre proactivo de ambigüedades.
---

# Estandarización de Prompts y Refinamiento de Requerimientos

Esta habilidad dota al agente de IA de la capacidad de procesar la entrada del usuario en bruto (incluso con errores tipográficos, redacción coloquial o ideas desordenadas), limpiarla y convertirla en una especificación técnica de ingeniería lista para ejecución.

---

## 1. Responsabilidades del Agente al Ingerir un Prompt

Cuando el usuario introduce una instrucción compleja, nueva feature o reporte de error:

1. **Corrección Sintáctica y Normalización**:
   - Interpretar la intención real corrigiendo mentalmente faltas de ortografía, abreviaciones informales o términos mal escritos (ej. "potsgress" $\rightarrow$ `PostgreSQL`, "regis" $\rightarrow$ `Redis`, "djando" $\rightarrow$ `Django`).
2. **Traducción a Requerimiento Trazable**:
   - Reestructurar el requerimiento en formato claro con:
     - **Objetivo**: Qué necesidad técnica o de negocio se resuelve.
     - **Alcance & Radio de Impacto**: Qué módulos deben tocarse y cuáles quedan intactos.
     - **Criterios de Aceptación (Gherkin / BDD)**: Escenarios `Dado que (Given) -> Cuando (When) -> Entonces (Then)`.
3. **Detección y Cierre de Ambigüedades**:
   - Si faltan detalles (ej. cómo manejar errores, paginación, esquemas de BD, permisos), **formular preguntas directas con opciones recomendadas** antes de asumir.

---

## 2. Plantilla de Especificación de Salida

Cuando un requerimiento necesite formalización previa:

```markdown
### 🎯 Requerimiento Estandarizado: [Nombre Breve de la Tarea]

#### 1. Resumen de la Intención
[Descripción en 2-3 líneas del requerimiento redactado con precisión técnica].

#### 2. Criterios de Aceptación (BDD)
- **Escenario 1: Flujo Exitoso**
  - **Dado que** el usuario autenticado envía el payload válido con `X`.
  - **Cuando** se procesa la solicitud en el endpoint `/api/v1/...`.
  - **Entonces** se persiste en la BD con `version = 1` y retorna HTTP 201 Created.
- **Escenario 2: Conflicto o Error**
  - **Dado que** ya existe un registro con la misma clave única.
  - **Cuando** se intenta la inserción.
  - **Entonces** retorna HTTP 409 Conflict con código `ALREADY_EXISTS`.

#### 3. Preguntas de Clarificación (si existen vacíos técnicos)
1. ¿El borrado del recurso debe ser lógico (`is_deleted = true`) o físico (`DELETE FROM`)?
   - *(Recomendado)*: Borrado lógico con estampas de auditoría.
   - Opción B: Borrado físico en cascada.
```

---

## 3. Reglas de Interacción

- **No redundar**: Si el prompt original del usuario ya era ultra-específico y unívoco, no perder tiempo reescribiéndolo innecesariamente; ir directo a la propuesta de plan (`ask-before-act`).
- **Priorizar claridad sobre burocracia**: La estandarización debe acelerar el desarrollo y evitar malentendidos, no agregar fricción.
