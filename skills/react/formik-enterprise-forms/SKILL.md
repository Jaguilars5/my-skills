---
name: formik-enterprise-forms
description: Formularios con Formik y Zod. Adaptador zodToFormikErrors, inputs custom (CustomInput, CustomSelect), mapeo de errores del servidor y sincronización de límites HTML.
---

# Formularios Empresariales con Formik y Zod: `formik-enterprise-forms`

Esta habilidad rige la construcción de formularios robustos utilizando Formik respaldado por esquemas de validación Zod y componentes canónicos reutilizables (`CustomInput`, `CustomSelect`, `CustomTextArea`, `CustomToggle`).

---

## 1. Adaptador Universal de Validación Zod para Formik

Evitar validaciones duplicadas a mano: convertir `ZodError` en un mapa plano de `FormikErrors`:

```typescript
import { type FormikErrors } from 'formik';
import { type ZodSchema } from 'zod';

export const zodToFormikErrors = <T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  values: T
): FormikErrors<T> => {
  const parsed = schema.safeParse(values);
  if (parsed.success) {
    return {};
  }
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path.join('.');
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors as FormikErrors<T>;
};
```

---

## 2. Componente Canónico `CustomInput.tsx`

Componente de entrada estilizado con tokens reutilizables, soporte de accesibilidad y manejo automático de estados de error:

```tsx
import type { InputHTMLAttributes, FC } from 'react';
import { inputClassName } from '@/styles/tokens.form';

export interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const CustomInput: FC<CustomInputProps> = ({
  id,
  label,
  error,
  helperText,
  required,
  className = '',
  ...props
}) => {
  return (
    <div className={inputClassName.container}>
      <label htmlFor={id} className={inputClassName.label}>
        {label} {required && <span className="text-danger-500">*</span>}
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={`${inputClassName.input} ${error ? 'border-danger-500 focus:ring-danger-500/30' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className={inputClassName.error}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${id}-helper`} className={inputClassName.helperText}>
          {helperText}
        </p>
      )}
    </div>
  );
};
```

---

## 3. Mapeo Automático de Errores del Servidor (`applyServerValidationErrors`)

Cuando una llamada API retorna un error 422 de validación con el desglose de campos:

```typescript
import { type FormikHelpers } from 'formik';

export interface ServerValidationIssue {
  field: string;
  message: string;
}

export const applyServerValidationErrors = <T extends object>(
  formik: Pick<FormikHelpers<T>, 'setFieldError'>,
  issues: ServerValidationIssue[] | undefined
): void => {
  if (!issues?.length) return;
  for (const issue of issues) {
    formik.setFieldError(issue.field as any, issue.message);
  }
};
```

---

## 4. Sincronización de Límites HTML con el Dominio

Vincular los atributos HTML nativos (`minLength`, `maxLength`, `min`, `max`) con los límites definidos en el dominio para validación inmediata en el navegador:

```typescript
export const textInputLimits = (limit: { min: number; max: number }, required = true) => ({
  required,
  minLength: limit.min,
  maxLength: limit.max,
});
```
