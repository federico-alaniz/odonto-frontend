import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const COOKIE_DOMAIN = process.env.NEXTAUTH_COOKIE_DOMAIN;
const AUTH_DEBUG = process.env.AUTH_DEBUG === '1';

const getTenantIdFromHost = (host?: string | null) => {
  if (!host) return 'clinic_001';
  const cleanHost = host.split(':')[0];
  const parts = cleanHost.split('.');

  // clinic1.localtest.me -> clinic1
  if (parts.length >= 3 && cleanHost.endsWith('localtest.me')) {
    const subdomain = parts[0];
    if (subdomain === 'clinic1') return 'clinic_001';
    return subdomain;
  }

  return 'clinic_001';
};

export const authOptions: NextAuthOptions = {
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

        // App Router passes a Web Request-like object
        const host = (req as any)?.headers?.get?.('host') || (req as any)?.headers?.host;
        const tenantId = getTenantIdFromHost(host);

        if (AUTH_DEBUG) {
          // eslint-disable-next-line no-console
          console.log('[AUTH_DEBUG][nextauth][authorize] start', {
            host,
            tenantId,
            email,
            cookieDomain: COOKIE_DOMAIN,
          });
        }

        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Clinic-Id': tenantId,
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json().catch(() => null);

        if (AUTH_DEBUG) {
          // eslint-disable-next-line no-console
          console.log('[AUTH_DEBUG][nextauth][authorize] backend response', {
            ok: response.ok,
            status: response.status,
            success: data?.success,
            hasUser: Boolean(data?.data),
          });
        }

        if (!response.ok || !data?.success || !data?.data) return null;

        const user = data.data;

        return {
          id: user.id,
          name: user.name || `${user.nombres ?? ''} ${user.apellidos ?? ''}`.trim(),
          email: user.email,
          tenantId: user.clinicId || tenantId,
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

        if (AUTH_DEBUG) {
          // eslint-disable-next-line no-console
          console.log('[AUTH_DEBUG][nextauth][jwt] issued', {
            sub: token.sub,
            role: (token as any).role,
            tenantId: (token as any).tenantId,
          });
        }
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

      if (AUTH_DEBUG) {
        // eslint-disable-next-line no-console
        console.log('[AUTH_DEBUG][nextauth][session] built', {
          sub: token.sub,
          role: (token as any).role,
          tenantId: (token as any).tenantId,
        });
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
