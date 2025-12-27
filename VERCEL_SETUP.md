# Configuración de Multi-Tenancy en Vercel

Esta guía explica cómo funciona el sistema de multi-tenancy basado en paths.

## Arquitectura Path-Based

La aplicación usa **path-based tenancy** en lugar de subdominios. Esto significa que el tenant se identifica en la URL:

**Formato**: `https://odontoapp.vercel.app/[tenant_id]/[role]/...`

**Ejemplos**:
- `https://odontoapp.vercel.app/clinic_001/admin/dashboard`
- `https://odontoapp.vercel.app/clinic_b2verf34/doctor/patients`
- `https://odontoapp.vercel.app/odontosalud/secretary/appointments`

## Configuración en Vercel

### 1. Configurar el Dominio Principal

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings** → **Domains**
3. Agrega tu dominio principal: `odontoapp.vercel.app`

### 2. Variables de Entorno

Configura las siguientes variables en **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_API_URL=https://tu-backend-url.com
NEXTAUTH_SECRET=tu-secret-key-aqui
NEXTAUTH_URL=https://odontoapp.vercel.app
```

### 3. No se requiere configuración especial

✅ **No necesitas configurar wildcard domains**
✅ **No necesitas plan Pro de Vercel**
✅ **Funciona en cualquier plan**

## Cómo Funciona

1. **Usuario accede**: `https://odontoapp.vercel.app/clinic_001/admin/dashboard`
2. **Middleware extrae tenant**: Primer segmento del path = `clinic_001`
3. **Cookie de tenant**: Se establece `tenantId=clinic_001`
4. **Todas las peticiones**: Usan `clinic_001` para filtrar datos
5. **Backend recibe**: Header `X-Clinic-ID: clinic_001`

## Ventajas del Path-Based

✅ **Más simple**: No requiere configuración DNS
✅ **Más económico**: Funciona en plan gratuito de Vercel
✅ **Más explícito**: El tenant es visible en la URL
✅ **Más fácil de debuggear**: URLs más claras
✅ **Mejor para compartir**: Links directos funcionan siempre

## Estructura de Rutas

Todas las rutas siguen el patrón: `/[tenant_id]/[role]/[recurso]`

**Ejemplos**:
```
/clinic_001/admin/dashboard
/clinic_001/admin/users
/clinic_001/doctor/dashboard
/clinic_001/doctor/patients/123
/clinic_001/secretary/appointments
/clinic_001/historiales/PAT_123
```

## Registro de Nuevas Clínicas

Para registrar una nueva clínica:

1. Crear la clínica en el backend con un `clinicId` único
2. Los usuarios acceden a: `https://odontoapp.vercel.app/[clinicId]/login`
3. Después del login, son redirigidos a: `/[clinicId]/[role]/dashboard`

## Troubleshooting

### Error: "Tenant Mismatch"

- **Causa**: El usuario está logueado en un tenant diferente al del path
- **Solución**: Cerrar sesión y volver a iniciar sesión en la URL correcta

### Rutas no funcionan

1. Verifica que el `tenantId` en la URL sea correcto
2. Verifica que el usuario tenga permisos para ese tenant
3. Revisa los logs del middleware en Vercel
4. Verifica que las carpetas estén en `src/app/[tenantId]/`

### Links rotos después del cambio

Si encuentras links que no funcionan:

1. Busca `href="/admin/` o `router.push("/doctor/` en el código
2. Actualiza para usar `useTenant().buildPath()` o incluir el `tenantId` manualmente
3. Ejemplo: `href={buildPath("/admin/dashboard")}`

## Testing Local

Para probar localmente:

```bash
# Accede a: http://localhost:3000/clinic_001/admin/dashboard
npm run dev
```

## Migración desde Subdominios

Si estás migrando desde subdominios:

1. ✅ **Middleware**: Ya actualizado para extraer tenant del path
2. ✅ **Estructura de carpetas**: Rutas movidas a `[tenantId]/`
3. ✅ **Sidebar**: Actualizado para usar `buildPath()`
4. ⚠️ **Otros componentes**: Buscar y actualizar `router.push()` y `Link href`
5. ⚠️ **Login**: Actualizar para redirigir a `/[tenantId]/[role]/dashboard`

## Hook `useTenant()`

Usa este hook en cualquier componente para trabajar con el tenant:

```typescript
import { useTenant } from '@/hooks/useTenant';

function MyComponent() {
  const { tenantId, buildPath } = useTenant();
  
  // Obtener el tenant actual
  console.log('Tenant actual:', tenantId); // "clinic_001"
  
  // Construir rutas con tenant
  const dashboardUrl = buildPath('/admin/dashboard');
  // Resultado: "/clinic_001/admin/dashboard"
  
  return <Link href={buildPath('/patients')}>Pacientes</Link>;
}
```
