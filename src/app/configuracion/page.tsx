'use client';

import { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Info } from 'lucide-react';
import MedicalFormContainer from '@/components/forms/MedicalFormContainer';
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import MedicalSelectField from '@/components/forms/MedicalSelectField';
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';
import MedicalButton from '@/components/forms/MedicalButton';
import { userSettingsService, UserSettings } from '@/services/api/user-settings.service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';

export default function ConfiguracionPage() {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState<UserSettings>({
    notificacionesEmail: true,
    notificacionesPush: true,
    notificacionesCitas: true,
    sesionExpira: '8'
  });

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  const userId = (currentUser as any)?.id;

  useEffect(() => {
    const loadSettings = async () => {
      if (!clinicId || !userId) return;
      
      try {
        setLoading(true);
        const response = await userSettingsService.getSettings(clinicId, userId);
        if (response.success) {
          setSettings(response.data);
        }
      } catch (error: any) {
        console.error('Error al cargar configuración:', error);
        showError(error.message || 'Error al cargar configuración');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [clinicId, userId, showError]);

  const handleSettingChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!clinicId || !userId) {
      showError('Error de autenticación');
      return;
    }

    try {
      setSaving(true);
      const response = await userSettingsService.updateSettings(clinicId, userId, settings);
      if (response.success) {
        showSuccess('Configuración guardada correctamente');
      }
    } catch (error: any) {
      console.error('Error al guardar configuración:', error);
      showError(error.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Personaliza la experiencia y configuración del sistema
                </p>
              </div>
            </div>
            
            <MedicalButton
              variant="primary"
              onClick={handleSave}
              loading={saving}
              loadingText="Guardando..."
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md"
            >
              Guardar Configuración
            </MedicalButton>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <span>Sistema</span>
            <span>•</span>
            <span className="text-indigo-600 font-medium">Configuración</span>
            <span>•</span>
            <span className="text-gray-700">Preferencias Generales</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <MedicalFormContainer>
          
          {/* Notificaciones */}
          <MedicalFormSection
            title="Notificaciones"
            description="Gestiona cómo y cuándo recibir notificaciones"
            icon={Bell}
            iconColor="text-orange-600"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notificaciones por Email</h4>
                  <p className="text-sm text-gray-500">Recibir notificaciones importantes por correo electrónico</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notificacionesEmail', !settings.notificacionesEmail)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notificacionesEmail ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notificacionesEmail ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notificaciones Push</h4>
                  <p className="text-sm text-gray-500">Mostrar notificaciones en el navegador</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notificacionesPush', !settings.notificacionesPush)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notificacionesPush ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notificacionesPush ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Recordatorios de Citas</h4>
                  <p className="text-sm text-gray-500">Recibir recordatorios antes de las citas programadas</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notificacionesCitas', !settings.notificacionesCitas)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notificacionesCitas ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notificacionesCitas ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </MedicalFormSection>

          {/* Seguridad */}
          <MedicalFormSection
            title="Seguridad"
            description="Configuración de seguridad y privacidad"
            icon={Shield}
            iconColor="text-red-600"
          >
            <MedicalFieldGroup>
              <MedicalSelectField
                label="Tiempo de Expiración de Sesión"
                value={settings.sesionExpira}
                onChange={(value) => handleSettingChange('sesionExpira', value)}
                options={[
                  { value: '1', label: '1 hora' },
                  { value: '4', label: '4 horas' },
                  { value: '8', label: '8 horas' },
                  { value: '24', label: '24 horas' },
                  { value: '0', label: 'Nunca (no recomendado)' }
                ]}
              />
            </MedicalFieldGroup>
          </MedicalFormSection>

        </MedicalFormContainer>
      </div>
    </div>
  );
}