---
name: constants-no-magic-strings
description: Prohibición estricta de textos hardcodeados y magic strings. Centralización en *.constants.ts con as const.
---

# Erradicación de Strings Mágicos y Centralización de Constantes

Esta habilidad prohíbe el uso de cadenas de texto y números mágicos dispersos por el código fuente, imponiendo una arquitectura de constantes inmutables y fuertemente tipadas.

---

## 1. Lo que está ESTRICTAMENTE PROHIBIDO

- ❌ Strings de estado en lógica condicional: `if (status === 'active')` o `order.status = 'PENDING'`.
- ❌ Nombres de eventos Socket o canales IPC duplicados a mano: `socket.emit('order:created', ...)` o `ipcRenderer.invoke('printer:print', ...)`.
- ❌ Códigos de error y mensajes de validación hardcodeados en llamadas o respuestas: `res.status(409).json({ code: 'ALREADY_EXISTS' })`.
- ❌ Rutas de navegación dispersas: `<Link to="/admin/catalogs/products">`.
- ❌ Números mágicos sin contexto: `if (attempts > 5)` o `setTimeout(fn, 86400000)`.

---

## 2. Centralización en Archivos `*.constants.ts` con `as const`

Toda constante debe definirse en el archivo correspondiente de su módulo (`auth.constants.ts`, `order.constants.ts`) asegurando tipado de solo lectura:

```typescript
// 1. Constantes de Estado y Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// 2. Canales IPC o Eventos Socket Simétricos
export const ORDER_SOCKET_EVENTS = {
  EMIT: 'order:create',
  RESPONSE: 'order:create-response',
  STATUS_CHANGED: 'order:status-changed',
} as const;

// 3. Códigos de Error Semánticos
export const ERROR_CODES = {
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  NOT_FOUND: 'NOT_FOUND',
  CONCURRENCY_CONFLICT: 'CONCURRENCY_CONFLICT',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
} as const;

// 4. Parámetros de Tiempo y Límites
export const TIME_LIMITS = {
  ACCESS_TOKEN_EXPIRES_IN_SEC: 900,       // 15 minutos
  REFRESH_TOKEN_EXPIRES_IN_SEC: 604800,   // 7 días
  MAX_LOGIN_ATTEMPTS: 5,
} as const;
```

---

## 3. Beneficios Inmediatos

- **Refactorización Segura**: Un renombre mediante el Language Server (LSP) actualiza todo el proyecto sin dejar referencias rotas.
- **Autocompletado Total**: Los desarrolladores y agentes de IA obtienen sugerencias exactas de tipos sin errores tipográficos.
