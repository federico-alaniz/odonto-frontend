'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Check, Lock, Unlock, AlertCircle } from 'lucide-react';
import { User } from '@/types/roles';
import { usersService } from '@/services/api/users.service';
import { useToast } from '@/components/ui/ToastProvider';

interface Permission {
  resource: string;
  action: string;
  label: string;
  description: string;
}

interface UserPermissionsModalProps {
  user: User;
  clinicId: string;
  currentUserId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Pacientes
  { resource: 'patients', action: 'create', label: 'Crear pacientes', description: 'Permite registrar nuevos pacientes' },
  { resource: 'patients', action: 'read', label: 'Ver pacientes', description: 'Permite ver información de pacientes' },
  { resource: 'patients', action: 'update', label: 'Editar pacientes', description: 'Permite modificar datos de pacientes' },
  { resource: 'patients', action: 'delete', label: 'Eliminar pacientes', description: 'Permite eliminar pacientes del sistema' },
  
  // Citas
  { resource: 'appointments', action: 'create', label: 'Crear turnos', description: 'Permite agendar nuevos turnos' },
  { resource: 'appointments', action: 'read', label: 'Ver turnos', description: 'Permite ver turnos agendados' },
  { resource: 'appointments', action: 'update', label: 'Editar turnos', description: 'Permite modificar o reprogramar turnos' },
  { resource: 'appointments', action: 'delete', label: 'Cancelar turnos', description: 'Permite cancelar turnos' },
  
  // Historiales médicos
  { resource: 'medical-records', action: 'create', label: 'Crear historiales', description: 'Permite crear registros médicos' },
  { resource: 'medical-records', action: 'read', label: 'Ver historiales', description: 'Permite ver historiales médicos' },
  { resource: 'medical-records', action: 'update', label: 'Editar historiales', description: 'Permite modificar historiales médicos' },
  
  // Consultas
  { resource: 'consultations', action: 'create', label: 'Crear consultas', description: 'Permite registrar nuevas consultas' },
  { resource: 'consultations', action: 'read', label: 'Ver consultas', description: 'Permite ver consultas médicas' },
  { resource: 'consultations', action: 'update', label: 'Editar consultas', description: 'Permite modificar consultas' },
  
  // Facturación
  { resource: 'billing', action: 'create', label: 'Crear facturas', description: 'Permite generar facturas' },
  { resource: 'billing', action: 'read', label: 'Ver facturación', description: 'Permite ver información de facturación' },
  { resource: 'billing', action: 'update', label: 'Editar facturas', description: 'Permite modificar facturas' },
  { resource: 'billing', action: 'delete', label: 'Anular facturas', description: 'Permite anular facturas' },
  
  // Recepción
  { resource: 'reception', action: 'create', label: 'Registrar llegadas', description: 'Permite registrar llegada de pacientes' },
  { resource: 'reception', action: 'read', label: 'Ver recepción', description: 'Permite ver estado de recepción' },
  { resource: 'reception', action: 'update', label: 'Gestionar recepción', description: 'Permite gestionar la recepción' },
  
  // Usuarios (solo admin)
  { resource: 'users', action: 'create', label: 'Crear usuarios', description: 'Permite crear nuevos usuarios del sistema' },
  { resource: 'users', action: 'read', label: 'Ver usuarios', description: 'Permite ver usuarios del sistema' },
  { resource: 'users', action: 'update', label: 'Editar usuarios', description: 'Permite modificar usuarios' },
  { resource: 'users', action: 'delete', label: 'Eliminar usuarios', description: 'Permite eliminar usuarios' },
  
  // Permisos (gestión de permisos)
  { resource: 'permissions', action: 'read', label: 'Ver permisos', description: 'Permite ver permisos de usuarios' },
  { resource: 'permissions', action: 'update', label: 'Gestionar permisos', description: 'Permite otorgar o revocar permisos a usuarios' },
  
  // Reportes
  { resource: 'reports', action: 'read', label: 'Ver reportes', description: 'Permite ver reportes y estadísticas' },
  
  // Configuración
  { resource: 'settings', action: 'read', label: 'Ver configuración', description: 'Permite ver configuración del sistema' },
  { resource: 'settings', action: 'update', label: 'Modificar configuración', description: 'Permite modificar configuración' },
  
  // Sistema
  { resource: 'system', action: 'read', label: 'Ver sistema', description: 'Permite ver información del sistema' },
  { resource: 'system', action: 'update', label: 'Gestionar sistema', description: 'Permite gestionar el sistema' },
];

