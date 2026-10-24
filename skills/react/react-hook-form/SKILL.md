---
name: react-hook-form
description: Optimización de formularios con React Hook Form: useForm, useWatch, useController, zodResolver, suscripciones aisladas y arrays dinámicos.
---

# Gestión Eficiente de Formularios con React Hook Form: `react-hook-form`

Esta habilidad rige el diseño de formularios en React mediante `react-hook-form` y `@hookform/resolvers/zod` para evitar re-renderizados masivos en cada pulsación de tecla y mantener validaciones de esquema estrictas.

---

## 1. Integración con Zod (`zodResolver`) y Tipado Inferido

Definir el esquema Zod como única fuente de verdad y vincularlo al formulario:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const CheckoutSchema = z.object({
  customerName: z.string().min(3, 'Nombre requerido'),
  email: z.string().email('Correo inválido'),
  taxId: z.string().min(10, 'Identificación fiscal requerida'),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
});

type CheckoutFormValues = z.infer<typeof CheckoutSchema>;

export function CheckoutForm({ onSubmit }: { onSubmit: (data: CheckoutFormValues) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      customerName: '',
      email: '',
      taxId: '',
      paymentMethod: 'cash',
    },
    mode: 'onBlur', // Validar al perder foco para no saturar al usuario mientras escribe
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium">Nombre</label>
        <input id="customerName" {...register('customerName')} className="input" />
        {errors.customerName && <p className="text-xs text-danger-500 mt-1">{errors.customerName.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Procesando...' : 'Confirmar'}
      </button>
    </form>
  );
}
```

---

## 2. Aislamiento de Suscripciones con `useWatch` (Anti Re-render)

- ❌ **Evitar `watch()` a nivel de raíz del formulario**: Provoca que todo el componente y sus inputs hijos se re-rendericen en cada carácter escrito.
- ✅ **Usar `useWatch` en subcomponentes aislados**:
```tsx
import { useWatch, type Control } from 'react-hook-form';

function OrderSummaryPrice({ control }: { control: Control<CheckoutFormValues> }) {
  // Solo este componente pequeño se re-renderiza cuando cambia paymentMethod
  const paymentMethod = useWatch({ control, name: 'paymentMethod' });
  const surcharge = paymentMethod === 'card' ? 0.05 : 0;

  return <div>Recargo: {surcharge * 100}%</div>;
}
```

---

## 3. Integración de Componentes Controlados con `useController`

Para bibliotecas de UI complejas (selects avanzados, datepickers, sliders):

```tsx
import { useController, type Control } from 'react-hook-form';

export function CustomSelectField({ name, control, label }: { name: any; control: Control<any>; label: string }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <div>
      <label>{label}</label>
      <CustomSelect value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
      {error && <span className="text-danger-500">{error.message}</span>}
    </div>
  );
}
```

---

## 4. Arrays Dinámicos con `useFieldArray`

Para listados dinámicos de líneas de factura o ítems de pedido:
- Usar siempre `field.id` como `key` en el mapeo de React (`key={field.id}`), **NUNCA** el índice del array (`index`).
