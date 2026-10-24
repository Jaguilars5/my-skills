# 🧠 my-skills

> **Repositorio Centralizado de Skills, Subagentes y Ecosistema MCP Multi-Editor** para agentes de código (Cursor, Claude Code, Antigravity, Cline / Roo-Code).
> 
> Repositorio oficial: [https://github.com/Jaguilars5/my-skills](https://github.com/Jaguilars5/my-skills)

Diseñado con una arquitectura híbrida de **cero dependencias externas**, `my-skills` actúa como la **Fuente Única de Verdad (Single Source of Truth)** para tus estándares de ingeniería. Se ejecuta de forma instantánea vía `pnpm dlx` o en local mediante `pnpm link --global`.

---

## 🌟 Características Principales

- ⚡ **Instantáneo con Cero Dependencias**: Escrito íntegramente con módulos nativos de Node.js (`node:fs`, `node:path`, `node:url`, `node:process`). Cero instalación previa de paquetes.
- 🎯 **Inyección Inteligente con Grupo `shared`**: Al inyectar cualquier stack (`react`, `electron`, `backend`), se incluyen automáticamente las 14 reglas transversales esenciales (pregunta previa, estandarización de prompts, memoria MCP Project Brain, convenciones de nomenclatura, commits semánticos, cero deuda técnica, tipado avanzado, higiene de raíz, anidación de archivos, etc.).
- 🤖 **Subagentes Especializados Incluidos**: Inyecta automáticamente los roles de ingeniería (`db-architect`, `backend-builder`, `frontend-builder`, `qa-reviewer`, `electron-security-auditor`) en los formatos nativos de cada editor.
- 🔌 **Configuración MCP Automática**: Genera o fusiona la configuración de servidores MCP (`sequential-thinking`, `postgres`, `context7`) en `.mcp.json`, `.agents/mcp_config.json` y `.cursor/mcp.json`.
- 🧠 **Cerebro de Proyecto Canónico**: Inicializa `./agents/brain/project_memory.json` con el grafo de módulos, esquemas, contratos expuestos e invariantes de dominio.
- 🔄 **Adaptadores Multi-Editor Simultáneos**:
  - **Cursor**: Genera `.cursor/rules/<grupo>-<skill>.mdc` con frontmatter YAML (`alwaysApply: true` en `shared`), `.cursor/rules/subagents-catalog.mdc` y `.cursor/mcp.json`.
  - **Claude Code**: Genera `.claude/commands/<grupo>-<skill>.md`, `.claude/agents/<agente>.md` y estructura `CLAUDE.md` modularmente.
  - **Antigravity**: Genera `.agent/skills/<grupo>-<skill>/SKILL.md`, `.agent/subagents/<agente>.md` y `.agents/mcp_config.json`.
  - **Cline**: Genera `.clinerules/<grupo>-<skill>.md` para VS Code / Roo-Code.
- 🔒 **Git Oculto por Defecto**: Inyecta automáticamente las rutas generadas en `.git/info/exclude` del proyecto de destino para no ensuciar el `git status` ni el `.gitignore` del equipo de trabajo.
- 🔗 **Soporte de Symlinks Local (`--link`)**: Soporta enlaces simbólicos locales (`junction` en Windows y `dir` en macOS/Linux) para mantener tus proyectos sincronizados en caliente cuando edites skills en el hub.

---

## 📦 Catálogo de Skills Incluidas (37 Habilidades)

### 1. `shared` (Transversales - Inyectadas por defecto) [14 skills]
- **`naming-conventions-standard`**: Estándar absoluto de nomenclatura de código y protocolo de emojis: camelCase, UPPER_SNAKE_CASE, PascalCase, kebab-case, cero emojis en UI y consola restringida a 4 estados (`✅`, `❌`, `ℹ️`, `⚠️`).
- **`ask-before-act`**: Protocolo estricto de confirmación, análisis de impacto y plan previo antes de cambios destructivos o masivos.
- **`prompt-standardization`**: Refinador de requerimientos: corrección automática de ortografía/typos, conversión a especificaciones trazables BDD y cierre proactivo de preguntas clave.
- **`mcp-project-brain`**: Mapeo y memoria canónica del proyecto mediante MCP Brain y grafo `project_memory.json`. Protocolo pre-tarea de consulta y post-tarea de registro atómico.
- **`changelog-tracker`**: Registro disciplinado de cambios en `CHANGELOG.md` siguiendo *Keep a Changelog* y *SemVer*.
- **`git-commit-discipline`**: Convención de commits semánticos atómicos (`feat`, `fix`, `refactor`, `perf`) y explicación del "por qué".
- **`strict-code-quality`**: Tolerancia cero a deuda técnica: 0% type sniffing, 0% unsafe casts (`as any`), concurrencia CAS (`version`), semántica RFC 9110, máx 50 líneas, máx 3 niveles de indentación y `import type`.
- **`constants-no-magic-strings`**: Prohibición estricta de textos hardcodeados y magic strings; centralización en `*.constants.ts` con `as const`.
- **`project-root-hygiene`**: Mantenimiento estricto de una raíz de proyecto limpia, minimalista y libre de archivos temporales, backups o scripts sueltos.
- **`vscode-file-nesting`**: Configuración avanzada de `explorer.fileNesting.patterns` en VS Code y Cursor para agrupar visualmente archivos secundarios.
- **`typescript-advanced-contracts`**: Contratos Wire vs Domain, validación con esquemas Zod (`z.infer`), uniones discriminadas exhaustivas y tipos branded.
- **`state-management-discipline`**: Redux Toolkit / Zustand predecible: cero estado efímero de UI en store global, selectores memoizados y normalización de entidades.
- **`shell-automation-defensive`**: Automatización en bash/sh con `set -euo pipefail`, traps de limpieza y portabilidad.
- **`testing-playwright`**: E2E robusto para web y Electron: Page Object Model, selectores semánticos (`data-testid`) e interceptación de red determinista.

### 2. `electron` (Desktop & Hardening) [3 skills]
- **`electron-ipc-architecture`**: Preload bridge seguro sin `ipcRenderer` crudo, desuscripciones anti-memory leaks en React y payloads menores a 1MB.
- **`electron-security-hardening`**: Endurecimiento de `BrowserWindow` (`contextIsolation`, `sandbox`), `setWindowOpenHandler`, Electron Fuses y CSP.
- **`electron-offline-resilience`**: Operatividad sin conexión: patrón outbox en disco, reconexión con exponential backoff + jitter y feedback de sincronización en UI.

### 3. `react` (Performance Medido & UI) [8 skills]
- **`react-performance-optimization`**: Memoización medida (NO preventiva), dependencias estables en hooks, virtualización obligatoria para >100 elementos y descarga de cómputo fuera del Renderer.
- **`react-component-architecture`**: Separación en capas (Domain $\rightarrow$ Infra $\rightarrow$ Hooks $\rightarrow$ Presentation), máx 5-7 props, compound components y 4 estados visuales (Loading, Error con retry, Empty, Success).
- **`react-router-dom-patterns`**: Arquitectura de rutas con React Router DOM: objeto `ROUTES` inmutable `as const`, `ProtectedRouter` con control de acceso por roles y layouts con `Outlet`.
- **`formik-enterprise-forms`**: Formularios con Formik y Zod: adaptador `zodToFormikErrors`, inputs custom (`CustomInput`, `CustomSelect`), mapeo de errores del servidor y sincronización de límites HTML.
- **`react-hook-form`**: Optimización de formularios con React Hook Form: `useForm`, `useWatch`, `useController`, `zodResolver`, suscripciones aisladas y arrays dinámicos.
- **`reusable-design-tokens`**: Objetos canónicos de diseño Tailwind (`inputClassName`, `selectClassName`, `tableClassName`, `headerClassName`) para evitar clases repetitivas inline.
- **`tailwind-design-system`**: Escala coherente de tokens, accesibilidad WAI-ARIA (WCAG AA, focus rings, roles) y composición con `clsx`/`tailwind-merge`.
- **`vite-bundle-optimization`**: Code-splitting con `React.lazy`, manualChunks para dependencias vendor y optimización de Core Web Vitals (LCP, CLS, INP).

### 4. `backend` (Clean Architecture, Node, Python/Django, DBs & Cache) [12 skills]
- **`clean-architecture-sot`**: Estructura de 3 capas por entidad (`domain`, `infrastructure`, `transport`), repository pattern SoT, DTOs Wire vs Internal y transacciones inmediatas.
- **`nodejs-api-resilience`**: Servidores Express con rutas explícitas, middlewares de seguridad (Helmet, CORS), errores RFC 9110 y *graceful shutdown*.
- **`socketio-resilience-patterns`**: Arquitectura Zero Trust en WebSockets con Socket.IO: autenticación JWT en handshake, validación Zod en cada evento, guards RBAC y eventos simétricos `EMIT/RESPONSE`.
- **`jwt-auth-refresh-rotation`**: Autenticación robusta con tokens duales (access + refresh), rotación segura y `tokenVersion` para detectar reuso fraudulento.
- **`cascade-activation-lifecycle`**: Ciclo de vida de catálogos y desactivación en cascada segura: detección de dependientes activos, confirmación con `cascadeRelated=true` (409 Conflict) y transacción atómica.
- **`openapi-documentation`**: Documentación viva de contratos REST con OpenAPI 3.1 y Swagger sincronizada 1:1 con esquemas Zod/Pydantic y códigos RFC 9110.
- **`sqlite-resilience-concurrency`**: SQLite como SoT: modo WAL (`PRAGMA journal_mode = WAL;`), `busy_timeout = 5000;`, `BEGIN IMMEDIATE` y consultas parametrizadas.
- **`fiscal-invoicing`**: Snapshots tributarios inmutables en líneas de factura, secuencialidad atómica legal sin huecos y punteros fiscales.
- **`django-drf-architecture`**: Arquitectura modular con Servicios y Selectores (desacoplando fat models/views), serializadores estrictos y optimización ORM anti N+1 (`select_related`/`prefetch_related`).
- **`postgres-performance-patterns`**: Índices especializados (B-Tree, GIN para JSONB, parciales), `EXPLAIN ANALYZE`, pooling con PgBouncer y migraciones sin bloqueos (*Zero-Downtime*).
- **`redis-caching-patterns`**: Patrones Cache-Aside y Write-Through, claves jerárquicas con namespace, TTL obligatorio con jitter anti-stampede y bloqueos distribuidos (Redlock).
- **`python-clean-architecture`**: Python 3.11+ moderno con tipado estricto `mypy`, gestión con `uv`/`poetry`, linting/formateo con `ruff` y testing con `pytest`.

---

## 🤖 Subagentes Especializados (5 Roles de Ingeniería)

Inyectados automáticamente en `.agent/subagents/`, `.claude/agents/` y `.cursor/rules/subagents-catalog.mdc`:

1. **`db-architect`**: Arquitecto de Base de Datos (PostgreSQL / SQLite). Mapeo DDL a modelos ORM, migraciones zero-downtime e índices optimizados.
2. **`backend-builder`**: Ingeniero Backend Senior (Node.js/Express, Python/Django 5+ DRF). Arquitectura limpia, middlewares, transacciones atómicas, WebSockets y JWT.
3. **`frontend-builder`**: Ingeniero Frontend Senior (React 18+, TypeScript, Vite, Tailwind CSS). Clean Architecture en UI, custom hooks, contratos Zod, Formik / RHF y rendimiento.
4. **`qa-reviewer`**: Auditor de Calidad, Seguridad ISO 27001, Invariantes de Dominio, alineación OpenAPI vs Zod y pruebas E2E con Playwright.
5. **`electron-security-auditor`**: Especialista en aplicaciones de escritorio Electron: aislamiento de ventanas, Preload bridge seguro, IPC con Zod y Electron Fuses.

---

## 🚀 Uso Rápido vía `pnpm dlx`

No necesitas clonar este repositorio en las máquinas donde desarrollas. Ejecuta directamente desde la raíz del proyecto donde quieras inyectar el ecosistema:

### 1. Repositorio Público en GitHub
```bash
# Inyectar React (+ shared + subagentes + MCP) para Cursor
pnpm dlx github:Jaguilars5/my-skills add react -e cursor

# Inyectar Electron (+ shared + subagentes + MCP) para Antigravity y Claude Code
pnpm dlx github:Jaguilars5/my-skills add electron -e antigravity,claude

# Inyectar Backend (+ shared + subagentes + MCP) para todos los editores
pnpm dlx github:Jaguilars5/my-skills add backend

# Inyectar una sola skill sin las reglas transversales
pnpm dlx github:Jaguilars5/my-skills add backend/django-drf-architecture --no-shared
```

### 2. Repositorio vía SSH
```bash
pnpm dlx git+ssh://git@github.com:Jaguilars5/my-skills.git add react -e cursor
```

---

## 💻 Configuración Local para Desarrollo (`pnpm link --global`)

Si prefieres tener el repositorio clonado en tu máquina y sincronizarlo en caliente:

1. **Clona el repositorio en tu máquina local**:
   ```bash
   git clone https://github.com/Jaguilars5/my-skills.git ~/my-skills
   cd ~/my-skills
   ```

2. **Enlaza el comando globalmente**:
   ```bash
   pnpm link --global
   ```

3. **Verifica la instalación**:
   ```bash
   my-skills list
   # o también:
   skills-hub list
   ```

4. **Uso local con enlace simbólico en caliente (`--link`)**:
   ```bash
   # Dentro de cualquier proyecto local:
   my-skills add react -e antigravity --link
   ```
   > *Nota*: Con `--link`, cualquier cambio que hagas en `~/my-skills/skills/...` se reflejará instantáneamente en el proyecto destino sin necesidad de re-ejecutar el comando.

---

## 🛠️ Comandos y Opciones del CLI

```text
USO:
  my-skills <comando> [opciones]
  skills-hub <comando> [opciones]

COMANDOS:
  list                 Muestra el catálogo completo de grupos, skills y subagentes.
  add <targets...>     Inyecta las skills, subagentes, configuración MCP y Project Brain.
                       targets pueden ser:
                         - Nombre de grupo: react, electron, backend, shared
                         - Skill específica: react/react-performance-optimization
                         - all: todas las skills de todos los grupos

OPCIONES:
  -e, --editor <list>  Editores a configurar: cursor, claude, antigravity, all (por defecto: all)
  -l, --link           Crea enlaces simbólicos en lugar de copiar (solo en local)
  --no-shared, --only  Omite la inyección automática de las skills de "shared"
  --commit             No oculta las reglas en .git/info/exclude (permite commitearlas al repo)
  -h, --help           Muestra la ayuda
```

---

## 📄 Licencia

MIT
