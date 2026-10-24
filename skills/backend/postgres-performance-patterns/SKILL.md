---
name: postgres-performance-patterns
description: Optimización en PostgreSQL: índices B-Tree/GIN, EXPLAIN ANALYZE, pooling con PgBouncer y migraciones sin bloqueos (Zero-Downtime).
---

# Patrones de Rendimiento y Arquitectura en PostgreSQL: `postgres-performance-patterns`

Esta habilidad rige el diseño de esquemas, consultas y migraciones para entornos de alta concurrencia con PostgreSQL.

---

## 1. Estrategia de Índices Especializados

1. **Índices Parciales (*Partial Indexes*)**:
   - Reducir el tamaño del índice omitiendo registros inactivos o eliminados lógicamente:
   ```sql
   CREATE INDEX idx_active_users_email
   ON users (email)
   WHERE is_active = TRUE AND is_deleted = FALSE;
   ```
2. **Índices GIN para Columnas JSONB**:
   - Para consultas sobre atributos dinámicos en columnas `JSONB`:
   ```sql
   CREATE INDEX idx_audit_log_metadata
   ON audit_logs USING gin (metadata jsonb_path_ops);
   ```
3. **Índices B-Tree Compuestos Ordenados**:
   - El orden de las columnas debe seguir la regla de selectividad: igualdad primero, rango/ordenación al final.

---

## 2. Diagnóstico con `EXPLAIN (ANALYZE, BUFFERS)`

Antes de dar por buena una consulta en producción, evaluar el plan de ejecución:
- Evitar `Seq Scan` en tablas con miles o millones de registros.
- Vigilar `Buffers: shared read` elevado (lectura de disco); buscar `shared hit` (memoria caché).
- Evitar operaciones de ordenación en disco (`Sort Method: external merge Disk`); ajustar `work_mem` o indexar la cláusula `ORDER BY`.

---

## 3. Migraciones sin Bloqueo de Tabla (*Zero-Downtime Migrations*)

1. **Creación de Índices Concurrente**:
   - `CREATE INDEX CONCURRENTLY idx_users_phone ON users (phone);` (no bloquea lecturas ni escrituras en producción).
2. **Añadir Columnas con Valores por Defecto**:
   - En PostgreSQL 11+, `ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;` es instantáneo (metadata update).
3. **Validación de Restricciones Separada**:
   - Crear la restricción como `NOT VALID` y luego validarla de forma concurrente:
   ```sql
   ALTER TABLE orders ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) NOT VALID;
   ALTER TABLE orders VALIDATE CONSTRAINT fk_user;
   ```

---

## 4. Agrupamiento de Conexiones (*Connection Pooling*) con PgBouncer

- En arquitecturas basadas en contenedores o serverless, no permitir que cada petición abra una conexión cruda al motor de PostgreSQL.
- Utilizar PgBouncer en modo transacción (`pool_mode = transaction`) para escalar a miles de clientes concurrentes manteniendo el número de procesos backend de Postgres por debajo de 100.
