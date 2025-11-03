'use client';

import { ReactNode } from 'react';
import { UserRole } from '../../types/roles';
import { useAuth } from '../../hooks/useAuth';
import { Shield, AlertCircle } from 'lucide-react';

// Componente de utilidad para mostrar contenido solo si se cumple el rol
interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children, fallback }: RoleGuardProps) => {
  const { currentUser } = useAuth();
  
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return fallback || (
      <div className="p-8 text-center">
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Acceso Restringido</h3>
          <p className="text-yellow-700">No tienes permisos para ver esta sección.</p>
          <p className="text-sm text-yellow-600 mt-2">
            Roles requeridos: {allowedRoles.join(', ')}
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Componente de utilidad para mostrar loading mientras se carga el usuario
export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Componente para mostrar contenido específico por permiso
interface PermissionGuardProps {
  resource: string;
  action: string;
  scope?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard = ({ 
  resource, 
  action, 
  scope, 
  children, 
  fallback 
}: PermissionGuardProps) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(resource, action, scope)) {
    return fallback || (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-sm text-red-700">
            Sin permisos para {action} en {resource}
          </span>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Componente para mostrar contenido específico por feature
interface FeatureGuardProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureGuard = ({ feature, children, fallback }: FeatureGuardProps) => {
  const { canAccess } = useAuth();
  
  if (!canAccess(feature)) {
    return fallback || (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-gray-600 mr-2" />
          <span className="text-sm text-gray-700">
            Función no disponible: {feature}
          </span>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};