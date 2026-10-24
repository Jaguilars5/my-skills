---
name: jwt-auth-refresh-rotation
description: Autenticación robusta con tokens duales (access + refresh), rotación segura y tokenVersion para detectar reuso fraudulento.
---

# Autenticación JWT con Rotación y Detección de Reuso: `jwt-auth-refresh-rotation`

Esta habilidad establece la arquitectura de tokens duales (**Access Token** de corta duración y **Refresh Token** de larga duración) con detección de reuso mediante versionado de sesión en la base de datos SoT.

---

## 1. Par de Tokens con Claves Secretas Separadas

- **Access Token**: Vida útil corta (ej. 15 minutos). Firmado con `ACCESS_SECRET`. Se envía en el header `Authorization: Bearer <token>`.
- **Refresh Token**: Vida útil larga (ej. 7 días). Firmado con una clave distinta `REFRESH_SECRET`. Contiene `sessionKey` y `tokenVersion`.

---

## 2. Detección de Reuso con `tokenVersion`

Para mitigar el robo o intercepción de refresh tokens:

1. Cada sesión almacena en base de datos `token_version INTEGER DEFAULT 1`.
2. El Refresh Token incluye en su payload `{ sessionKey, tokenVersion }`.
3. Al invocar `/api/v1/auth/refresh`:
   ```typescript
   // 1. Verificar la firma del refresh token
   const payload = jwt.verify(refreshToken, REFRESH_SECRET) as RefreshPayload;

   // 2. Consultar sesión en la base de datos SoT
   const session = await authRepo.findSessionByKey(payload.sessionKey);
   if (!session || !session.isActive) {
     throw new UnauthorizedError('Sesión inexistente o revocada.');
   }

   // 3. DETECCIÓN DE REUSO FRAUDULENTO
   if (session.tokenVersion !== payload.tokenVersion) {
     // Un token viejo fue presentado -> Posible ataque de repetición o compromiso
     await authRepo.revokeAllUserSessions(session.userId);
     throw new ForbiddenError('Intento de reuso de token detectado. Todas las sesiones han sido revocadas.');
   }

   // 4. Rotar versión de token dentro de una transacción atómica
   const nextTokenVersion = session.tokenVersion + 1;
   await authRepo.updateSessionTokenVersion(session.id, nextTokenVersion);

   // 5. Emitir nuevo par de tokens
   const newAccessToken = signAccessToken({ userId: session.userId, role: session.role });
   const newRefreshToken = signRefreshToken({ sessionKey: session.sessionKey, tokenVersion: nextTokenVersion });
   ```

---

## 3. Almacenamiento Seguro

- En navegadores web: almacenar el Refresh Token en cookies con `HttpOnly; Secure; SameSite=Strict`.
- En clientes de escritorio (Electron): almacenar en una bóveda cifrada local o en el Keychain del sistema operativo.
