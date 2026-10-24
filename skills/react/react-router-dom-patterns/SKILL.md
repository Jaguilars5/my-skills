---
name: react-router-dom-patterns
description: Arquitectura de rutas con React Router DOM: objeto ROUTES inmutable as const, ProtectedRouter con control de acceso por roles y layouts con Outlet.
---

# Patrones de Arquitectura con React Router DOM: `react-router-dom-patterns`

Esta habilidad rige la organización y seguridad de rutas en aplicaciones React usando React Router DOM (v6+), erradicando URLs hardcodeadas y centralizando el control de acceso.

---

## 1. Objeto `ROUTES` Inmutable con `as const`

Definir todas las rutas de la aplicación de forma centralizada y fuertemente tipada:

```typescript
// routes.config.ts
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  FORGOT_PASSWORD: '/auth/forgot-password',
} as const;

export const DASHBOARD_ROUTES = {
  ROOT: '/dashboard',
  ORDERS: '/dashboard/orders',
  ORDER_DETAIL: (orderId: string | number) => `/dashboard/orders/${orderId}`,
  SETTINGS: '/dashboard/settings',
} as const;

export const ROUTES = {
  AUTH: AUTH_ROUTES,
  DASHBOARD: DASHBOARD_ROUTES,
  WILDCARD: '*',
} as const;
```

---

## 2. Guardia de Rutas Protegidas (`ProtectedRouter.tsx`)

Controlar la sesión, permisos RBAC y redirección dinámica en un solo componente de orden superior:

```tsx
import type { FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouteAccess } from '@/features/auth/hooks/useRouteAccess';
import { ROUTES } from '@/router/routes.config';

export const ProtectedRouter: FC = () => {
  const { isAuthenticated, user, isInitialLoading } = useAuth();
  const { canAccessRoute, resolveDefaultRoute } = useRouteAccess(user);
  const location = useLocation();

  if (isInitialLoading) {
    return <div className="h-screen flex items-center justify-center">Verificando sesión...</div>;
  }

  // 1. Redirigir a login si no está autenticado
  if (!isAuthenticated || !user) {
    return <Navigate replace to={ROUTES.AUTH.LOGIN} state={{ from: location }} />;
  }

  // 2. Si ya está autenticado pero intenta acceder a /auth/login, redirigir a su workspace
  if (location.pathname.startsWith('/auth')) {
    return <Navigate replace to={resolveDefaultRoute()} />;
  }

  // 3. Verificación de permisos RBAC para la ruta actual
  if (!canAccessRoute(location.pathname)) {
    return <Navigate replace to={resolveDefaultRoute()} />;
  }

  // 4. Renderizar rutas anidadas
  return <Outlet />;
};
```

---

## 3. Definición Limpia de Rutas con Layouts (`AppRouter.tsx`)

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRouter } from './ProtectedRouter';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
import { ROUTES } from './routes.config';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />

        {/* Rutas Protegidas con Layout */}
        <Route element={<ProtectedRouter />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.DASHBOARD.ORDERS} element={<OrdersPage />} />
          </Route>
        </Route>

        {/* Redirección por defecto */}
        <Route path={ROUTES.WILDCARD} element={<Navigate replace to={ROUTES.DASHBOARD.ORDERS} />} />
      </Routes>
    </BrowserRouter>
  );
}
```
