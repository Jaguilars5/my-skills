---
name: vite-bundle-optimization
description: Optimización de empaquetado con Vite, code-splitting con React.lazy, manualChunks y Core Web Vitals.
---

# Optimización de Bundles con Vite y Rendimiento Web: `vite-bundle-optimization`

Esta regla optimiza los tiempos de inicio y el peso del empaquetado de Vite tanto para aplicaciones web como para el Renderer de Electron.

---

## 1. División de Código y Carga Perezosa (*Lazy Loading*)

Rutas secundarias, gráficos pesados, visores de PDF o configuraciones deben cargarse bajo demanda:

```tsx
import { lazy, Suspense } from 'react';

// Carga perezosa con React.lazy:
const AnalyticsDashboard = lazy(() => import('@/features/analytics/AnalyticsDashboard'));
const FiscalReceiptModal = lazy(() => import('@/features/billing/FiscalReceiptModal'));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando módulo...</div>}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
```

---

## 2. Estrategia de Chunks en `vite.config.ts`

Aislar dependencias pesadas de terceros para aprovechar la caché del navegador o del WebView de Electron:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@tanstack/react-virtual', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
```

---

## 3. Optimización de Core Web Vitals (LCP, CLS, INP)

- **CLS (Cumulative Layout Shift)**:
  - Definir siempre dimensiones explícitas (`width` y `height`, o `aspect-ratio`) en imágenes, avatares y contenedores dinámicos.
  - Usar placeholders con altura fija para evitar saltos de pantalla cuando los datos se cargan.
- **LCP (Largest Contentful Paint)**:
  - Priorizar la carga de la fuente tipográfica y assets críticos en el encabezado HTML (`<link rel="preload">`).
- **INP (Interaction to Next Paint)**:
  - Mantener los callbacks de eventos UI por debajo de los 50ms para evitar bloqueos del hilo principal.
