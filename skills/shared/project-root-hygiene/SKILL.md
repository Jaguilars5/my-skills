---
name: project-root-hygiene
description: Mantenimiento estricto de una raíz de proyecto limpia, minimalista y libre de archivos temporales, backups o scripts sueltos.
---

# Higiene y Orden en la Raíz del Proyecto: `project-root-hygiene`

La raíz de un repositorio profesional debe ser minimalista, clara y contener exclusivamente los manifiestos oficiales de configuración y puntos de entrada documentados.

---

## 1. Lo que está ESTRICTAMENTE PROHIBIDO en la Raíz

- ❌ Archivos de backup o copia temporal: `package.json.bak`, `package.json.epiko-pack-backup`, `test.tmp.js`.
- ❌ Scripts de mantenimiento o migración sueltos: `seed.js`, `fix-db.py`, `migrate.sh` (deben ubicarse dentro de `scripts/`).
- ❌ Volcados SQL o volcados de datos temporales: `dump.sql`, `export.json`, `data.csv`.
- ❌ Notas personales, borradores de tareas o TODOs sueltos: `todo.txt`, `notas.md`.
- ❌ Múltiples variantes de configuración de herramientas si no son necesarias (ej. tener `.prettierrc`, `.prettierrc.json` y `.prettierrc.yaml` al mismo tiempo).

---

## 2. Organización Estándar de Carpetas

Todo recurso debe tener su hogar canónico:

```text
my-project/
├── .vscode/               # Configuraciones del IDE y file nesting
├── docs/                  # Documentación arquitectónica, diagramas y guías
├── scripts/               # Scripts de CI, build, seeds y mantenimiento
├── src/                   # Código fuente de la aplicación
├── test/                  # Pruebas automatizadas globales o E2E
├── .gitignore             # Reglas oficiales de ignorado
├── package.json           # Manifiesto de dependencias del proyecto
├── pnpm-lock.yaml         # Lockfile determinista
├── README.md              # Documentación principal del repositorio
└── CHANGELOG.md           # Registro histórico de cambios
```

---

## 3. Limpieza Automática en Tareas de Refactor

- Al crear un archivo temporal para una prueba o verificación rápida, el agente **debe eliminarlo inmediatamente** antes de finalizar la respuesta o turnar al usuario.
- Si una operación requiere un backup preventivo, debe colocarse dentro de un directorio temporal del sistema operativo o ignorado en `.gitignore` (`/tmp/` o `.temp/`), nunca en la raíz del repositorio.
