---
name: reusable-design-tokens
description: Objetos canónicos de diseño Tailwind: inputClassName, selectClassName, tableClassName y headerClassName para evitar clases repetitivas inline.
---

# Tokens Canónicos de Diseño y Estilos Reutilizables: `reusable-design-tokens`

Esta habilidad establece la centralización de clases de Tailwind CSS en objetos canónicos reutilizables dentro de `@/styles/tokens.form.ts`, erradicando la duplicación de cadenas kilométricas de clases en JSX.

---

## 1. El Problema de las Clases Inline Repetidas

- ❌ Duplicar `className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"` en 40 inputs diferentes.
- Si se decide cambiar el radio de borde o el color de foco, requiere modificar decenas de archivos con riesgo de inconsistencias.

---

## 2. Objetos Canónicos Estandarizados (`tokens.form.ts`)

```typescript
export const inputClassName = {
  container: 'min-w-0 space-y-2',
  label: 'block text-sm font-medium text-neutral-700 dark:text-neutral-300',
  input:
    'block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 transition placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100',
  helperText: 'mt-1 truncate text-xs text-neutral-500',
  error: 'mt-1 text-xs font-medium text-danger-500',
};

export const selectClassName = {
  container: 'min-w-0 space-y-2',
  label: 'block text-sm font-medium text-neutral-700 dark:text-neutral-300',
  select:
    'block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100',
  option: 'text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-700',
  helperText: 'mt-1 truncate text-xs text-neutral-500',
  error: 'mt-1 text-xs font-medium text-danger-500',
};

export const tableClassName = {
  table: 'w-full text-left border-collapse',
  thead: 'border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900',
  trHead: 'whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-neutral-500',
  th: 'px-4 py-3',
  tbody: 'divide-y divide-neutral-100 dark:divide-neutral-800',
  trBody: 'transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50',
  td: 'px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300',
  notFound: 'py-8 text-center text-sm text-neutral-400',
};

export const headerClassName = {
  container: 'mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
  title: 'text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100',
  description: 'mt-1 text-sm text-neutral-500 dark:text-neutral-400',
};
```

---

## 3. Helpers de Etiquetas Contextuales

```typescript
export const selectCreateActionLabel = (entityLabel: string, searchTerm?: string): string => {
  const trimmed = searchTerm?.trim();
  return trimmed ? `Crear ${entityLabel} "${trimmed}"` : `Crear ${entityLabel}`;
};
```
