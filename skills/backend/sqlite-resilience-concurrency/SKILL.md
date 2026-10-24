---
name: sqlite-resilience-concurrency
description: Optimización y concurrencia en SQLite como SoT: modo WAL, busy_timeout=5000, BEGIN IMMEDIATE y consultas parametrizadas.
---

# Concurrencia y Resiliencia en SQLite SoT: `sqlite-resilience-concurrency`

SQLite es una base de datos extraordinariamente rápida y robusta cuando se configura de forma adecuada para soportar lectores concurrentes y mitigar bloqueos `SQLITE_BUSY`.

---

## 1. Configuración Obligatoria de Pragmas al Conectar

Inmediatamente después de abrir cualquier conexión SQLite (`better-sqlite3`, `sqlite3` o Python `sqlite3`), ejecutar:

```sql
PRAGMA journal_mode = WAL;          -- Habilita Write-Ahead Logging (lectores no bloquean escritores)
PRAGMA busy_timeout = 5000;         -- Espera hasta 5000ms antes de arrojar SQLITE_BUSY
PRAGMA synchronous = NORMAL;        -- Rendimiento óptimo en modo WAL manteniendo durabilidad ACID
PRAGMA foreign_keys = ON;           -- Fuerza integridad referencial en cascada
PRAGMA cache_size = -64000;         -- Asigna 64MB de memoria para caché de páginas
```

---

## 2. Prevención de Deadlocks con `BEGIN IMMEDIATE`

Por defecto, SQLite inicia transacciones en modo `DEFERRED`, lo que permite que múltiples conexiones lean y luego compitan por el bloqueo de escritura, generando bloqueos `SQLITE_BUSY`.

- ✅ Ante cualquier transacción con escrituras o lecturas seguidas de escritura, usar **`BEGIN IMMEDIATE`**:
```typescript
import Database from 'better-sqlite3';

const db = new Database('app-sot.db');

// better-sqlite3 transaction en modo inmediato:
export const runImmediateTransaction = db.transaction((callback) => {
  return callback();
}); // Internamente ejecuta BEGIN IMMEDIATE
```

---

## 3. Consultas Parametrizadas Obligatorias

- **PROHIBIDO** interpolar variables en cadenas SQL (`SELECT * FROM users WHERE email = '${email}'`).
- ✅ Usar siempre sentencias preparadas con parámetros vinculados:
  ```typescript
  const stmt = db.prepare('SELECT id, public_id, version FROM users WHERE email = ? AND is_deleted = 0');
  const user = stmt.get(email);
  ```

---

## 4. Índices Compuestos Estratégicos

Para consultas frecuentes que filtran por varios campos o manejan borrado lógico:

```sql
-- Índice para búsquedas activas por tenant:
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status_date
ON orders (tenant_id, status, created_at DESC)
WHERE is_deleted = 0;
```
