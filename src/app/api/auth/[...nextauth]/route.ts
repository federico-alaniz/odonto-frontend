import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const COOKIE_DOMAIN = process.env.NEXTAUTH_COOKIE_DOMAIN;
const AUTH_DEBUG = process.env.AUTH_DEBUG === '1';

/**
 * Extrae el tenant_id del path del callback URL
 * Formato esperado: /[tenant_id]/... en el callbackUrl
 */
const getTenantFromCallbackUrl = (callbackUrl?: string): string => {
  if (!callbackUrl) return 'clinic_001';
  
  try {
    const url = new URL(callbackUrl, 'http://localhost');
    const segments = url.pathname.split('/').filter(Boolean);
    
    // Si hay segmentos y el primero no es una ruta pública
    if (segments.length > 0 && segments[0] !== 'login' && segments[0] !== 'platform' && segments[0] !== 'api') {
      return segments[0];
    }
  } catch {
    // Si falla el parsing, intentar extraer directamente
    const segments = callbackUrl.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0] !== 'login' && segments[0] !== 'platform' && segments[0] !== 'api') {
      return segments[0];
    }
  }
  
  return 'clinic_001';
};

export const authOptions: NextAuthOptions = {
  debug: false,
  logger: {
    error: () => {},
    warn: () => {},
    debug: () => {},
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 2,
  },
  jwt: {
    maxAge: 60 * 60 * 2,
  },
  cookies: COOKIE_DOMAIN
    ? {
        sessionToken: {
          name: 'next-auth.session-token',
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            domain: COOKIE_DOMAIN,
          },
        },
        callbackUrl: {
          name: 'next-auth.callback-url',
          options: {
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            domain: COOKIE_DOMAIN,
          },
        },
        csrfToken: {
          name: 'next-auth.csrf-token',
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            domain: COOKIE_DOMAIN,
          },
        },
      }
    : undefined,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) return null;

        // Extraer tenant del callbackUrl si está disponible
        const callbackUrl = (req as any)?.body?.callbackUrl || (req as any)?.query?.callbackUrl;
        let tenantId = getTenantFromCallbackUrl(callbackUrl);

        // Fallback: intentar obtener de cookies
        if (!tenantId || tenantId === 'clinic_001') {
          const cookies = (req as any)?.cookies;
          const cookieTenant = cookies?.get?.('tenantId')?.value || cookies?.tenantId;
          if (cookieTenant && cookieTenant !== 'clinic_001') {
            tenantId = cookieTenant;
          }
        }

        console.log('🔐 [AUTH] Login attempt:', {
          email,
          callbackUrl,
          tenantId,
          willTryWithoutTenant: !tenantId || tenantId === 'clinic_001',
        });

        // Intentar login con tenant específico si lo tenemos
        let response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(tenantId && tenantId !== 'clinic_001' ? { 'X-Clinic-Id': tenantId } : {}),
          },
          body: JSON.stringify({ email, password }),
        });

        let data = await response.json().catch(() => null);

        // Si falla y usamos clinic_001, intentar sin especificar tenant
        // para que el backend busque al usuario en todas las clínicas
        if (!response.ok && (!tenantId || tenantId === 'clinic_001')) {
          console.log('🔐 [AUTH] First attempt failed, trying without tenant header...');
          response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          data = await response.json().catch(() => null);
        }

        console.log('🔐 [AUTH] Backend response:', {
          ok: response.ok,
          status: response.status,
          success: data?.success,
          userTenant: data?.data?.clinicId,
        });

        if (!response.ok || !data?.success || !data?.data) return null;

        const user = data.data;

        return {
          id: user.id,
          name: user.name || `${user.nombres ?? ''} ${user.apellidos ?? ''}`.trim(),
          email: user.email,
          tenantId: user.clinicId, // Usar siempre el tenant que retorna el backend
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = (user as any).id;
        token.name = (user as any).name;
        token.email = (user as any).email;
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;

        
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).tenantId = (token as any).tenantId;
      (session as any).role = (token as any).role;
      (session as any).user = {
        ...(session.user ?? {}),
        id: token.sub,
        name: token.name,
        email: token.email,
        role: (token as any).role,
        tenantId: (token as any).tenantId,
      };

      
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
