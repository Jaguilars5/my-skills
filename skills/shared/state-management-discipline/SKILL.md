---
name: state-management-discipline
description: Gestión predecible de estado global (Redux Toolkit / Zustand), selectores memoizados, normalización de entidades y cero estado efímero en store.
---

# Disciplina en Gestión de Estado Global (Redux Toolkit / Zustand)

El estado global debe reservarse para datos compartidos entre múltiples módulos o páginas. Colocar estado incorrecto en el store global degrada el rendimiento e introduce re-renders masivos.

---

## 1. Lo que NUNCA debe ir al Estado Global

- ❌ Modales abiertos o cerrados (`isModalOpen: true`).
- ❌ Pestañas o tabs activas dentro de una página (`activeTab: 0`).
- ❌ Valores y validaciones locales de formularios mientras el usuario escribe.
- ❌ Valores derivados que se pueden calcular al vuelo a partir de props o estado existente.

> **Regla de Oro**: Mantén el estado lo más cercano posible al componente que lo utiliza (`useState`, `useReducer` o Context localizado).

---

## 2. Normalización de Entidades por ID

Evitar almacenar arrays con objetos anidados profundos. Estructurar entidades mediante diccionarios mapeados por ID (`createEntityAdapter` o estructura `{ ids: [], entities: {} }`):

```typescript
// ❌ Estructura frágil y costosa de actualizar:
interface BadState {
  users: Array<{ id: string; name: string; posts: Array<{ id: string; title: string }> }>;
}

// ✅ Estructura normalizada:
interface NormalizedState {
  users: {
    ids: string[];
    entities: Record<string, User>;
  };
}
```

---

## 3. Selectores Memoizados Obligatorios

Nunca realizar transformaciones pesadas (`filter`, `map`, `sort`) directamente dentro del selector inline del componente:

```typescript
// ❌ Provoca re-render en cada acción porque devuelve una nueva referencia de array:
const activeUsers = useAppSelector(state => state.users.filter(u => u.isActive));

// ✅ Selector memoizado con createSelector (reselect):
export const selectActiveUsers = createSelector(
  [(state: RootState) => state.users.entities, (state: RootState) => state.users.ids],
  (entities, ids) => ids.map(id => entities[id]).filter(user => user?.isActive)
);

// Uso limpio en componente:
const activeUsers = useAppSelector(selectActiveUsers);
```

---

## 4. Inmutabilidad y Slices Enfocados

- Dividir el estado en slices pequeños y enfocados por dominio (`authSlice`, `billingSlice`, `cartSlice`), no en un mega-slice monolítico.
- Redux Toolkit aprovecha Immer para mutaciones legibles seguras; evitar mezclar desestructuración manual `...state` con mutaciones directas.
