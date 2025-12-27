# Configuración de Variables de Entorno en Vercel

## Variables Requeridas

Para que la aplicación funcione correctamente en Vercel, debes configurar las siguientes variables de entorno en el dashboard de Vercel:

### 1. NEXT_PUBLIC_API_URL
**Valor:** URL de tu backend API (ej: `https://your-backend.onrender.com` o `https://api.yourdomain.com`)

**Descripción:** URL del backend Flask/Python que maneja la autenticación y datos.

### 2. NEXTAUTH_URL
**Valor:** URL de tu aplicación en Vercel (ej: `https://odontoapp.vercel.app`)

**Descripción:** URL base de tu aplicación Next.js. Vercel la configura automáticamente, pero es recomendable establecerla explícitamente.

### 3. NEXTAUTH_SECRET
**Valor:** Una cadena aleatoria segura (mínimo 32 caracteres)

**Descripción:** Secreto usado para encriptar tokens JWT. 

**Generar con:**
```bash
openssl rand -base64 32
```

### 4. NEXT_PUBLIC_AUTH_DEBUG (Opcional)
**Valor:** `0` (en producción) o `1` (para debugging)

**Descripción:** Habilita logs de debugging para NextAuth.

### 5. AUTH_DEBUG (Opcional)
**Valor:** `0` (en producción) o `1` (para debugging)

**Descripción:** Habilita logs de debugging del lado del servidor.

---

## Cómo Configurar en Vercel

### Opción 1: Dashboard de Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Click en **Settings** → **Environment Variables**
3. Agrega cada variable con su valor correspondiente
4. Selecciona los entornos donde aplicará (Production, Preview, Development)
5. Click en **Save**
6. Redeploy tu aplicación para que tome efecto

### Opción 2: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Configurar variables
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production

# Redeploy
vercel --prod
```

---

## Verificación

Después de configurar las variables:

1. Verifica que el deploy se complete sin errores
2. Accede a `https://your-app.vercel.app/login`
3. Intenta iniciar sesión
4. Verifica en la consola del navegador que no haya errores de NextAuth

---

## Errores Comunes

### Error 405 en /api/auth/_log
**Solución:** Ya está corregido en el código. NextAuth tiene el logging deshabilitado.

### Error "NEXTAUTH_URL not configured"
**Solución:** Asegúrate de configurar `NEXTAUTH_URL` con la URL exacta de tu app en Vercel.

### Error "Invalid credentials"
**Solución:** Verifica que `NEXT_PUBLIC_API_URL` apunte al backend correcto y que esté funcionando.

### Error CORS
**Solución:** Configura CORS en tu backend para permitir requests desde tu dominio de Vercel.

---

## Ejemplo de Configuración

```env
# Producción en Vercel
NEXT_PUBLIC_API_URL=https://odonto-backend.onrender.com
NEXTAUTH_URL=https://odontoapp.vercel.app
NEXTAUTH_SECRET=tu_secreto_generado_con_openssl_aqui
NEXT_PUBLIC_AUTH_DEBUG=0
AUTH_DEBUG=0
```

---

## Notas Importantes

1. **Nunca** commitees el archivo `.env.local` al repositorio
2. Las variables que empiezan con `NEXT_PUBLIC_` son visibles en el cliente
3. `NEXTAUTH_SECRET` debe ser diferente en cada entorno (dev, staging, prod)
4. Después de cambiar variables de entorno, siempre redeploy la aplicación
