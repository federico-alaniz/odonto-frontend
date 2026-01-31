import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getRoleConfig, getRolePermissions } from './utils/roleConfig';

const PUBLIC_ROUTES = ['/login', '/platform', '/', '/reservar-turno'];

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir todas las rutas de API de NextAuth sin procesamiento
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Rutas públicas
  const isPublic = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/platform') || pathname.startsWith('/reservar-turno');
  
  if (isPublic) {
    return NextResponse.next();
  }

  // Obtener token de sesión
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const role = (token as any).role as 'admin' | 'doctor' | 'secretary' | undefined;
  const tenantId = (token as any).tenantId;

  const res = NextResponse.next();
  
  // Establecer cookie de tenant desde la sesión
  if (tenantId) {
    res.cookies.set('tenantId', tenantId, { path: '/' });
  }
  
  // Verificar permisos de rol
  if (pathname.startsWith('/admin') && role !== 'admin') {
    const url = req.nextUrl.clone();
    const defaultHome = role ? getRoleConfig(role).defaultHomePage : '/login';
    url.pathname = defaultHome;
    return NextResponse.redirect(url);
  }
  // Admin puede acceder a rutas de doctor y secretary
  if (pathname.startsWith('/doctor') && role !== 'doctor' && role !== 'admin') {
    const url = req.nextUrl.clone();
    const defaultHome = role ? getRoleConfig(role).defaultHomePage : '/login';
    url.pathname = defaultHome;
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith('/secretary') && role !== 'secretary' && role !== 'admin') {
    const url = req.nextUrl.clone();
    const defaultHome = role ? getRoleConfig(role).defaultHomePage : '/login';
    url.pathname = defaultHome;
    return NextResponse.redirect(url);
  }

  // Verificar permisos de recursos compartidos
  if (role) {
    const rule = SHARED_ROUTE_RULES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
    if (rule && rule.resource && rule.action) {
      const perms = getRolePermissions(role);
      const allowed = perms.some((p) => p.resource === rule.resource && p.actions.includes(rule.action!));
      if (!allowed) {
        const url = req.nextUrl.clone();
        const defaultHome = getRoleConfig(role).defaultHomePage;
        url.pathname = defaultHome;
        return NextResponse.redirect(url);
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
