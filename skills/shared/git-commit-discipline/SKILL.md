---
name: git-commit-discipline
description: Estándar de commits semánticos atómicos y documentación del por qué de los cambios en el control de versiones.
---

# Disciplina en Control de Versiones: `git-commit-discipline`

El historial de Git es documentación técnica de primer orden. Esta habilidad asegura que cada commit sea semántico, atómico y explique la razón de la decisión técnica.

---

## 1. Convención de Commits Semánticos (Conventional Commits)

Formato obligatorio:
```text
<tipo>(<alcance opcional>): <descripción concisa en imperativo>

[Cuerpo opcional: contexto del problema y razón de la solución elegida]

[Notas al pie opcionales: BREAKING CHANGE o issue referenciado]
```

### Tipos Permitidos:
- **`feat`**: Nueva funcionalidad para el usuario o API.
- **`fix`**: Corrección de un defecto o bug.
- **`refactor`**: Reorganización de código sin cambiar comportamiento ni añadir features.
- **`perf`**: Optimización de rendimiento o consumo de recursos.
- **`security`**: Mitigación de vulnerabilidades o refuerzo de políticas.
- **`test`**: Añadir o corregir pruebas unitarias/E2E.
- **`chore`**: Tareas de mantenimiento, dependencias o configuración interna.

---

## 2. Reglas Innegociables

1. **Atomicidad**:
   - Cada commit debe resolver una sola cosa.
   - **NUNCA** mezclar cambios de estilo/formato (Prettier/ESLint) con lógica de negocio o correcciones de bugs.
2. **El "Por Qué" sobre el "Qué"**:
   - El código ya muestra *qué* cambió; el mensaje de commit debe explicar *por qué* fue necesario y por qué se descartaron alternativas si la decisión no era obvia.
3. **No Romper el Build**:
   - Todo commit debe compilar, pasar los tests correspondientes y dejar el árbol de trabajo en un estado funcional.
4. **Imperativo en la Primera Línea**:
   - ✅ `feat(ipc): add zod validation for print job payload`
   - ❌ `feat(ipc): added validation` o `feat(ipc): adding validation`
