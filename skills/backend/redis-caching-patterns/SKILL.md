---
name: redis-caching-patterns
description: Patrones de caché Cache-Aside, claves jerárquicas, TTL obligatorio con jitter anti-stampede y bloqueos distribuidos (Redlock).
---

# Patrones de Caché y Concurrencia con Redis: `redis-caching-patterns`

Esta habilidad rige el uso de Redis en arquitecturas backend para optimizar tiempos de respuesta, proteger bases de datos relacionales y gestionar bloqueos distribuidos seguros.

---

## 1. Nomenclatura Jerárquica de Claves

Todas las claves almacenadas en Redis deben seguir una convención con prefijo de namespace claro:

```text
<aplicacion>:<entorno>:<recurso>:<identificador>:[sub-recurso]

Ejemplos:
epiko:prod:user:usr_89f2a:profile
epiko:prod:session:sess_102a9
epiko:prod:tenant:tnt_001:catalog_version
```

- **Prohibido**: Claves sin namespace como `user_1` o `data` que colisionen entre módulos o aplicaciones en una misma instancia de Redis.

---

## 2. TTL Obligatorio y Jitter Anti-Avalancha (*Cache Stampede*)

> **PROHIBIDO guardar datos en caché sin TTL (*Time-To-Live*).**

Para evitar que miles de claves expiren en el mismo segundo y provoquen que todas las peticiones golpeen la base de datos simultáneamente:

```python
import random

def get_cache_ttl(base_seconds: int = 3600) -> int:
    """Añade un jitter aleatorio de +/- 10% al TTL base."""
    jitter = random.randint(-int(base_seconds * 0.1), int(base_seconds * 0.1))
    return max(60, base_seconds + jitter)

# Almacenar en Redis:
redis_client.setex(
    name=f"epiko:prod:product:{product_id}",
    time=get_cache_ttl(3600),
    value=serialized_product
)
```

---

## 3. Patrón Cache-Aside Estándar

```python
def get_user_profile(user_id: str) -> dict:
    cache_key = f"epiko:prod:user:{user_id}:profile"
    
    # 1. Intentar lectura de caché
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # 2. Si hay fallo de caché (cache miss), consultar base de datos SoT
    user = db.users.find_by_id(user_id)
    if not user:
        # Guardar marcador nulo breve para mitigar ataques de penetración de caché
        redis_client.setex(cache_key, 60, json.dumps(None))
        return None
    
    # 3. Poblar caché con TTL
    redis_client.setex(cache_key, get_cache_ttl(1800), json.dumps(user.to_dict()))
    return user.to_dict()
```

---

## 4. Bloqueos Distribuidos con Redlock

Para tareas críticas de sincronización o liquidación que no deben ejecutarse concurrentemente en múltiples réplicas de backend:

- Usar algoritmos de bloqueo distribuido con tiempo de expiración automático (*lease time*).
- Prohibido el uso de `SETNX` simple sin tiempo de expiración atómico.
