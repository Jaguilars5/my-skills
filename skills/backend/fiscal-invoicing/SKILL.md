---
name: fiscal-invoicing
description: Facturación electrónica y cálculo fiscal: snapshots tributarios inmutables, secuencialidad atómica sin huecos y punteros fiscales.
---

# Facturación Electrónica y Motores de Cálculo Fiscal: `fiscal-invoicing`

Esta habilidad establece las reglas de negocio e ingeniería para sistemas de emisión de facturas electrónicas, cálculo de impuestos inmutables y secuenciación legal sin huecos.

---

## 1. Snapshots Tributarios Inmutables en Cada Ítem

> **PROHIBIDO recalcular dinámicamente impuestos sobre transacciones históricas a partir de tablas maestras de productos.**

Al emitir una factura, el porcentaje de impuesto (IVA/VAT/Tax), la base imponible y el monto liquidado deben congelarse directamente en la línea de la factura:

```sql
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id),
  product_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(12, 4) NOT NULL,
  unit_price DECIMAL(12, 4) NOT NULL,
  tax_rate_percent DECIMAL(5, 2) NOT NULL,    -- Snapshot: ej. 15.00
  tax_code TEXT NOT NULL,                     -- Snapshot: ej. 'IVA_15'
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL
);
```

---

## 2. Secuencialidad Legal Atómica sin Huecos

La numeración de comprobantes fiscales (ej. `001-002-000000123`) es consecutiva por ley. Cualquier brecha o salto numérico genera sanciones tributarias.

### Algoritmo de Asignación Concurrente Segura:
1. Dentro de una transacción inmediata (`BEGIN IMMEDIATE` o `SELECT FOR UPDATE`):
2. Bloquear la fila del punto de emisión:
   ```sql
   UPDATE fiscal_sequences
   SET current_sequence = current_sequence + 1, updated_at = CURRENT_TIMESTAMP
   WHERE emission_point_id = ?
   RETURNING current_sequence;
   ```
3. Formatear el número con relleno de ceros (`padStart(9, '0')`).
4. Insertar la factura y confirmar la transacción (`COMMIT`).
5. Si ocurre cualquier error antes de insertar la factura, el rollback revierte el número de secuencia evitando huecos.

---

## 3. Patrón de Puntero Fiscal (Desacoplamiento de Recibos)

No duplicar la lógica de negocio de cada vertical (laboratorio, restaurante, tienda) dentro de la tabla de facturas:

1. La tabla `invoices` almacena exclusivamente los datos tributarios legales.
2. Cada orden o recibo vertical mantiene un puntero `invoice_id`:
   ```sql
   -- Al emitir la factura, vincular atómicamente:
   UPDATE restaurant_orders
   SET invoice_id = ?, is_invoiced = 1, invoiced_at = ?
   WHERE id = ?;
   ```

---

## 4. Trazabilidad Criptográfica e Inmutabilidad

- **Clave de Acceso / Hash**: Toda factura debe calcular una clave de acceso única o hash de firma criptográfica (SHA-256) combinando fecha, RUC/tax ID, tipo de comprobante, serie, secuencial y código numérico.
- **Prohibido Modificar Facturas Emitidas**: Una factura emitida es inmutable. Para corregir una factura se emite una **Nota de Crédito** o **Nota de Débito** vinculada, nunca un `UPDATE` destructivo sobre montos o ítems.
