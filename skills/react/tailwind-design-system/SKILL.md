---
name: tailwind-design-system
description: Sistema de diseño con Tailwind CSS, escala consistente de tokens, accesibilidad WAI-ARIA y composición con clsx/tailwind-merge.
---

# Sistema de Diseño con Tailwind CSS y Accesibilidad: `tailwind-design-system`

Esta habilidad rige el desarrollo visual para garantizar interfaces limpias, cohesivas, rápidas y accesibles para todos los usuarios.

---

## 1. Escala Coherente de Tokens y Composición Limpia

- **Evitar cadenas caóticas de 15 clases en JSX**: Utilizar utilidades de composición como `clsx` y `tailwind-merge` (`cn` helper):
  ```typescript
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
  }
  ```
- **Diseño con Tokens Semánticos**:
  - Preferir tokens semánticos sobre colores arbitrarios en línea: `bg-primary-600`, `text-neutral-900`, `border-danger-500`.
  - Evitar valores arbitrarios repetitivos como `bg-[#2a3b4c]` salvo excepciones justificadas.

---

## 2. Accesibilidad Integrada (WAI-ARIA y Navegación por Teclado)

1. **Anillos de Foco Visibles (*Focus Management*)**:
   - Todo elemento interactivo (botones, inputs, enlaces) debe tener anillos de foco nítidos:
     ```tsx
     className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
     ```
2. **Atributos ARIA Dinámicos**:
   - Elementos expandibles deben incluir `aria-expanded={isOpen}`.
   - Pestañas o filas seleccionadas deben incluir `aria-selected={isSelected}`.
   - Estados de carga en botones deben incluir `aria-busy="true"` y deshabilitar interacción (`disabled`).
3. **Contraste de Color WCAG AA**:
   - Asegurar ratio de contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande o iconos esenciales.

---

## 3. Estados Interactivos Completos

Todo elemento clicable debe contemplar su ciclo interactivo completo:
- `hover:`: feedback sutil de elevación o cambio de tono.
- `active:`: retroalimentación de pulsación táctil o clic.
- `disabled:`: opacidad reducida (`disabled:opacity-50`) y cursor prohibido (`disabled:cursor-not-allowed`).
- `dark:`: soporte de tema oscuro armónico.
