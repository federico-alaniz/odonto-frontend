'use client';

import { createContext, useContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { User, UserRole, AuthContextType } from '../types/roles';
import { getRoleConfig } from '../utils/roleConfig';
import { usersService } from '../services/api/users.service';

const AUTH_DEBUG = process.env.NEXT_PUBLIC_AUTH_DEBUG === '1';

// Contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios demo para testing en Fase 1
const DEMO_USERS: Record<UserRole, any> = {
  admin: {
    id: 'admin_001',
    role: 'admin',
    name: 'María González',
    email: 'admin@mediclinic.com',
    avatar: '/avatars/admin.jpg',
    department: 'Administración',
    permissions: getRoleConfig('admin').defaultPermissions,
    isActive: true,
    lastLogin: new Date('2025-10-20T08:00:00'),
    createdAt: new Date('2025-01-15T10:00:00'),
    updatedAt: new Date('2025-10-20T08:00:00')
  },
  doctor: {
    id: 'doctor_001',
    role: 'doctor',
    name: 'Dr. Juan Pérez',
    email: 'juan.perez@mediclinic.com',
    avatar: '/avatars/doctor.jpg',
    department: 'Cardiología',
    specialization: 'Cardiología Clínica',
    permissions: getRoleConfig('doctor').defaultPermissions,
    isActive: true,
    lastLogin: new Date('2025-10-20T07:30:00'),
    createdAt: new Date('2025-02-01T09:00:00'),
    updatedAt: new Date('2025-10-20T07:30:00')
  },
  secretary: {
    id: 'secretary_001',
    role: 'secretary',
    name: 'Ana Martínez',
    email: 'ana.martinez@mediclinic.com',
    avatar: '/avatars/secretary.jpg',
    department: 'Recepción',
    permissions: getRoleConfig('secretary').defaultPermissions,
    isActive: true,
    lastLogin: new Date('2025-10-20T08:15:00'),
    createdAt: new Date('2025-01-20T11:00:00'),
    updatedAt: new Date('2025-10-20T08:15:00')
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, status } = useSession();
  const sessionUser = (session as any)?.user as Partial<User> | undefined;
  const sessionRole = ((session as any)?.role ?? (sessionUser as any)?.role) as UserRole | undefined;
  const baseUser = useMemo(() => {
    return sessionUser && sessionRole
      ? ({
          ...(sessionUser as any),
          role: sessionRole,
          permissions: (sessionUser as any)?.permissions ?? getRoleConfig(sessionRole).defaultPermissions,
        } as User)
      : null;
  }, [sessionRole, sessionUser]);

  const [hydratedUser, setHydratedUser] = useState<User | null>(null);

  useEffect(() => {
    setHydratedUser(baseUser);
  }, [baseUser]);

  useEffect(() => {
    if (!baseUser?.id) return;

    const tenantId = ((session as any)?.tenantId ?? (sessionUser as any)?.tenantId ?? 'clinic_001') as string;

    void (async () => {
      try {
        const res = await usersService.getProfile(baseUser.id as any, tenantId);
        if (!res?.success || !res?.data) return;
        setHydratedUser({
          ...baseUser,
          ...(res.data as any),
          role: baseUser.role,
          permissions: baseUser.permissions,
        });
      } catch {
        // ignore
      }
    })();
  }, [baseUser?.id, session, sessionRole, sessionUser]);

  const currentUser = hydratedUser;
  const isLoading = status === 'loading';

  const login = (user: User) => {
    // Compatibility shim: the app calls login(user) in some places.
    // The real login flow should use credentials in /login which calls signIn.
    // If invoked, attempt credentials sign-in using the user's email; password must be provided via /login.
    void signIn('credentials', { email: user.email, password: '', redirect: false });
  };

  const logout = () => {
    void (async () => {
      await signOut({ redirect: false });
      window.location.href = '/login';
    })();
  };

  const switchRole = (_role: UserRole) => {
    // Disabled: role switching was only for demo/testing.
    // Keep as no-op to avoid breaking callers.
    return;
  };

  const hasPermission = (resource: string, action: string, scope?: string): boolean => {
    if (!currentUser) return false;

    const permissionKey = `${resource}:${action}`;
    
    // Verificar si el permiso está específicamente revocado
    if (currentUser.customPermissions?.revoked?.includes(permissionKey)) {
      return false;
    }
    
    // Verificar si el permiso está específicamente otorgado
    if (currentUser.customPermissions?.granted?.includes(permissionKey)) {
      return true;
    }
    
    // Verificar permisos del rol base
    return currentUser.permissions.some(permission => {
      // Admin con wildcard tiene todos los permisos (a menos que estén revocados)
      if (permission.resource === '*') return true;
      
      const hasResource = permission.resource === resource;
      const hasAction = permission.actions.includes(action as 'create' | 'read' | 'update' | 'delete');
      const hasScope = !scope || permission.scope === scope || permission.scope === 'all';
      
      return hasResource && hasAction && hasScope;
    });
  };

  const canAccess = (feature: string): boolean => {
    if (!currentUser) return false;
    const roleConfig = getRoleConfig(currentUser.role);
    return roleConfig.features.includes(feature);
  };

  const value: AuthContextType = {
    currentUser,
    login,
    logout,
    switchRole,
    isLoading,
    hasPermission,
    canAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook específico para verificar si el usuario tiene un rol específico
export const useRole = (requiredRole: UserRole): boolean => {
  const { currentUser } = useAuth();
  return currentUser?.role === requiredRole;
};

// Hook para verificar si el usuario tiene uno de varios roles
export const useRoles = (requiredRoles: UserRole[]): boolean => {
  const { currentUser } = useAuth();
  return currentUser ? requiredRoles.includes(currentUser.role) : false;
};

// Hook para obtener información del rol actual
export const useCurrentRole = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return null;
  }

  const roleConfig = getRoleConfig(currentUser.role);
  
  return {
    role: currentUser.role,
    config: roleConfig,
    theme: roleConfig.theme,
    features: roleConfig.features,
    permissions: currentUser.permissions,
    sidebarSections: roleConfig.sidebarSections
  };
};

// Función de utilidad para obtener usuarios demo (útil para testing)
export const getDemoUsers = () => DEMO_USERS;

// Función para obtener un usuario demo específico
export const getDemoUser = (role: UserRole): User => DEMO_USERS[role] as User;