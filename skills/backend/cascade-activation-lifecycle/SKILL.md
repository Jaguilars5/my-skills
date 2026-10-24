---
name: cascade-activation-lifecycle
description: Ciclo de vida de catálogos y desactivación en cascada segura. Detección de dependientes activos, confirmación con cascadeRelated=true (409 Conflict) y transacción atómica.
---

# Ciclo de Vida y Reacción en Cascada: `cascade-activation-lifecycle`

Esta habilidad rige la activación y desactivación de entidades padre e hijos en catálogos relacionales, asegurando que ninguna desactivación rompa dependencias activas de forma silenciosa.

---

## 1. El Protocolo de Desactivación en Cascada

Al intentar desactivar una entidad padre (ej. una categoría, departamento, tarifa o lista de precios):

1. **Inspección de Dependientes Activos**:
   - Consultar si existen registros dependientes activos ligados (ej. productos activos en la categoría, ítems activos en la tarifa).
2. **Puerta de Confirmación (409 Conflict)**:
   - Si existen dependientes y la solicitud **no** envió el flag explícito `cascadeRelated: true`, **rechazar inmediatamente con HTTP 409 Conflict**:
     ```json
     {
       "ok": false,
       "code": "DEPENDENTS_ACTIVE_CONFLICT",
       "msg": "Desactivar esta entidad también desactivará los 14 registros ligados; confirme con cascadeRelated=true",
       "affectedCount": 14
     }
     ```
3. **Desactivación Atómica Confirmada**:
   - Si la solicitud incluye `cascadeRelated: true`, ejecutar dentro de una **transacción inmediata** (`BEGIN IMMEDIATE` o `transaction.atomic()`):
     - Desactivar la entidad padre incrementando su `version`.
     - Desactivar todas las entidades dependientes ligadas.
     - Registrar en la auditoría el motivo y el número de registros modificados.

---

## 2. El Protocolo de Activación

- La reactivación de una entidad padre **no requiere confirmación previa de cascada**; aplica una cascada de alta estándar.
- Si algún elemento reactivado tiene precios o datos incompletos, retornar una advertencia contextual (`warning: 'price_unverified'`) sin bloquear la transacción.

---

## 3. Ejemplo de Implementación en Servicio

```typescript
export async function toggleEntityActivation(
  repo: EntityRepository,
  entityId: string,
  isActive: boolean,
  cascadeRelated?: boolean
): Promise<{ ok: boolean; count: number }> {
  if (!isActive) {
    // 1. Contar dependientes activos
    const activeDependents = await repo.countActiveDependents(entityId);
    if (activeDependents > 0 && !cascadeRelated) {
      const err: any = new Error(`Existen ${activeDependents} dependientes activos ligados. Confirme con cascadeRelated=true`);
      err.code = 'ALREADY_EXISTS'; // 409
      err.status = 409;
      throw err;
    }

    // 2. Ejecutar transacción de baja en cascada
    return await repo.runImmediateTransaction(async () => {
      await repo.deactivateDependents(entityId);
      await repo.deactivate(entityId);
      return { ok: true, count: activeDependents + 1 };
    });
  }

  // Activación directa
  await repo.activate(entityId);
  return { ok: true, count: 1 };
}
```
