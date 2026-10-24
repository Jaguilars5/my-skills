---
name: electron-security-hardening
description: Hardening de BrowserWindow, control de navegación estricto, Electron Fuses, ASAR integrity y mitigación de RCE.
---

# Endurecimiento de Seguridad en Electron: `electron-security-hardening`

Guía exhaustiva para eliminar vectores de Ejecución Remota de Código (RCE), escape de sandbox e inyección de procesos en aplicaciones Electron.

---

## 1. Configuración de Ventana Principal (`BrowserWindow`)

Toda ventana debe configurarse con los siguientes parámetros de aislamiento:

```typescript
import { BrowserWindow } from 'electron';
import path from 'node:path';

const mainWindow = new BrowserWindow({
  width: 1280,
  height: 800,
  webPreferences: {
    preload: path.join(__dirname, '../preload/index.js'),
    contextIsolation: true,          // Mandatorio: Separa contextos JS de Node y DOM
    nodeIntegration: false,          // Mandatorio: Prohíbe APIs de Node en Renderer
    sandbox: true,                   // Mandatorio: Activa sandbox nativo de Chromium
    webSecurity: true,               // Mandatorio: Respeta CORS y Same-Origin Policy
    allowRunningInsecureContent: false,
    plugins: false,
  }
});
```

---

## 2. Control Estricto de Navegación y Enlaces Externos

Prevenir que la aplicación cargue páginas no autorizadas o ejecute binarios del sistema:

```typescript
import { shell } from 'electron';

// 1. Denegar apertura de popups o ventanas no autorizadas:
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  if (url.startsWith('https://') || url.startsWith('http://')) {
    shell.openExternal(url); // Abrir en navegador predeterminado del SO
  }
  return { action: 'deny' }; // Bloquear en la app
});

// 2. Restringir navegación dentro de la ventana:
mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
  const isDev = !app.isPackaged;
  const allowedOrigin = isDev ? process.env['ELECTRON_RENDERER_URL'] : 'file://';
  if (!navigationUrl.startsWith(allowedOrigin)) {
    event.preventDefault();
  }
});
```

---

## 3. Electron Fuses en Tiempo de Empaquetado

Configurar fuses en el script de build o empaquetado para cerrar puertas traseras en binarios distribuidos:

```typescript
import { flipFuses, FuseV1Options, FuseVersion } from '@electron/fuses';

await flipFuses(pathToElectronBinary, {
  version: FuseVersion.V1,
  [FuseV1Options.RunAsNode]: false,                     // Prohíbe ELECTRON_RUN_AS_NODE
  [FuseV1Options.EnableCookieEncryption]: true,         // Cifra cookies con el keyring del SO
  [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false, // Ignora NODE_OPTIONS maliciosas
  [FuseV1Options.OnlyLoadAppFromAsar]: true,             // Solo ejecuta código dentro del ASAR firmado
});
```

---

## 4. Política de Seguridad de Contenido (CSP)

Configurar cabeceras CSP estrictas en la respuesta HTTP o en la etiqueta meta HTML:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https: wss:;">
```
