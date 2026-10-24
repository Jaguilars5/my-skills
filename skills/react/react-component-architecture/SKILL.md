---
name: react-component-architecture
description: Separación de capas (Domain, Infra, Hooks, Presentation), máximo 5-7 props, compound components, 4 estados visuales y prohibición de emojis nativos en UI.
---

# Arquitectura de Componentes en React y Separación de Capas

Esta regla estructura el frontend separando claramente la lógica de negocio de la presentación visual para mantener componentes limpios, comprobables y desacoplados.

---

## 1. Separación Estricta en 4 Capas por Módulo (`src/features/{feature}/`)

```text
feature-orders/
├── domain/            # Tipos de TypeScript, validadores Zod, constantes de negocio (0 UI)
├── infrastructure/    # Clientes IPC, repositorios HTTP, sockets
├── application/       # Hooks personalizados (orquestan estado, llamadas y eventos)
└── presentation/      # Componentes React puros (JSX, estilos Tailwind, interactividad)
```

### Reglas por Capa:
- **Presentation**: Componentes puros de presentación. Reciben datos listos y emiten callbacks. **No** hacen peticiones directas `fetch` o llamadas IPC en sus cuerpos.
- **Application (Hooks)**: Encapsulan toda la complejidad reactiva (`const { orders, isLoading, createOrder } = useOrders()`).
- **Domain**: Contiene los contratos de datos y reglas puras independientes del framework.

---

## 2. Límites de Complejidad en Props

- **Máximo 5-7 props por componente**: Si un componente requiere más props, es señal obligatoria de:
  - Agrupación en un objeto estructurado con tipo explícito.
  - O refactorización mediante **Composición** (*Compound Components* o *Slots*).
- **Evitar la sopa de booleanos**: No añadir props como `isSmall`, `isBlue`, `hasHeader`, `showFooter`, `isCompact`, `withBadge`.

---

## 3. Protocolo Estricto de Iconos y Prohibición de Emojis Nativos en UI

- ❌ **ESTRICTAMENTE PROHIBIDO** renderizar emojis nativos de texto en componentes JSX/HTML (ej. `<span>🔥</span>`, `<div>⚠️ Error</div>`).
- ✅ Usar exclusivamente componentes SVG de librerías oficiales (**Lucide React**, **Heroicons**, **FontAwesome**):
  ```tsx
  import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

  export function FeedbackAlert({ type, message }: { type: 'error' | 'success'; message: string }) {
    const Icon = type === 'error' ? AlertTriangle : CheckCircle;
    return (
      <div role="alert" className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 text-danger-700">
        <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }
  ```

---

## 4. Patrón Compound Components para Componentes Complejos

Para widgets con múltiples partes interactivas (Tabs, Diálogos, Tablas, Menús):

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

const TabsContext = createContext<{ activeTab: string; setActiveTab: (id: string) => void } | null>(null);

export function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return <TabsContext.Provider value={{ activeTab, setActiveTab }}>{children}</TabsContext.Provider>;
}

Tabs.Trigger = function TabTrigger({ id, children }: { id: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabTrigger debe estar dentro de Tabs');
  const isActive = ctx.activeTab === id;
  return (
    <button
      onClick={() => ctx.setActiveTab(id)}
      className={`px-4 py-2 font-medium ${isActive ? 'border-b-2 border-primary-600 text-primary-600' : 'text-neutral-500'}`}
    >
      {children}
    </button>
  );
};

Tabs.Content = function TabContent({ id, children }: { id: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx || ctx.activeTab !== id) return null;
  return <div className="p-4">{children}</div>;
};
```

---

## 5. Cobertura Obligatoria de los 4 Estados Visuales

Todo componente o vista que consuma datos asíncronos debe renderizar explícitamente:

1. **Estado de Carga (*Loading*)**: Esqueletos (*skeletons*) o spinners contextuales que preserven el layout.
2. **Estado de Error (*Error*)**: Mensaje visual explicativo con botón de reintento (*Retry*), nunca un silencioso `console.error`.
3. **Estado Vacío (*Empty*)**: Mensaje claro cuando no hay resultados (ej. "No hay pedidos hoy"), con sugerencia o botón de acción principal.
4. **Estado de Éxito (*Success*)**: Renderizado completo de la información.
