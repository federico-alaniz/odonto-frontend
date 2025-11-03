'use client';

import React from 'react';
import { useAuth, useCurrentRole } from '../../hooks/useAuth';
import { UserRole } from '../../types/roles';
import { User, Crown, Stethoscope } from 'lucide-react';

export const RoleSwitcher = () => {
  const { currentUser, switchRole } = useAuth();
  const roleInfo = useCurrentRole();

  if (!currentUser || !roleInfo) return null;

  const roles: { role: UserRole; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }[] = [
    { 
      role: 'admin', 
      label: 'Administrador', 
      icon: Crown, 
      color: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' 
    },
    { 
      role: 'doctor', 
      label: 'Doctor', 
      icon: Stethoscope, 
      color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
    },
    { 
      role: 'secretary', 
      label: 'Secretaria', 
      icon: User, 
      color: 'bg-pink-100 text-pink-700 border-pink-300 hover:bg-pink-200' 
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">
          🧪 Testing - Cambiar Rol
        </div>
        
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <strong>Usuario Actual:</strong> {currentUser.name}<br />
          <strong>Rol:</strong> {roleInfo.config.displayName}<br />
          <strong>Departamento:</strong> {currentUser.department}
        </div>
        
        <div className="space-y-2">
          {roles.map(({ role, label, icon: Icon, color }) => (
            <button
              key={role}
              onClick={() => switchRole(role)}
              disabled={currentUser.role === role}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded border transition-colors ${
                currentUser.role === role 
                  ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed' 
                  : color
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {currentUser.role === role && (
                <span className="text-xs">(Actual)</span>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          Permisos: {currentUser.permissions.length} activos
        </div>
      </div>
    </div>
  );
};