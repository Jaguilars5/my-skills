---
name: electron-ipc-architecture
description: Arquitectura de Preload bridge seguro, IPC fuertemente tipado, desuscripciones anti-memory leak y payloads menores a 1MB.
---

# Arquitectura de Comunicación IPC y Preload Bridge en Electron

Esta habilidad define la arquitectura obligatoria para la comunicación entre el proceso Principal (*Main*) y el proceso de Renderizado (*Renderer*) en aplicaciones Electron.

---

## 1. Reglas Innegociables de Preload (`src/preload/index.ts`)

1. **PROHIBIDO exponer `ipcRenderer` crudo**:
   - ❌ `contextBridge.exposeInMainWorld('electron', { ipcRenderer })` (rompe por completo la seguridad).
   - ✅ Exponer funciones tipadas específicas con canales restringidos.
2. **Desuscripción Obligatoria contra Fugas de Memoria en React**:
   - Todo listener que escuche eventos del Main process debe retornar una función de limpieza para usarse en `useEffect`:
   ```typescript
   import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

   contextBridge.exposeInMainWorld('api', {
     onPrinterStatus: (callback: (status: PrinterStatus) => void) => {
       const subscription = (_event: IpcRendererEvent, data: PrinterStatus) => callback(data);
       ipcRenderer.on('printer:status-changed', subscription);
       return () => {
         ipcRenderer.removeListener('printer:status-changed', subscription);
       };
     },
     printReceipt: (payload: PrintReceiptPayload): Promise<PrintResult> => {
       return ipcRenderer.invoke('printer:print-receipt', payload);
     }
   });
   ```

---

## 2. Validación de Payloads en el Main Process (`src/main/index.ts`)

Todos los manejadores `ipcMain.handle` deben tratar los argumentos recibidos como no confiables:

```typescript
import { ipcMain } from 'electron';
import { z } from 'zod';

const PrintReceiptSchema = z.object({
  invoiceId: z.string().uuid(),
  copies: z.number().int().min(1).max(5).default(1),
  paperWidthMm: z.enum(['58', '80']).default('80')
});

ipcMain.handle('printer:print-receipt', async (event, rawPayload) => {
  // 1. Verificación de frame emisor (anti-spoofing)
  if (!event.senderFrame) {
    throw new Error('Frame de llamada no confiable.');
  }

  // 2. Validación de esquema
  const parsed = PrintReceiptSchema.safeParse(rawPayload);
  if (!parsed.success) {
    throw new Error(`Payload inválido: ${parsed.error.message}`);
  }

  // 3. Ejecución segura en el proceso principal
  return await printerService.print(parsed.data);
});
```

---

## 3. Límites de Tamaño y Rendimiento en IPC

- **Objetos >1MB prohibidos por IPC**: La serialización estructurada de Electron bloquea el hilo principal si se transfieren blobs masivos.
- **Patrón de Referencia por ID**: Enviar únicamente el ID del registro y leer o procesar los datos directamente en el proceso Main.
- **Paginación / Streaming**: Si se requiere enviar colecciones grandes a la UI, paginar en bloques de 50-100 elementos o streamear mediante eventos ordenados.
- **Invoke/Handle sobre Send/On**: Usar `ipcRenderer.invoke` (promesas) en lugar de eventos bidireccionales cruzados `send` / `on` para peticiones de tipo solicitud-respuesta.
