'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '../types/roles';
import { getRoleConfig } from '../utils/roleConfig';

// Contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios demo para testing en Fase 1
const DEMO_USERS: Record<UserRole, User> = {
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario desde localStorage
    const loadStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
        } else {
          // No hay usuario guardado - dejar como null para que redirija al login
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Simular delay de carga
    setTimeout(loadStoredUser, 500);
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Simular evento de login
    console.log(`Usuario ${user.name} (${user.role}) ha iniciado sesión`);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    
    console.log('Usuario ha cerrado sesión');
  };

  const switchRole = (role: UserRole) => {
    const newUser = DEMO_USERS[role];
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    console.log(`Cambiado a rol: ${role} (${newUser.name})`);
  };

  const hasPermission = (resource: string, action: string, scope?: string): boolean => {
    if (!currentUser) return false;

    return currentUser.permissions.some(permission => {
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
export const getDemoUser = (role: UserRole): User => DEMO_USERS[role];