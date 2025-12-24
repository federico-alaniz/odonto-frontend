import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const COOKIE_DOMAIN = process.env.NEXTAUTH_COOKIE_DOMAIN;
const AUTH_DEBUG = process.env.AUTH_DEBUG === '1';

const getSubdomainFromHost = (host?: string | null) => {
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

const resolveCache = new Map<string, string>();

const resolveClinicIdFromSubdomain = async (subdomain: string) => {
  if (!subdomain) return 'clinic_001';
  if (subdomain === 'clinic_001') return 'clinic_001';
  if (resolveCache.has(subdomain)) return resolveCache.get(subdomain) as string;

  try {
    const url = `${API_URL}/api/clinics/resolve?subdomain=${encodeURIComponent(subdomain)}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json().catch(() => null);
    const clinicId = data?.success ? data?.data?.clinicId : null;
    if (clinicId) {
      resolveCache.set(subdomain, clinicId);
      return clinicId;
    }
  } catch {
    // ignore
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
        const subdomain = getSubdomainFromHost(host);
        const tenantId = await resolveClinicIdFromSubdomain(subdomain);

        
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Clinic-Id': tenantId,
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json().catch(() => null);

        

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
