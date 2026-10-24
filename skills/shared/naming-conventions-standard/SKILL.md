---
name: naming-conventions-standard
description: Estándar absoluto de nomenclatura de código y protocolo de emojis. camelCase, UPPER_SNAKE_CASE, PascalCase, kebab-case, cero emojis en UI y consola restringida a 4 estados.
---

# Estandarización de Convenciones de Nomenclatura y Protocolo de Emojis

Esta habilidad rige la consistencia formal absoluta en el estilo de escritura de código, identificadores, archivos y el uso restringido de emojis en todo el repositorio.

---

## 1. Convenciones Universales de Nomenclatura (*100% de Cumplimiento*)

Queda prohibida cualquier mezcla arbitraria de estilos en un mismo proyecto:

| Elemento | Estándar TypeScript / React | Estándar Python / Django | Ejemplo |
| :--- | :--- | :--- | :--- |
| **Variables y Propiedades** | `camelCase` | `snake_case` | `userSession`, `is_active` |
| **Funciones y Métodos** | `camelCase` | `snake_case` | `calculateTotal()`, `get_user_profile()` |
| **Constantes Globales** | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` | `MAX_RETRIES`, `AUTH_TIMEOUT_MS` |
| **Clases, Tipos e Interfaces**| `PascalCase` | `PascalCase` | `OrderRepository`, `UserPayloadT` |
| **Componentes de React** | `PascalCase` | N/A | `CustomInput`, `ProtectedRouter` |
| **Archivos y Módulos** | `kebab-case` (o `.tsx` componente) | `snake_case` | `auth-token.service.ts`, `models.py` |
| **Rutas REST y Canales IPC** | `kebab-case` | `kebab-case` | `/api/v1/user-profiles`, `printer:print-ticket` |

> **Regla de Oro**: Si se define un estándar para un tipo de elemento, el $100\%$ de los elementos de ese tipo en el repositorio deben cumplirlo sin excepciones.

---

## 2. Protocolo Estricto de Uso de Emojis e Iconos

### A. En Interfaz de Usuario (UI / Frontend)
- ❌ **ESTRICTAMENTE PROHIBIDO** usar emojis nativos de texto en JSX/HTML (ej. `<span>🔥</span>`, `<div>⚠️ Error</div>`).
- ✅ Usar exclusivamente componentes SVG de librerías de iconos oficiales (**Lucide React**, **Heroicons**, **FontAwesome**).
- ✅ Los iconos decorativos deben incluir `aria-hidden="true"`; los interactivos deben incluir `aria-label` descriptivo.

### B. En Logs y Consola (Terminal)
El uso de emojis en `console.log`, scripts CLI y herramientas de terminal está restringido **ÚNICAMENTE a los siguientes 4 estados**:
- `✅` (**Check / Success**): Operación culminada con éxito.
- `❌` (**X / Error / Fail**): Fallo, excepción o validación rota.
- `ℹ️` (**Info / Information**): Paso informativo, progreso o estado de contexto.
- `⚠️` (**Warning / Alert**): Advertencia o condición no bloqueante.

> **Cualquier otro emoji en consola o logs de servidor está PROHIBIDO** (cero cohetes, robots, chispas, carpetas o paquetes).

### C. En Markdown y Documentación
Se permite el uso sobrio de emojis en encabezados y tablas, manteniendo un tono formal, profesional y consistente a lo largo de todo el documento.
