import 'next-auth';

declare module 'next-auth' {
  interface Session {
    tenantId?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tenantId?: string;
    role?: string;
    rawUser?: any;
  }
}