export default function UserPermissionsModal({
  user,
  clinicId,
  currentUserId,
  onClose,
  onUpdate
}: UserPermissionsModalProps) {
  const { showSuccess, showError } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [grantedPermissions, setGrantedPermissions] = useState<string[]>([]);
  const [revokedPermissions, setRevokedPermissions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'granted' | 'revoked'>('granted');

  useEffect(() => {
    // Cargar permisos personalizados actuales del usuario
    if (user.customPermissions) {
      setGrantedPermissions(user.customPermissions.granted || []);
      setRevokedPermissions(user.customPermissions.revoked || []);
    }
  }, [user]);

  const getPermissionKey = (resource: string, action: string) => {
    return `${resource}:${action}`;
  };

  const hasRolePermission = (resource: string, action: string): boolean => {
    // Verificar si el rol base del usuario tiene este permiso
    if (!user.permissions) return false;
    
    return user.permissions.some(perm => {
      if (perm.resource === '*') return true;
      if (perm.resource === resource && perm.actions.includes(action as any)) return true;
      return false;
    });
  };

  const isPermissionGranted = (resource: string, action: string): boolean => {
    const key = getPermissionKey(resource, action);
    return grantedPermissions.includes(key);
  };

  const isPermissionRevoked = (resource: string, action: string): boolean => {
    const key = getPermissionKey(resource, action);
    return revokedPermissions.includes(key);
  };

  const toggleGrantedPermission = (resource: string, action: string) => {
    const key = getPermissionKey(resource, action);
    
    if (grantedPermissions.includes(key)) {
      setGrantedPermissions(grantedPermissions.filter(p => p !== key));
    } else {
      setGrantedPermissions([...grantedPermissions, key]);
      // Si se otorga un permiso, quitarlo de revocados
      setRevokedPermissions(revokedPermissions.filter(p => p !== key));
    }
  };

  const toggleRevokedPermission = (resource: string, action: string) => {
    const key = getPermissionKey(resource, action);
    
    if (revokedPermissions.includes(key)) {
      setRevokedPermissions(revokedPermissions.filter(p => p !== key));
    } else {
      setRevokedPermissions([...revokedPermissions, key]);
      // Si se revoca un permiso, quitarlo de otorgados
      setGrantedPermissions(grantedPermissions.filter(p => p !== key));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await usersService.updateUser(
        user.id,
        {
          customPermissions: {
            granted: grantedPermissions,
            revoked: revokedPermissions
          }
        } as any,
        clinicId,
        currentUserId
      );
      
      if (response.success) {
        showSuccess('Permisos actualizados', 'Los permisos personalizados han sido guardados exitosamente');
        onUpdate();
        onClose();
      } else {
        showError('Error al guardar', 'No se pudieron actualizar los permisos');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      showError('Error al guardar', 'Ocurrió un error al actualizar los permisos');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      doctor: 'Doctor',
      secretary: 'Secretaria',
      nurse: 'Enfermera'
    };
    return labels[role] || role;
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const resourceLabels: Record<string, string> = {
    patients: 'Pacientes',
    appointments: 'Turnos',
    'medical-records': 'Historiales Médicos',
    consultations: 'Consultas',
    billing: 'Facturación',
    reception: 'Recepción',
    users: 'Usuarios',
    permissions: 'Gestión de Permisos',
    reports: 'Reportes',
    settings: 'Configuración',
    system: 'Sistema'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Permisos Personalizados</h2>
              <p className="text-sm text-gray-600">
                {user.nombres} {user.apellidos} • {getRoleLabel(user.role)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Los permisos personalizados complementan los permisos del rol base</p>
              <p className="text-blue-700">
                • <strong>Otorgar:</strong> Agrega permisos adicionales que el rol no tiene
                <br />
                • <strong>Revocar:</strong> Quita permisos específicos que el rol tiene por defecto
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('granted')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'granted'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4" />
                Permisos Adicionales
                {grantedPermissions.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {grantedPermissions.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('revoked')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'revoked'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Permisos Revocados
                {revokedPermissions.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                    {revokedPermissions.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'granted' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Selecciona permisos adicionales que quieres otorgar a este usuario, más allá de los que ya tiene por su rol.
              </p>
              
              {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                <div key={resource} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    {resourceLabels[resource] || resource}
                  </h3>
                  <div className="space-y-2">
                    {permissions.map((perm) => {
                      const hasRole = hasRolePermission(perm.resource, perm.action);
                      const isGranted = isPermissionGranted(perm.resource, perm.action);
                      const isRevoked = isPermissionRevoked(perm.resource, perm.action);
                      
                      // No mostrar en "otorgar" si ya lo tiene por rol y no está revocado
                      if (hasRole && !isRevoked) {
                        return null;
                      }
                      
                      return (
                        <label
                          key={`${perm.resource}-${perm.action}`}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isGranted
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isGranted}
                            onChange={() => toggleGrantedPermission(perm.resource, perm.action)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{perm.label}</span>
                              {isGranted && <Check className="w-4 h-4 text-green-600" />}
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">{perm.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'revoked' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Selecciona permisos que quieres revocar específicamente a este usuario, aunque su rol los tenga por defecto.
              </p>
              
              {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                <div key={resource} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    {resourceLabels[resource] || resource}
                  </h3>
                  <div className="space-y-2">
                    {permissions.map((perm) => {
                      const hasRole = hasRolePermission(perm.resource, perm.action);
                      const isRevoked = isPermissionRevoked(perm.resource, perm.action);
                      const isGranted = isPermissionGranted(perm.resource, perm.action);
                      
                      // Solo mostrar en "revocar" si lo tiene por rol o está otorgado
                      if (!hasRole && !isGranted) {
                        return null;
                      }
                      
                      return (
                        <label
                          key={`${perm.resource}-${perm.action}`}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isRevoked
                              ? 'bg-red-50 border-red-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isRevoked}
                            onChange={() => toggleRevokedPermission(perm.resource, perm.action)}
                            className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{perm.label}</span>
                              {hasRole && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Por rol
                                </span>
                              )}
                              {isRevoked && <Lock className="w-4 h-4 text-red-600" />}
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">{perm.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {grantedPermissions.length > 0 && (
              <span className="text-green-700 font-medium">
                {grantedPermissions.length} permiso(s) adicional(es)
              </span>
            )}
            {grantedPermissions.length > 0 && revokedPermissions.length > 0 && ' • '}
            {revokedPermissions.length > 0 && (
              <span className="text-red-700 font-medium">
                {revokedPermissions.length} permiso(s) revocado(s)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
