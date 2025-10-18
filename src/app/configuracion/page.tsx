'use client';

import { useState } from 'react';
import { Settings, Bell, Shield, Palette, Globe } from 'lucide-react';
import MedicalFormContainer from '@/components/forms/MedicalFormContainer';
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import MedicalSelectField from '@/components/forms/MedicalSelectField';
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';
import MedicalButton from '@/components/forms/MedicalButton';

export default function ConfiguracionPage() {
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    tema: 'light',
    idioma: 'es',
    timezone: 'America/Bogota',
    notificacionesEmail: true,
    notificacionesPush: true,
    notificacionesCitas: true,
    sesionExpira: '8'
  });

  const handleSettingChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simular guardado
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
              <p className="text-sm text-gray-600 mt-1">
                Personaliza la experiencia de la aplicación
              </p>
            </div>
          </div>
          <MedicalButton
            variant="primary"
            onClick={handleSave}
            loading={saving}
            loadingText="Guardando..."
          >
            Guardar Configuración
          </MedicalButton>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <MedicalFormContainer>
          
          {/* Apariencia */}
          <MedicalFormSection
            title="Apariencia"
            description="Personaliza la apariencia visual de la aplicación"
            icon={Palette}
            iconColor="text-purple-600"
          >
            <MedicalFieldGroup>
              <MedicalSelectField
                label="Tema"
                value={settings.tema}
                onChange={(value) => handleSettingChange('tema', value)}
                options={[
                  { value: 'light', label: 'Claro' },
                  { value: 'dark', label: 'Oscuro' },
                  { value: 'auto', label: 'Automático (según sistema)' }
                ]}
              />
              <MedicalSelectField
                label="Idioma"
                value={settings.idioma}
                onChange={(value) => handleSettingChange('idioma', value)}
                options={[
                  { value: 'es', label: 'Español' },
                  { value: 'en', label: 'English' },
                  { value: 'pt', label: 'Português' }
                ]}
              />
            </MedicalFieldGroup>
          </MedicalFormSection>

          {/* Región y Tiempo */}
          <MedicalFormSection
            title="Región y Tiempo"
            description="Configuración de zona horaria y formato"
            icon={Globe}
            iconColor="text-blue-600"
          >
            <MedicalFieldGroup>
              <MedicalSelectField
                label="Zona Horaria"
                value={settings.timezone}
                onChange={(value) => handleSettingChange('timezone', value)}
                options={[
                  { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
                  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
                  { value: 'America/Lima', label: 'Lima (GMT-5)' },
                  { value: 'America/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
                  { value: 'America/Santiago', label: 'Santiago (GMT-4)' }
                ]}
              />
            </MedicalFieldGroup>
          </MedicalFormSection>

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
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-medium text-amber-800">Configuración de Seguridad Avanzada</h4>
              </div>
              <p className="text-sm text-amber-700 mt-2">
                Para cambiar tu contraseña o configurar autenticación de dos factores, visita la sección de Seguridad.
              </p>
            </div>
          </MedicalFormSection>

        </MedicalFormContainer>
      </div>
    </div>
  );
}