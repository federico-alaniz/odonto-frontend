# Solución de Problemas de NextAuth en Vercel

## Error Actual

```
[next-auth][error][CLIENT_FETCH_ERROR]
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
url: '/api/auth/session'
```

Este error indica que NextAuth está recibiendo HTML en lugar de JSON cuando intenta acceder a `/api/auth/session`.

---

## Causa del Problema

El problema tiene dos causas principales:

1. **Variable `NEXTAUTH_URL` no configurada o incorrecta** en Vercel
2. **Variable `NEXTAUTH_SECRET` no configurada** en Vercel

Cuando estas variables no están configuradas, NextAuth no puede funcionar correctamente y retorna HTML en lugar de JSON.

---

## Solución Paso a Paso

### 1. Verificar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel:
1. Dashboard de Vercel → Tu proyecto → **Settings** → **Environment Variables**

### 2. Configurar Variables Requeridas

Debes tener estas 3 variables configuradas:

#### A. NEXTAUTH_URL
```
NEXTAUTH_URL=https://odontoapp.vercel.app
```
**Importante:** Usa la URL exacta de tu aplicación en Vercel, sin trailing slash.

#### B. NEXTAUTH_SECRET
Genera un secreto seguro:
```bash
openssl rand -base64 32
```
O en PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copia el resultado y agrégalo como:
```
NEXTAUTH_SECRET=tu_secreto_generado_aqui
```

#### C. NEXT_PUBLIC_API_URL
```
NEXT_PUBLIC_API_URL=https://tu-backend-url.com
```

### 3. Redeploy Manual

Después de configurar las variables:

1. Ve a **Deployments** en Vercel
2. Click en el último deployment
3. Click en los tres puntos (⋮) → **Redeploy**
4. Selecciona **Use existing Build Cache: No**
5. Click **Redeploy**

---

## Verificación

Después del redeploy, verifica:

### 1. Verificar que las Variables Estén Cargadas

Abre la consola del navegador en `https://odontoapp.vercel.app/login` y ejecuta:

```javascript
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Resultado esperado:**
```json
{
  "user": null
}
```

**Resultado incorrecto (el que tienes ahora):**
```
Unexpected token '<', "<!DOCTYPE "...
```

### 2. Verificar el Login

1. Intenta iniciar sesión en `https://odontoapp.vercel.app/login`
2. No deberías ver errores en la consola
3. Deberías ser redirigido al dashboard después del login exitoso

---

## Si el Problema Persiste

### Opción 1: Limpiar Cache de Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Link al proyecto
vercel link

# Redeploy sin cache
vercel --prod --force
```

### Opción 2: Verificar Logs de Vercel

1. Ve a **Deployments** → Último deployment
2. Click en **View Function Logs**
3. Busca errores relacionados con NextAuth
4. Verifica que las variables de entorno estén presentes

### Opción 3: Verificar Configuración de Dominio

Si estás usando un dominio personalizado:

1. Asegúrate de que `NEXTAUTH_URL` use el dominio correcto
2. Si usas `www.tudominio.com`, usa esa URL exacta
3. Si usas `tudominio.com`, usa esa URL exacta

---

## Checklist de Verificación

- [ ] `NEXTAUTH_URL` configurada en Vercel con la URL exacta
- [ ] `NEXTAUTH_SECRET` configurada en Vercel (mínimo 32 caracteres)
- [ ] `NEXT_PUBLIC_API_URL` configurada con la URL del backend
- [ ] Redeploy realizado **sin cache**
- [ ] Esperado 2-3 minutos después del redeploy
- [ ] Cache del navegador limpiado (Ctrl+Shift+R o Cmd+Shift+R)
- [ ] Verificado que `/api/auth/session` retorna JSON, no HTML

---

## Comandos Útiles

### Verificar Variables en Vercel CLI
```bash
vercel env ls
```

### Ver Logs en Tiempo Real
```bash
vercel logs --follow
```

### Forzar Redeploy
```bash
vercel --prod --force
```

---

## Contacto de Soporte

Si después de seguir todos estos pasos el problema persiste:

1. Verifica que el backend esté funcionando correctamente
2. Verifica que no haya errores de CORS en el backend
3. Revisa los logs de Vercel para errores específicos
4. Considera crear un nuevo proyecto en Vercel desde cero

---

## Notas Importantes

- **Siempre** redeploy después de cambiar variables de entorno
- **Nunca** uses `http://` en `NEXTAUTH_URL` en producción, siempre `https://`
- El secreto debe ser diferente en cada entorno (dev, staging, prod)
- Las variables que empiezan con `NEXT_PUBLIC_` son visibles en el cliente
