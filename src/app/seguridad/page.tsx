'use client';

import { useState } from 'react';
import { Shield, Key, Smartphone, Clock, AlertTriangle } from 'lucide-react';
import MedicalFormContainer from '@/components/forms/MedicalFormContainer';
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import MedicalInputField from '@/components/forms/MedicalInputField';
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';
import MedicalButton from '@/components/forms/MedicalButton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import { useTenant } from '@/hooks/useTenant';

export default function SeguridadPage() {
  const { currentUser } = useAuth();
  const { tenantId } = useTenant();
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    // Validaciones
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validar requisitos de contraseña
    const hasUpperCase = /[A-Z]/.test(passwordForm.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordForm.newPassword);
    const hasNumber = /[0-9]/.test(passwordForm.newPassword);
    const hasSpecialChar = /[!@#$%^&*]/.test(passwordForm.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setPasswordError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Clinic-Id': tenantId || '',
          'X-User-Id': currentUser?.id || ''
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Contraseña actualizada exitosamente');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(data.error || 'Error al cambiar la contraseña');
        showError(data.error || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setPasswordError('Error de conexión. Intenta nuevamente.');
      showError('Error de conexión. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    setSaving(true);
    // Simular toggle de 2FA
    setTimeout(() => {
      setSaving(false);
      setTwoFactorEnabled(!twoFactorEnabled);
    }, 1000);
  };

  // Sesiones activas simuladas
  const activeSessions = [
    {
      id: '1',
      device: 'Chrome en Windows',
      location: 'Bogotá, Colombia',
      lastActive: '2025-10-17 14:30',
      current: true
    },
    {
      id: '2',
      device: 'Safari en iPhone',
      location: 'Bogotá, Colombia',
      lastActive: '2025-10-17 10:15',
      current: false
    }
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seguridad</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona la seguridad de tu cuenta y privacidad
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <MedicalFormContainer>
          
          {/* Cambiar Contraseña */}
          <MedicalFormSection
            title="Cambiar Contraseña"
            description="Actualiza tu contraseña para mantener tu cuenta segura"
            icon={Key}
            iconColor="text-blue-600"
          >
            <div className="space-y-4">
              <MedicalInputField
                label="Contraseña Actual"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(value) => handlePasswordChange('currentPassword', value)}
                placeholder="Ingresa tu contraseña actual"
                required
              />
              
              <MedicalFieldGroup>
                <MedicalInputField
                  label="Nueva Contraseña"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(value) => handlePasswordChange('newPassword', value)}
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
                <MedicalInputField
                  label="Confirmar Nueva Contraseña"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(value) => handlePasswordChange('confirmPassword', value)}
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
              </MedicalFieldGroup>

              {passwordError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-800">{passwordError}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Requisitos de la contraseña:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Mínimo 8 caracteres</li>
                  <li>• Al menos una letra mayúscula</li>
                  <li>• Al menos una letra minúscula</li>
                  <li>• Al menos un número</li>
                  <li>• Al menos un carácter especial (!@#$%^&*)</li>
                </ul>
              </div>

              <MedicalButton
                variant="primary"
                onClick={handleChangePassword}
                loading={saving}
                loadingText="Cambiando..."
                disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                Cambiar Contraseña
              </MedicalButton>
            </div>
          </MedicalFormSection>

          {/* Autenticación de Dos Factores */}
          <MedicalFormSection
            title="Autenticación de Dos Factores (2FA)"
            description="Añade una capa extra de seguridad a tu cuenta"
            icon={Smartphone}
            iconColor="text-green-600"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Autenticación de Dos Factores
                  </h4>
                  <p className="text-sm text-gray-500">
                    {twoFactorEnabled 
                      ? 'La autenticación de dos factores está activada' 
                      : 'Añade seguridad extra requiriendo un código de tu teléfono'
                    }
                  </p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {twoFactorEnabled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h4 className="text-sm font-medium text-green-800">2FA Activado</h4>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Tu cuenta está protegida con autenticación de dos factores. Necesitarás tu teléfono para iniciar sesión.
                  </p>
                </div>
              )}
            </div>
          </MedicalFormSection>

          {/* Sesiones Activas */}
          <MedicalFormSection
            title="Sesiones Activas"
            description="Revisa y gestiona dónde has iniciado sesión"
            icon={Clock}
            iconColor="text-purple-600"
          >
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {session.device}
                      </h4>
                      {session.current && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Sesión actual
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {session.location} • Última actividad: {session.lastActive}
                    </p>
                  </div>
                  {!session.current && (
                    <MedicalButton
                      variant="secondary"
                      onClick={() => {
                        // Lógica para cerrar sesión remota
                      }}
                    >
                      Cerrar Sesión
                    </MedicalButton>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <MedicalButton
                  variant="secondary"
                  onClick={() => {
                    // Lógica para cerrar todas las sesiones
                  }}
                >
                  Cerrar Todas las Sesiones Remotas
                </MedicalButton>
              </div>
            </div>
          </MedicalFormSection>

          {/* Zona de Peligro */}
          <MedicalFormSection
            title="Zona de Peligro"
            description="Acciones irreversibles para tu cuenta"
            icon={AlertTriangle}
            iconColor="text-red-600"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="text-sm font-medium text-red-800">Eliminar Cuenta</h4>
              </div>
              <p className="text-sm text-red-700 mb-4">
                Una vez que elimines tu cuenta, no podrás recuperarla. Todos los datos asociados se eliminarán permanentemente.
              </p>
              <button
                onClick={() => {
                  // Lógica para eliminar cuenta (con confirmación)
                  if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Eliminar Cuenta
              </button>
            </div>
          </MedicalFormSection>

        </MedicalFormContainer>
      </div>
    </div>
  );
}