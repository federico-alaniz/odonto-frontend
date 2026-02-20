import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const COOKIE_DOMAIN = process.env.NEXTAUTH_COOKIE_DOMAIN;
const AUTH_DEBUG = process.env.AUTH_DEBUG === '1';

// Ya no necesitamos extraer tenant del callbackUrl
// El tenant se maneja completamente por sesión/JWT

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

        // Intentar login sin especificar tenant
        // El backend buscará al usuario en todas las clínicas
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json().catch(() => null);

        // Logs de diagnóstico para producción (Vercel)

        if (!response.ok || !data?.success || !data?.data) {
          return null;
        }

        const user = data.data;

        return {
          id: user.id,
          name: user.name || `${user.nombres ?? ''} ${user.apellidos ?? ''}`.trim(),
          email: user.email,
          tenantId: user.clinicId, // El backend retorna la clínica del usuario
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
