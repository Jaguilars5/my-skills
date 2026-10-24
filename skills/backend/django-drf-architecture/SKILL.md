---
name: django-drf-architecture
description: Arquitectura modular en Django y DRF: servicios y selectores (anti fat-models/views), serializadores estrictos y ORM sin problemas N+1.
---

# Arquitectura Limpia en Django y Django REST Framework (DRF)

Esta habilidad establece una estructura modular y comprobable en proyectos Django/DRF, erradicando los modelos gordos (*fat models*) y vistas infladas mediante el patrón de Servicios y Selectores.

---

## 1. Patrón de Servicios y Selectores (*Services & Selectors Pattern*)

Separar explícitamente las escrituras (servicios) de las lecturas (selectores):

```text
my_feature/
├── models.py       # Únicamente definiciones de esquema, campos e índices
├── services.py     # Lógica de negocio de ESCRITURA (crear, actualizar, orquestar)
├── selectors.py    # Consultas de LECTURA y optimizaciones del ORM
├── serializers.py  # Validación de entrada (InputSerializer) y salida (OutputSerializer)
├── views.py        # Controladores delgados (parsean entrada, llaman servicio/selector, retornan respuesta)
└── urls.py         # Mapeo de rutas
```

### Reglas:
- **`services.py`**: Funciones puras o módulos que encapsulan mutaciones (`create_order`, `cancel_subscription`). Usan `@transaction.atomic` cuando aplican múltiples escrituras.
- **`selectors.py`**: Funciones de solo lectura que retornan QuerySets o diccionarios optimizados (`get_active_orders_for_user`).
- **`models.py`**: Prohibido colocar lógica de negocio compleja, llamadas a APIs externas o envíos de email en `model.save()`.

---

## 2. Prevención Activa de Consultas N+1 en el ORM

- **`select_related`**: Obligatorio para relaciones uno-a-uno (`OneToOneField`) o muchos-a-uno (`ForeignKey`) en lecturas.
- **`prefetch_related`**: Obligatorio para relaciones muchos-a-muchos (`ManyToManyField`) o relaciones inversas.

```python
# ❌ Provoca N+1 consultas (una por cada usuario para traer su perfil):
users = User.objects.all()
for u in users:
    print(u.profile.phone)

# ✅ Consulta optimizada con select_related:
users = User.objects.select_related('profile').filter(is_active=True)
```

---

## 3. Serializadores Delgados y Específicos

Evitar mega-serializadores que intentan manejar creación, actualización y listado con docenas de campos condicionales:

- **`OrderInputSerializer`**: Valida exclusivamente los campos que el cliente puede enviar.
- **`OrderOutputSerializer`**: Formatea los campos que el cliente debe recibir.
- Usar serializadores basados en `serializers.Serializer` en lugar de `ModelSerializer` cuando el DTO de entrada difiera de la tabla física.
