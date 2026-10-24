---
name: vscode-file-nesting
description: Configuración avanzada de explorer.fileNesting.patterns en VS Code y Cursor para agrupar visualmente archivos secundarios.
---

# Anidación Inteligente de Archivos en VS Code y Cursor: `vscode-file-nesting`

Esta habilidad configura la función nativa `explorer.fileNesting` en `.vscode/settings.json` para colapsar visualmente archivos secundarios dependientes bajo sus archivos raíz correspondientes, reduciendo el ruido visual en un $70\%$.

---

## 1. Configuración Canónica de `.vscode/settings.json`

```json
{
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.expand": false,
  "explorer.fileNesting.patterns": {
    "package.json": "pnpm-lock.yaml, pnpm-workspace.yaml, .npmrc, .pnpm-store, yarn.lock, package-lock.json",
    "tsconfig.json": "tsconfig.*.json, *.tsbuildinfo",
    "electron.vite.config.ts": "electron-builder.config.ts, electron-builder.yml, postcss.config.js, tailwind.config.*",
    "vite.config.*": "postcss.config.js, tailwind.config.*",
    ".env": ".env.*",
    "eslint.config.*": ".eslintcache, .prettier*, .editorconfig, .depcheckrc, .dependency-cruiser*",
    ".eslintrc*": ".eslintcache, .prettier*, .editorconfig, .depcheckrc, .dependency-cruiser*",
    "jest.config.*": "jest.setup.*, tsconfig.test.json",
    "README.md": "CHANGELOG.md, AGENTS.md, LICENSE*",
    "*.ts": "${capture}.js, ${capture}.d.ts.map, ${capture}.d.ts",
    "*.tsx": "${capture}.styles.ts, ${capture}.test.tsx, ${capture}.stories.tsx"
  }
}
```

---

## 2. Reglas de Inyección

- Si el archivo `.vscode/settings.json` no existe en el proyecto destino, crearlo con esta configuración.
- Si ya existe, fusionar las claves dentro de `explorer.fileNesting.patterns` sin sobrescribir las configuraciones personales del desarrollador.
