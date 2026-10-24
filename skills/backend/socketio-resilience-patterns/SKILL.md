---
name: socketio-resilience-patterns
description: Arquitectura Zero Trust en WebSockets con Socket.IO. Autenticación JWT en handshake, validación Zod en cada evento, guards RBAC y eventos simétricos EMIT/RESPONSE.
---

# Arquitectura Zero Trust y Resiliencia en Socket.IO: `socketio-resilience-patterns`

Esta habilidad rige el diseño de comunicación bidireccional mediante WebSockets y Socket.IO, aplicando una política estricta de *Zero Trust*: el servidor nunca asume que los datos enviados por el cliente son seguros.

---

## 1. Autenticación Obligatoria en Handshake (`io.use`)

Nunca aceptar conexiones no autenticadas en el servidor Socket.IO (salvo allowlist de descubrimiento local):

```typescript
import { Server, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  userId: string;
  role: string;
  permissions: string[];
}

export interface CustomSocket extends Socket {
  authenticatedUser?: AuthenticatedUser;
}

export function configureSocketAuth(io: Server, secretKey: string) {
  io.use((socket: CustomSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('UNAUTHENTICATED: Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, secretKey) as AuthenticatedUser;
      socket.authenticatedUser = decoded;
      next();
    } catch {
      next(new Error('UNAUTHENTICATED: Token inválido o expirado'));
    }
  });
}
```

---

## 2. Eventos Simétricos y Registro con Esquemas Zod

Estructurar los eventos como pares `EMIT` / `RESPONSE` y validar el payload antes de invocar la lógica:

```typescript
import { type ZodType } from 'zod';

export interface SocketEventConfig<T> {
  event: { EMIT: string; RESPONSE: string };
  schema?: ZodType<T>;
  requiredPermission?: string;
}

export function registerSocketEvent<T>(
  socket: CustomSocket,
  config: SocketEventConfig<T>,
  handler: (payload: T, user: AuthenticatedUser) => Promise<any>
) {
  socket.on(config.event.EMIT, async (rawPayload: unknown) => {
    const user = socket.authenticatedUser;
    if (!user) {
      return socket.emit(config.event.RESPONSE, { ok: false, code: 'UNAUTHENTICATED', msg: 'Sesión requerida' });
    }

    // 1. Verificación de permisos RBAC
    if (config.requiredPermission && !user.permissions.includes(config.requiredPermission)) {
      return socket.emit(config.event.RESPONSE, { ok: false, code: 'FORBIDDEN', msg: 'Permiso insuficiente' });
    }

    // 2. Validación de esquema Zod (Zero Trust)
    let validatedPayload = rawPayload as T;
    if (config.schema) {
      const parsed = config.schema.safeParse(rawPayload);
      if (!parsed.success) {
        return socket.emit(config.event.RESPONSE, {
          ok: false,
          code: 'VALIDATION_FAILED',
          msg: 'Payload de evento inválido',
          errors: parsed.error.issues,
        });
      }
      validatedPayload = parsed.data;
    }

    // 3. Ejecución segura con respuesta estandarizada
    try {
      const result = await handler(validatedPayload, user);
      socket.emit(config.event.RESPONSE, { ok: true, data: result });
    } catch (err: any) {
      socket.emit(config.event.RESPONSE, { ok: false, code: 'EXECUTION_ERROR', msg: err.message });
    }
  });
}
```

---

## 3. Formato Estándar de Respuestas Socket

Toda respuesta de socket debe seguir la firma unificada:
```typescript
interface SocketResponse<T = unknown> {
  ok: boolean;
  data?: T;
  code?: string;        // 'ALREADY_EXISTS', 'VALIDATION_FAILED', 'FORBIDDEN'
  msg?: string;
  errors?: unknown[];
}
```
