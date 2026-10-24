---
name: openapi-documentation
description: Documentación viva de contratos REST con OpenAPI 3.1 y Swagger sincronizada 1:1 con esquemas Zod/Pydantic y códigos RFC 9110.
---

# Documentación de APIs con OpenAPI 3.1 y Swagger: `openapi-documentation`

Esta habilidad rige la documentación de contratos de red para que la especificación OpenAPI sea un artefacto vivo sincronizado automáticamente con la validación de código.

---

## 1. Sincronización 1:1 con Esquemas de Validación

La especificación OpenAPI nunca debe escribirse como un archivo estático desconectado del código:
- En Node.js/TypeScript: Utilizar `@asteasolutions/zod-to-openapi` para registrar los esquemas Zod directamente en el generador OpenAPI.
- En Django/Python: Utilizar `drf-spectacular` para introspeccionar automáticamente los serializadores DRF y generar el esquema `/api/schema/`.

---

## 2. Definición Estándar de Respuestas RFC 9110

Todo endpoint documentado debe contemplar sus respuestas semánticas:

| Código | Significado | Cuándo Documentarlo |
| :--- | :--- | :--- |
| **`200 OK`** | Petición exitosa | Consultas `GET` o mutaciones que retornan datos. |
| **`201 Created`** | Recurso creado | Operaciones `POST` de inserción de entidad. |
| **`204 No Content`** | Sin contenido | Operaciones `DELETE` o mutaciones sin retorno. |
| **`400 Bad Request`** | Petición malformada | Errores de sintaxis JSON o parámetros corruptos. |
| **`401 Unauthorized`** | No autenticado | Token ausente, firma inválida o expirado. |
| **`403 Forbidden`** | Prohibido | Usuario autenticado pero sin rol/permiso RBAC suficiente. |
| **`404 Not Found`** | No encontrado | Identificador inexistente en base de datos. |
| **`409 Conflict`** | Conflicto | Clave duplicada (`ALREADY_EXISTS`), colisión CAS (`version`) o dependientes activos. |
| **`422 Unprocessable`** | Validación fallida | Esquema Zod / Serializer con campos inválidos. |
| **`500 Internal Error`** | Error no controlado | Fallo inesperado en infraestructura. |

---

## 3. Esquema de Seguridad Bearer JWT Estandarizado

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```
