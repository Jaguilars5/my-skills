---
name: clean-architecture-sot
description: Clean Architecture de 3 capas (Domain, Infrastructure, Transport), repository pattern SoT, DTOs explícitos y transacciones inmediatas.
---

# Clean Architecture con Base de Datos SoT: `clean-architecture-sot`

Guía oficial para crear y refactorizar módulos de backend bajo Clean Architecture desacoplada con base de datos como Fuente Única de Verdad (*Source of Truth* - SoT).

---

## 1. Estructura Estricta de 3 Capas por Entidad

Todo módulo de dominio backend se organiza en exactamente 3 carpetas directas:

```text
features/{entity}/
├── domain/
│   ├── {entity}.types.ts                 # Tipos de dominio + DTOs Wire e Internos
│   ├── {entity}.constants.ts             # Nombres de eventos, códigos de error, tablas
│   ├── {entity}.validator.ts             # Reglas de negocio puras (EntityValidator)
│   └── {entity}.repository.interface.ts  # Contrato formal del repositorio
├── infrastructure/
│   ├── persistence/
│   │   ├── {entity}.repository.ts        # Implementación SQL (null solo si no existe; SQL throw)
│   │   ├── {entity}.schema.ts            # DDL / Esquema de tabla con version y soft-deletes
│   │   └── {entity}.mapper.ts            # Transformación Domain ↔ Row de base de datos
│   └── sync/                             # Sincronización externa (opcional)
└── transport/
    ├── {entity}.controller.ts            # Orquestación de casos de uso y transacciones
    ├── {entity}.routes.ts                # Rutas REST Express explícitas con middlewares
    └── {entity}.events.ts                # Eventos Socket.IO o mensajería con Zod
```

---

## 2. Contratos de Repositorio SoT

- **Semántica de Retorno**:
  - `findById(id)` retorna `T | null`: retorna `null` **únicamente** cuando el registro no existe en la base de datos.
  - Los errores de conexión, sintaxis SQL o violaciones de integridad lanzan excepciones tipadas (`DatabaseError`), nunca devuelven `null` ni suprimen el error.
- **Consultas con Concurrencia CAS**:
  - Toda mutación (`update`, `delete`) debe incluir `AND version = ?`. Si las filas modificadas son 0 habiendo existido el registro, lanzar `ConcurrencyConflictError`.

---

## 3. Separación de Claves: PublicId vs Internal ID

- **Transporte / Wire**: Expone únicamente identificadores públicos universales (`publicId`: UUIDv4 o NanoID) para clientes HTTP y sockets.
- **Persistencia**: Emplea enteros autonuméricos (`id: INTEGER PRIMARY KEY`) para optimizar índices de B-Tree y joins relacionales.
- **Resolución**: Usar mappers o helpers dedicados para resolver `publicId` $\rightarrow$ `id` antes de invocar los métodos del repositorio interno.

---

## 4. Transacciones Atómicas Inmediatas

Ante operaciones que involucren más de una entidad o escrituras complejas:
- En SQLite: ejecutar bajo `BEGIN IMMEDIATE` para adquirir el bloqueo de escritura de inmediato y evitar deadlocks por actualización.
- En PostgreSQL: ejecutar bajo `client.query('BEGIN')` / `COMMIT` con bloques `try / finally { client.release() }`.
