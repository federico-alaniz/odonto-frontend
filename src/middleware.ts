import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getRoleConfig, getRolePermissions } from './utils/roleConfig';

const AUTH_DEBUG = process.env.AUTH_DEBUG === '1';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const PUBLIC_ROUTES = ['/login', '/platform', '/'];

const ROLE_PREFIXES = {
  admin: '/admin',
  doctor: '/doctor',
  secretary: '/secretary',
} as const;

const SHARED_ROUTE_RULES: Array<{ prefix: string; resource?: string; action?: 'create' | 'read' | 'update' | 'delete' }> = [
  { prefix: '/pacientes', resource: 'patients', action: 'read' },
  { prefix: '/historiales', resource: 'medical-records', action: 'read' },
  { prefix: '/registros', resource: 'medical-records', action: 'read' },
  { prefix: '/calendario', resource: 'appointments', action: 'read' },
  { prefix: '/configuracion' },
  { prefix: '/seguridad', resource: 'system', action: 'read' },
  { prefix: '/perfil' },
  { prefix: '/profile' },
  { prefix: '/notificaciones' },
  { prefix: '/ayuda' },
  { prefix: '/shared' },
];

/**
 * Extrae el tenant_id del path
 * Formato esperado: /[tenant_id]/admin/... o /[tenant_id]/doctor/...
 * Retorna: { tenantId: string | null, pathWithoutTenant: string }
 */
const getTenantFromPath = (pathname: string): { tenantId: string | null; pathWithoutTenant: string } => {
  // Rutas públicas sin tenant
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/platform') || pathname.startsWith('/api/')) {
    return { tenantId: null, pathWithoutTenant: pathname };
  }

  const segments = pathname.split('/').filter(Boolean);
  
  // Si no hay segmentos, no hay tenant
  if (segments.length === 0) {
    return { tenantId: null, pathWithoutTenant: pathname };
  }

  // El primer segmento es el tenant_id
  const tenantId = segments[0];
  
  // Reconstruir el path sin el tenant
  const pathWithoutTenant = segments.length > 1 ? '/' + segments.slice(1).join('/') : '/';
  
  return { tenantId, pathWithoutTenant };
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Extraer tenant del path
  const { tenantId, pathWithoutTenant } = getTenantFromPath(pathname);

  // Rutas públicas (sin tenant)
  const isPublic = !tenantId || pathname.startsWith('/api/auth');
  
  const res = NextResponse.next();
  
  // Si hay tenant, establecer cookie
  if (tenantId) {
    res.cookies.set('tenantId', tenantId, { path: '/' });
  }

  if (isPublic) return res;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  

  if (!token) {
    
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const role = (token as any).role as keyof typeof ROLE_PREFIXES | undefined;
  
  // Verificar permisos de rol usando el path sin tenant
  if (pathWithoutTenant.startsWith('/admin') && role !== 'admin') {
    const url = req.nextUrl.clone();
    const defaultHome = role ? getRoleConfig(role as any).defaultHomePage : '/login';
    url.pathname = tenantId ? `/${tenantId}${defaultHome}` : defaultHome;
    return NextResponse.redirect(url);
  }
  if (pathWithoutTenant.startsWith('/doctor') && role !== 'doctor') {
    const url = req.nextUrl.clone();
    const defaultHome = role ? getRoleConfig(role as any).defaultHomePage : '/login';
    url.pathname = tenantId ? `/${tenantId}${defaultHome}` : defaultHome;
    return NextResponse.redirect(url);
  }
  if (pathWithoutTenant.startsWith('/secretary') && role !== 'secretary') {
    const url = req.nextUrl.clone();
    const defaultHome = role ? getRoleConfig(role as any).defaultHomePage : '/login';
    url.pathname = tenantId ? `/${tenantId}${defaultHome}` : defaultHome;
    return NextResponse.redirect(url);
  }

  if (role) {
    const rule = SHARED_ROUTE_RULES.find((r) => pathWithoutTenant === r.prefix || pathWithoutTenant.startsWith(`${r.prefix}/`));
    if (rule && rule.resource && rule.action) {
      const perms = getRolePermissions(role as any);
      const allowed = perms.some((p) => p.resource === rule.resource && p.actions.includes(rule.action!));
      if (!allowed) {
        const url = req.nextUrl.clone();
        const defaultHome = getRoleConfig(role as any).defaultHomePage;
        url.pathname = tenantId ? `/${tenantId}${defaultHome}` : defaultHome;
        return NextResponse.redirect(url);
      }
    }
  }

  const sessionTenant = (token as any).tenantId;
  if (sessionTenant && tenantId && sessionTenant !== tenantId) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('error', 'tenant_mismatch');
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
