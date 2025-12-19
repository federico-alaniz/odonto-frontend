import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getRoleConfig, getRolePermissions } from './utils/roleConfig';

const AUTH_DEBUG = process.env.AUTH_DEBUG === '1';

const PUBLIC_ROUTES = ['/login'];

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

const getTenantIdFromHost = (host?: string | null) => {
  if (!host) return 'clinic_001';
  const cleanHost = host.split(':')[0];
  const parts = cleanHost.split('.');

  if (parts.length >= 3 && cleanHost.endsWith('localtest.me')) {
    const subdomain = parts[0];
    if (subdomain === 'clinic1') return 'clinic_001';
    return subdomain;
  }

  return 'clinic_001';
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) || pathname.startsWith('/api/auth');
  const tenantId = getTenantIdFromHost(req.headers.get('host'));

  const res = NextResponse.next();
  res.cookies.set('tenantId', tenantId, { path: '/' });

  if (isPublic) return res;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (AUTH_DEBUG) {
    // eslint-disable-next-line no-console
    console.log('[AUTH_DEBUG][middleware] request', {
      pathname,
      tenantId,
      hasToken: Boolean(token),
      tokenTenant: (token as any)?.tenantId,
      role: (token as any)?.role,
      sub: (token as any)?.sub,
    });
  }

  if (!token) {
    if (AUTH_DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[AUTH_DEBUG][middleware] redirect -> /login (no token)', { pathname });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const role = (token as any).role as keyof typeof ROLE_PREFIXES | undefined;
  if (pathname.startsWith('/admin') && role !== 'admin') {
    if (AUTH_DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[AUTH_DEBUG][middleware] redirect -> role home (admin guard)', { pathname, role });
    }
    const url = req.nextUrl.clone();
    url.pathname = role ? getRoleConfig(role as any).defaultHomePage : '/login';
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith('/doctor') && role !== 'doctor') {
    if (AUTH_DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[AUTH_DEBUG][middleware] redirect -> role home (doctor guard)', { pathname, role });
    }
    const url = req.nextUrl.clone();
    url.pathname = role ? getRoleConfig(role as any).defaultHomePage : '/login';
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith('/secretary') && role !== 'secretary') {
    if (AUTH_DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[AUTH_DEBUG][middleware] redirect -> role home (secretary guard)', { pathname, role });
    }
    const url = req.nextUrl.clone();
    url.pathname = role ? getRoleConfig(role as any).defaultHomePage : '/login';
    return NextResponse.redirect(url);
  }

  if (role) {
    const rule = SHARED_ROUTE_RULES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
    if (rule && rule.resource && rule.action) {
      const perms = getRolePermissions(role as any);
      const allowed = perms.some((p) => p.resource === rule.resource && p.actions.includes(rule.action!));
      if (!allowed) {
        if (AUTH_DEBUG) {
          // eslint-disable-next-line no-console
          console.log('[AUTH_DEBUG][middleware] redirect -> role home (shared rule denied)', {
            pathname,
            role,
            rule,
          });
        }
        const url = req.nextUrl.clone();
        url.pathname = getRoleConfig(role as any).defaultHomePage;
        return NextResponse.redirect(url);
      }
    }
  }

  const sessionTenant = (token as any).tenantId;
  if (sessionTenant && sessionTenant !== tenantId) {
    if (AUTH_DEBUG) {
      // eslint-disable-next-line no-console
      console.log('[AUTH_DEBUG][middleware] redirect -> /login (tenant mismatch)', {
        pathname,
        tenantId,
        sessionTenant,
      });
    }
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
