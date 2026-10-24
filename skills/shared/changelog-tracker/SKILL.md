---
name: changelog-tracker
description: Registro continuo y estructurado de cambios en CHANGELOG.md siguiendo Keep a Changelog y Semantic Versioning.
---

# Gestión Disciplinada de Cambios: `changelog-tracker`

Toda adición, refactorización, corrección de errores o parche de seguridad debe quedar documentado en un archivo `CHANGELOG.md` en la raíz del proyecto para preservar la memoria histórica y facilitar revisiones de código.

---

## 1. Estándar de Formato (*Keep a Changelog*)

El archivo `CHANGELOG.md` debe seguir estrictamente [Keep a Changelog](https://keepachangelog.com/) y respetar [Semantic Versioning (SemVer)](https://semver.org/):

```markdown
# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Added
- Nueva funcionalidad o contrato expuesto.

### Changed
- Modificación en el comportamiento o implementación de una característica existente.

### Deprecated
- Funcionalidades marcadas para eliminación futura.

### Removed
- Funcionalidades eliminadas en esta versión.

### Fixed
- Corrección de bugs o errores de validación.

### Security
- Corrección de vulnerabilidades, sanitización de entradas o endurecimiento de permisos.
```

---

## 2. Reglas de Actualización Durante la Sesión

1. **Sección `[Unreleased]` Obligatoria**:
   - Mientras se desarrolla en una rama o sesión, todos los cambios van bajo el encabezado `## [Unreleased]`.
2. **Entradas Concisas y Claras**:
   - Cada viñeta debe indicar el qué y el módulo afectado (ej. `[auth]: Rotación segura de refresh tokens con almacenamiento cifrado`).
3. **Prohibido Mezclar Categorías**:
   - No clasificar un refactor interno como `Added`.
   - No clasificar un fix de seguridad como un simple `Fixed` si mitiga un vector de ataque (`Security`).
4. **Fechas al Publicar Versión**:
   - Al cerrar una versión, convertir `[Unreleased]` a `[X.Y.Z] - YYYY-MM-DD`.
