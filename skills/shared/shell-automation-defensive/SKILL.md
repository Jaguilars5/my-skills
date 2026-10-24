---
name: shell-automation-defensive
description: Automatización robusta en bash/sh con set -euo pipefail, trampas de limpieza, quoting defensivo y compatibilidad Unix/macOS.
---

# Automatización Defensiva en Shell: `shell-automation-defensive`

Los scripts de despliegue, empaquetado, migración o CI deben escribirse con rigor defensivo para evitar ejecuciones parciales silenciosas o corrupción de datos.

---

## 1. Encabezado Obligatorio (*Strict Mode*)

Todo script en bash debe iniciar con:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

- `-e`: Aborta el script inmediatamente si cualquier comando falla (retorna distinto de 0).
- `-u`: Trata el uso de variables no inicializadas como error fatal.
- `-o pipefail`: Asegura que el código de salida de un pipeline sea el del último comando que falló, no del último ejecutado.
- `IFS=$'\n\t'`: Previene problemas de división de palabras accidentales con espacios.

---

## 2. Trampas de Limpieza (*Cleanup Traps*)

Si el script crea archivos temporales, sockets o procesos secundarios, debe garantizar su destrucción al salir, incluso si falla:

```bash
TMP_DIR="$(mktemp -d)"
cleanup() {
  echo "🧹 Limpiando recursos temporales..."
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT INT TERM
```

---

## 3. Quoting y Rutas Portables

1. **Quoting Defensivo**:
   - Encapsular **siempre** variables en comillas dobles: `"${TARGET_PATH}"`.
   - ❌ `rm -rf $DIR/*` (si `$DIR` está vacío o no seteado, borra la raíz del sistema).
   - ✅ `rm -rf "${DIR:?Variable DIR no definida}"/*`
2. **Determinación del Directorio del Script**:
   ```bash
   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
   PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
   ```
3. **Verificación de Binarios Requeridos**:
   ```bash
   for cmd in pnpm node git; do
     command -v "${cmd}" >/dev/null 2>&1 || { echo "❌ Se requiere ${cmd} instalado."; exit 1; }
   done
   ```
