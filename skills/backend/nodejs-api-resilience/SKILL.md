---
name: nodejs-api-resilience
description: APIs Node.js/Express resilientes, rutas explícitas, middlewares de seguridad, errores RFC 9110 y graceful shutdown.
---

# Resiliencia y Seguridad en APIs Node.js: `nodejs-api-resilience`

Esta habilidad rige el diseño de servidores HTTP en Node.js y Express para garantizar alta disponibilidad, seguridad por defecto y manejo predecible del ciclo de vida del proceso.

---

## 1. Pila de Seguridad Obligatoria

Todo servidor Express debe configurar de inicio:

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

// 1. Cabeceras HTTP seguras
app.use(helmet());

// 2. CORS con orígenes explícitos (NUNCA '*' si se manejan credenciales/cookies)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));

// 3. Límite de tamaño de payload contra ataques de agotamiento de memoria
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
```

---

## 2. Ruteo Explícito y Prohibición de Routers Mágicos

- Cada módulo debe tener su archivo `{entity}.routes.ts` con rutas declaradas explícitamente (`router.post('/', ...)`).
- Prohibido el uso de fábricas genéricas de ruteo automático de caja negra que oculten qué endpoints están expuestos y con qué middlewares.

---

## 3. Manejador Centralizado de Errores con Semántica RFC 9110

Nunca atrapar un error con `try/catch` para silenciarlo o retornar un genérico `500 Internal Server Error`:

```typescript
import { type Request, type Response, type NextFunction } from 'express';

export function centralErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Mapeo semántico de errores conocidos
  if (err.name === 'ZodError') {
    return res.status(422).json({
      status: 422,
      code: 'VALIDATION_FAILED',
      message: 'Los datos enviados no son válidos.',
      errors: (err as any).errors,
    });
  }

  if (err.message.includes('ALREADY_EXISTS') || err.message.includes('UNIQUE constraint')) {
    return res.status(409).json({
      status: 409,
      code: 'ALREADY_EXISTS',
      message: 'El recurso ya existe con esa clave única.',
    });
  }

  // Error no controlado: loguear en servidor, sanitizar respuesta al cliente
  console.error('💥 Error no controlado:', err);
  return res.status(500).json({
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'Ha ocurrido un error interno en el servidor.',
  });
}
```

---

## 4. Cierre Elegante (*Graceful Shutdown*)

Evitar abortar peticiones en vuelo o corromper transacciones cuando el proceso se detiene:

```typescript
import http from 'node:http';

const server = http.createServer(app);

function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor HTTP ordenadamente...`);
  server.close(async () => {
    console.log('🔒 Conexiones HTTP cerradas.');
    try {
      // Cerrar pools de base de datos o conexiones de socket
      await dbPool.end();
      console.log('📦 Conexiones de base de datos finalizadas con éxito.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error cerrando dependencias:', err);
      process.exit(1);
    }
  });

  // Forzar apagado si tarda más de 10s
  setTimeout(() => {
    console.error('⚠️ Apagado forzado por tiempo límite.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```
