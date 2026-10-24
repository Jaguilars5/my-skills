---
name: testing-playwright
description: Pruebas E2E deterministas para web y Electron con Page Object Model, selectores semánticos, interceptación de red y aislamiento.
---

# Pruebas E2E Robustas con Playwright: `testing-playwright`

Esta habilidad establece las mejores prácticas para escribir suites de pruebas End-to-End confiables, rápidas y libres de intermitencia (*flakiness*) en aplicaciones web y de escritorio (Electron).

---

## 1. Reglas Contra la Intermitencia (*Anti-Flakiness*)

- ❌ **PROHIBIDO** el uso de `page.waitForTimeout(3000)` o pausas arbitrarias en código de tests.
- ✅ Usar aserciones web que esperan automáticamente la condición:
  ```typescript
  await expect(page.getByTestId('order-status')).toHaveText('Completado');
  ```
- ✅ Esperar eventos de red específicos si es necesario:
  ```typescript
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/v1/orders') && resp.status() === 201),
    page.getByRole('button', { name: /emitir factura/i }).click(),
  ]);
  ```

---

## 2. Jerarquía de Selectores Semánticos

Priorizar selectores orientados al usuario y a accesibilidad sobre selectores frágiles de CSS:

1. `page.getByRole('button', { name: /confirmar/i })`
2. `page.getByLabel('Correo electrónico')`
3. `page.getByTestId('checkout-total')` (usar `data-testid` para elementos dinámicos o complejos)
4. ❌ **PROHIBIDO**: Selectores dependientes de clases utilitarias de Tailwind o jerarquías DOM profundas (`div > div:nth-child(2) > span.text-blue-500`).

---

## 3. Patrón Page Object Model (POM)

Encapsular la navegación y selectores de una vista o flujo en clases dedicadas:

```typescript
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/correo/i);
    this.submitButton = page.getByRole('button', { name: /iniciar sesión/i });
  }

  async login(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }
}
```

---

## 4. Pruebas en Electron con Playwright

Para aplicaciones de escritorio empaquetadas o en desarrollo:

```typescript
import { _electron as electron, test, expect } from '@playwright/test';

test('arranque seguro de ventana Electron', async () => {
  const electronApp = await electron.launch({ args: ['.'] });
  const window = await electronApp.firstWindow();

  await expect(window).toHaveTitle(/EPIKO POS/i);
  await electronApp.close();
});
```
