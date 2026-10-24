---
name: ask-before-act
description: Protocolo estricto de confirmación, análisis de impacto y revisión arquitectónica antes de modificar código o ejecutar comandos destructivos.
---

# Protocolo Operativo: Preguntar Antes de Actuar (`ask-before-act`)

Este protocolo es obligatorio y transversal para cualquier agente de IA. Su objetivo es evitar mutaciones no planificadas, daños colaterales entre módulos dependientes y pérdida de tiempo por desalineación con la intención del desarrollador.

---

## 1. Regla Fundamental

> **NUNCA modificar archivos, refactorizar lógica existente ni ejecutar comandos con efectos secundarios destructivos sin presentar primero un plan conciso y obtener la confirmación explícita del usuario.**

### Acciones que Exigen Preguntar Primero:
- Modificar o eliminar archivos existentes en el proyecto.
- Instalar nuevas dependencias o alterar `package.json`, `pnpm-lock.yaml`, `pyproject.toml`, etc.
- Alterar contratos de tipos, interfaces de dominio, DTOs o esquemas de base de datos.
- Ejecutar migraciones o comandos que alteren almacenamiento local o remoto.
- Modificar configuraciones globales del editor, linters o compilador.

---

## 2. Proceso de Revisión Previa (4 Pasos Obligatorios)

Antes de formular la propuesta al usuario, el agente debe:

1. **Inspección de la Estructura Completa del Módulo**:
   - Revisar capas afectadas: `domain`, `infrastructure`, `transport`, `hooks`, `presentation`, `store` y `utils`.
   - No asumir cómo funciona un módulo leyendo únicamente un archivo aislado.
2. **Evaluación de Radio de Impacto (*Blast Radius*)**:
   - Identificar qué otros módulos, componentes o tests dependen de los símbolos o funciones a modificar.
3. **Validación de Reglas de Calidad**:
   - Verificar que la solución propuesta no introduce deuda técnica, tipos inseguros (`any`) ni complejidad innecesaria.
4. **Formulación del Plan**:
   - Resumen claro del cambio propuesto.
   - Lista explícita de archivos a crear, modificar o eliminar.
   - Preguntas clave para cerrar decisiones de diseño ambiguas.

---

## 3. Formato de la Propuesta al Usuario

La propuesta debe ser breve, estructurada y fácil de leer:

```markdown
### 📋 Propuesta de Modificación
- **Objetivo**: [Qué se va a lograr]
- **Archivos Afectados**:
  - `[MODIFICAR]` `src/features/auth/auth.service.ts` (añadir refresh token rotation)
  - `[NUEVO]` `src/features/auth/auth.types.ts`
- **Impacto**: Afecta al interceptor HTTP de sesión y al store de autenticación.
- **¿Deseas que proceda con estos cambios?**
```

---

## 4. Anti-Patrones Prohibidos

- ❌ Empezar a editar archivos directamente ante una petición amplia o vaga.
- ❌ Borrar archivos o vaciar funciones sin avisar explícitamente.
- ❌ Modificar archivos ajenos al alcance de la tarea sin justificación y aviso previo.
- ❌ Hacer suposiciones silenciosas sobre reglas de negocio complejas.
