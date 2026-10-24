---
name: typescript-advanced-contracts
description: Contratos Wire vs Domain, validación formal con Zod, tipos inferidos, uniones discriminadas exhaustivas y tipos branded para IDs.
---

# Contratos Avanzados en TypeScript y Validación con Zod

Esta habilidad estandariza el diseño de tipos y la validación en tiempo de ejecución para crear límites infranqueables entre el mundo exterior (red, IPC, base de datos) y el dominio interno.

---

## 1. Separación Wire DTO vs Dominio Interno

Nunca mezclar los tipos que viajan por el transporte (Wire) con los tipos utilizados internamente por los repositorios o lógica de negocio:

```typescript
// 1. Contrato Wire (lo que viaja por HTTP/IPC) - Recibe identificadores públicos
export interface OrderWriteWireT {
  publicId: string;
  clientPublicId: string;
  items: Array<{ productPublicId: string; quantity: number }>;
}

// 2. Contrato Interno (lo que consume el repositorio de persistencia) - Utiliza INTEGER IDs
export interface OrderWriteInternalT {
  id: number;
  clientId: number;
  items: Array<{ productId: number; quantity: number }>;
  version: number;
}
```

---

## 2. Zod como Único Origen de Verdad (*Single Source of Truth*)

En lugar de duplicar interfaces manuales y esquemas de validación, definir el esquema Zod e inferir el tipo TypeScript automáticamente:

```typescript
import { z } from 'zod';

export const UserPayloadSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'operator', 'viewer']),
  permissions: z.array(z.string()).default([]),
});

// Tipo TypeScript inferido automáticamente:
export type UserPayload = z.infer<typeof UserPayloadSchema>;
```

### Reglas con Zod:
- Usar `schema.safeParse(data)` para manejo de errores sin interrumpir la ejecución con excepciones innecesarias.
- En capas de transporte (controladores, manejadores IPC), transformar o rechazar inmediatamente payloads que no cumplan el esquema.

---

## 3. Uniones Discriminadas y Exhaustividad Obligatoria

Toda máquina de estados, evento o respuesta debe modelarse con un discriminador explícito (`type` o `kind`):

```typescript
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Helper de exhaustividad en tiempo de compilación:
export function assertNever(x: never): never {
  throw new Error(`Caso no manejado: ${JSON.stringify(x)}`);
}

function renderState(state: AsyncState<User>) {
  switch (state.status) {
    case 'idle': return null;
    case 'loading': return '<Spinner />';
    case 'success': return `<Profile user={state.data} />`;
    case 'error': return `<Alert error={state.error} />`;
    default: return assertNever(state); // Error de compilador si falta algún caso
  }
}
```

---

## 4. Tipos Branded para Identificadores

Prevenir el intercambio accidental de IDs con el mismo tipo primitivo (`string` o `number`):

```typescript
export type UserId = string & { readonly __brand: unique symbol };
export type TenantId = string & { readonly __brand: unique symbol };

function assignTenant(userId: UserId, tenantId: TenantId) {
  // El compilador prohíbe pasar tenantId donde se espera userId
}
```
