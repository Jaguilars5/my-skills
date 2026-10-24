---
name: react-performance-optimization
description: Memoización medida (no preventiva), virtualización obligatoria para >100 elementos, deps estables en hooks y descarga del Renderer.
---

# Optimización de Rendimiento en React y Renderer de Electron

Esta habilidad impone una disciplina estricta de rendimiento: evitar re-renders innecesarios, optimizar ciclos de renderizado y prevenir el sobrecosto de memoización preventiva infundada.

---

## 1. Reglas de Memoización: Solo Ante Costo Real Medido

> **PROHIBIDA la memoización preventiva o por simple convención.**

### Cuándo USAR `useMemo` y `useCallback`:
- Transformaciones masivas de datos o algoritmos pesados (ej. filtrado y cálculo sobre miles de filas en memoria).
- Listas grandes (>100 elementos) que no puedan virtualizarse inmediatamente.
- Callbacks que se pasan como props a componentes hijos memorizados con `React.memo` cuya renderización es demostradamente costosa.

### Cuándo NO USAR Memoización:
- ❌ **Strings, números, booleanos**: `const total = useMemo(() => a + b, [a, b])` (es más costoso instanciar el hook que sumar dos números).
- ❌ **Accesos directos a objetos**: `const name = useMemo(() => user.name, [user])`.
- ❌ **Event handlers simples**: botones o inputs locales que no provocan problemas de render en subcomponentes.
- ❌ **Funciones internas que no se pasan como props ni son dependencias de hooks**.

---

## 2. Dependencias Estables en Hooks

- **PROHIBIDO** pasar funciones inline o literales de objetos o arrays como dependencias de `useEffect`, `useMemo` o `useCallback`:
  - ❌ `useEffect(() => {}, [() => doSomething()])`
  - ❌ `useEffect(() => {}, [{ filter: 'active' }])`
  - ❌ `useEffect(() => {}, [[1, 2, 3]])`
- Usar `useRef` para valores o funciones que deben permanecer estables a lo largo del ciclo de vida sin disparar re-renders.
- **NUNCA** silenciar advertencias de dependencias (`// eslint-disable-next-line react-hooks/exhaustive-deps`) sin justificación arquitectónica explícita.

---

## 3. Virtualización Obligatoria para Listas Grandes

> **PROHIBIDO renderizar colecciones dinámicas mayores a 100 elementos sin virtualización.**

Usar `@tanstack/react-virtual`, `react-virtuoso` o `react-window` para listas de pedidos, productos, catálogo o logs:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualizedList({ items }: { items: Product[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // altura aproximada por fila en px
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => {
          const item = items[virtualRow.index];
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <ProductRow product={item} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 4. Descarga del Proceso Renderer

El proceso de renderizado (UI) debe limitarse a renderizar y reaccionar a eventos:
- ❌ Filtrado masivo de miles de registros en la UI.
- ❌ Cifrado, compresión o cálculo matemático intensivo en el hilo principal de React.
- ✅ Delegar cómputo al proceso Principal de Electron (vía IPC) o a un Web Worker.
- ✅ Centralizar llamadas asíncronas en servicios o hooks personalizados; **NUNCA** ejecutar promesas dentro del JSX.
