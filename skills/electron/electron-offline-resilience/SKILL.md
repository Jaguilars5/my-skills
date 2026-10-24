---
name: electron-offline-resilience
description: Operatividad ininterrumpida sin conexión, patrón outbox en disco, reconexión de sockets con backoff y feedback visual en UI.
---

# Resiliencia Fuera de Línea en Aplicaciones de Escritorio: `electron-offline-resilience`

Las aplicaciones de punto de venta (POS), paneles de operaciones o herramientas clínicas deben continuar funcionando y registrando transacciones locales incluso si la red o el servidor central caen temporalmente.

---

## 1. Patrón Outbox en Persistencia Local

Toda operación de mutación realizada sin conexión debe guardarse atómicamente en una tabla local de cola de salida (*outbox*):

```sql
CREATE TABLE IF NOT EXISTS sync_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK(operation IN ('CREATE', 'UPDATE', 'DELETE')),
  payload_json TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  synced_at TEXT
);
```

### Reglas de Sincronización:
- Al recuperar conexión, un proceso en segundo plano procesa la cola en orden FIFO estricto.
- Si un ítem falla por error del servidor (5xx) o de red, incrementar `retry_count` y aplicar retroceso exponencial.
- Si falla por validación permanente de negocio (4xx), mover a una cola de revisión de discrepancias (*Dead Letter Queue* local).

---

## 2. Reconexión con Retroceso Exponencial y Variación Aleatoria (*Backoff + Jitter*)

Evitar sobrecargar el backend cuando decenas de clientes intentan reconectarse al mismo segundo:

```typescript
function calculateBackoffDelay(attempt: number, baseMs = 1000, maxMs = 30000): number {
  const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  const jitter = Math.random() * (exponential * 0.2); // 20% jitter
  return exponential + jitter;
}
```

---

## 3. Feedback Visual de Estado de Red en la Interfaz (Renderer)

La interfaz React debe reflejar de forma inequívoca el estado de sincronización:

- 🟢 **En línea**: Todas las transacciones sincronizadas con el servidor.
- 🟡 **Sincronizando**: Procesando cola de salida (`3 transacciones pendientes...`).
- 🔴 **Fuera de línea**: Modo autónomo activo. Los cobros y tickets se guardan localmente en SQLite / disco cifrado sin bloquear al operador.
