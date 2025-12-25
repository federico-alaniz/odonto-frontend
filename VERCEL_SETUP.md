# Configuración de Multi-Tenancy en Vercel

Esta guía explica cómo configurar subdominios para multi-tenancy en Vercel.

## Arquitectura de Subdominios

La aplicación soporta tres tipos de subdominios:

1. **Desarrollo Local**: `subdomain.localtest.me:3000`
2. **Vercel**: `subdomain.odontoapp.vercel.app`
3. **Dominios Personalizados**: `subdomain.tudominio.com`

## Configuración en Vercel

### 1. Configurar el Dominio Principal

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings** → **Domains**
3. Agrega tu dominio principal: `odontoapp.vercel.app`

### 2. Configurar Subdominios Wildcard

Para permitir subdominios dinámicos (ej: `odontosalud.odontoapp.vercel.app`):

1. En **Settings** → **Domains**, agrega: `*.odontoapp.vercel.app`
2. Vercel automáticamente configurará el wildcard DNS

### 3. Variables de Entorno

Configura las siguientes variables en **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_API_URL=https://tu-backend-url.com
NEXTAUTH_SECRET=tu-secret-key-aqui
NEXTAUTH_URL=https://odontoapp.vercel.app
```

**Importante**: `NEXTAUTH_URL` debe apuntar al dominio principal, no a un subdominio específico.

### 4. Configurar el Backend

El backend debe tener un endpoint para resolver subdominios a `clinicId`:

```
GET /api/clinics/resolve?subdomain=odontosalud
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "clinicId": "clinic_123",
    "subdomain": "odontosalud"
  }
}
```

## Cómo Funciona

1. **Usuario accede**: `https://odontosalud.odontoapp.vercel.app`
2. **Middleware extrae subdominio**: `odontosalud`
3. **Consulta al backend**: Resuelve `odontosalud` → `clinic_123`
4. **Cookie de tenant**: Se establece `tenantId=clinic_123`
5. **Todas las peticiones**: Usan `clinic_123` para filtrar datos

## Registro de Nuevas Clínicas

Para registrar una nueva clínica con subdominio:

1. Crear la clínica en el backend con un `subdomain` único
2. El backend debe validar que el subdominio no esté en uso
3. El subdominio estará disponible inmediatamente: `nuevo-subdominio.odontoapp.vercel.app`

## Dominios Personalizados

Para usar dominios personalizados (ej: `www.clinicaodontosalud.com`):

1. En Vercel, agrega el dominio personalizado
2. Configura los DNS según las instrucciones de Vercel
3. El middleware detectará automáticamente el subdominio

## Troubleshooting

### Error: "Tenant Mismatch"

- **Causa**: El usuario está logueado en un tenant diferente al del subdominio
- **Solución**: Cerrar sesión y volver a iniciar sesión en el subdominio correcto

### Subdominio no funciona

1. Verifica que `*.odontoapp.vercel.app` esté configurado en Vercel
2. Verifica que el backend tenga el endpoint `/api/clinics/resolve`
3. Verifica que la clínica tenga un `subdomain` configurado en la base de datos
4. Revisa los logs del middleware en Vercel

### Cache de subdominios

El middleware cachea la resolución de subdominios. Si cambias el `subdomain` de una clínica:

1. Espera unos minutos para que expire el cache
2. O reinicia el deployment en Vercel

## Testing Local

Para probar subdominios localmente:

```bash
# Accede a: http://odontosalud.localtest.me:3000
npm run dev
```

`localtest.me` es un dominio especial que siempre resuelve a `127.0.0.1` y permite subdominios.
