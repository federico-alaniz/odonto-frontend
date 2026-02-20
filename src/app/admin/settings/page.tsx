'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner, Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/ToastProvider';
import { 
  Settings,
  Building2,
  Bell,
  Shield,
  Database,
  DollarSign,
  Save,
  CheckCircle,
  Info,
  Globe,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  DoorOpen,
  Activity,
  Plus,
  Trash2,
  Edit2,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Briefcase
} from 'lucide-react';
import { clinicSettingsService } from '@/services/api/clinic-settings.service';
import { rolePermissionsService, RoleConfig, RolePermissions } from '@/services/api/role-permissions.service';
import { emailConfigService, EmailConfig } from '@/services/api/email-config.service';
import { useAuth } from '@/hooks/useAuth';

type SettingsTab = 'general' | 'resources' | 'notifications' | 'security' | 'permissions' | 'billing' | 'integrations';

interface MedicalSpecialty {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface SecretaryArea {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface ConsultingRoom {
  id: string;
  number: string;
  name: string;
  floor: string;
  capacity: number;
  equipment: string[];
  active: boolean;
}

interface OperatingRoom {
  id: string;
  number: string;
  name: string;
  floor: string;
  type: 'general' | 'specialized';
  equipment: string[];
  active: boolean;
}

export default function AdminSettingsPage() {
  const { showWarning, showSuccess: showSuccessToast, showError } = useToast();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  const userId = (currentUser as any)?.id;

  const specialtiesStorageKey = clinicId ? `${clinicId}_specialties` : 'clinic_specialties';
  const secretaryAreasStorageKey = clinicId ? `${clinicId}_secretary_areas` : 'clinic_secretary_areas';
  const consultingRoomsStorageKey = clinicId ? `${clinicId}_consulting_rooms` : 'clinic_consulting_rooms';
  const operatingRoomsStorageKey = clinicId ? `${clinicId}_operating_rooms` : 'clinic_operating_rooms';
  const clinicMetaStorageKey = clinicId ? `${clinicId}_clinic_meta` : 'clinic_meta';

  // Estados para recursos clínicos
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [secretaryAreas, setSecretaryAreas] = useState<SecretaryArea[]>([]);
  const [consultingRooms, setConsultingRooms] = useState<ConsultingRoom[]>([]);
  const [operatingRooms, setOperatingRooms] = useState<OperatingRoom[]>([]);
  
  // Estados para roles y permisos
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermissions>>({});
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // Estados para configuración de email
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    enabled: false
  });
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  // Cargar configuración al montar
  useEffect(() => {
    if (!clinicId) return;
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  // Cargar configuración de email cuando se accede a la pestaña de integraciones
  useEffect(() => {
    if (activeTab === 'integrations' && clinicId) {
      loadEmailConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, clinicId]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      if (!clinicId) return;
      const response = await clinicSettingsService.getSettings(clinicId);
      
      if (response.success && response.data) {
        if ((response.data as any).generalSettings) {
          const gs = (response.data as any).generalSettings;
          setGeneralSettings((prev) => ({
            ...prev,
            clinicName: gs.clinicName ?? prev.clinicName,
            clinicAddress: gs.clinicAddress ?? gs.address ?? prev.clinicAddress,
            clinicCity: gs.clinicCity ?? prev.clinicCity,
            clinicProvince: gs.clinicProvince ?? prev.clinicProvince,
            clinicPostalCode: gs.clinicPostalCode ?? prev.clinicPostalCode,
            clinicPhone: gs.clinicPhone ?? gs.phone ?? prev.clinicPhone,
            clinicEmail: gs.clinicEmail ?? gs.email ?? prev.clinicEmail,
            clinicWebsite: gs.clinicWebsite ?? gs.website ?? prev.clinicWebsite,
            clinicLogo: gs.logo ?? prev.clinicLogo,
            timezone: gs.timezone ?? prev.timezone,
            language: gs.language ?? prev.language,
          }));

          const nextLogo = gs.logo ?? '';
          setLogoPreview(nextLogo || null);
          localStorage.setItem(
            clinicMetaStorageKey,
            JSON.stringify({ clinicName: gs.clinicName ?? '', logo: nextLogo })
          );
        }

        setSpecialties(response.data.specialties || []);
        setSecretaryAreas(response.data.secretaryAreas || []);
        setConsultingRooms(response.data.consultingRooms || []);
        setOperatingRooms(response.data.operatingRooms as any || []);
        
        
        // También guardar en localStorage como cache
        localStorage.setItem(specialtiesStorageKey, JSON.stringify(response.data.specialties || []));
        localStorage.setItem(secretaryAreasStorageKey, JSON.stringify(response.data.secretaryAreas || []));
        localStorage.setItem(consultingRoomsStorageKey, JSON.stringify(response.data.consultingRooms || []));
        localStorage.setItem(operatingRoomsStorageKey, JSON.stringify(response.data.operatingRooms || []));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Error al cargar configuración', 'No se pudo cargar la configuración de la clínica');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar roles y permisos
  const loadRoles = async () => {
    if (!clinicId || !userId) return;
    
    try {
      setIsLoadingRoles(true);
      const rolesData = await rolePermissionsService.getAllRoles(clinicId, userId);
      
      // Si no hay roles, inicializarlos automáticamente
      if (!rolesData || rolesData.length === 0) {
        await rolePermissionsService.initializeDefaultRoles(clinicId, userId);
        // Volver a cargar después de inicializar
        const newRolesData = await rolePermissionsService.getAllRoles(clinicId, userId);
        setRoles(newRolesData);
        
        const permissionsMap: Record<string, RolePermissions> = {};
        newRolesData.forEach(role => {
          permissionsMap[role.role] = role.permissions;
        });
        setRolePermissions(permissionsMap);
      } else {
        setRoles(rolesData);
        
        // Convertir array de roles a objeto para fácil acceso
        const permissionsMap: Record<string, RolePermissions> = {};
        rolesData.forEach(role => {
          permissionsMap[role.role] = role.permissions;
        });
        setRolePermissions(permissionsMap);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      showError('Error al cargar roles', 'No se pudieron cargar los roles y permisos. Verifica que el backend esté corriendo.');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  // Cargar roles cuando se cambia a la pestaña de permisos
  useEffect(() => {
    if (activeTab === 'permissions' && roles.length === 0) {
      loadRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Funciones para configuración de email
  const loadEmailConfig = async () => {
    if (!clinicId) return;
    
    try {
      setIsLoadingEmail(true);
      const response = await emailConfigService.getConfig(clinicId);
      
      if (response.success && response.data) {
        setEmailConfig(response.data);
      }
    } catch (error: any) {
      console.error('Error al cargar configuración de email:', error);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleSaveEmailConfig = async () => {
    if (!clinicId || !userId) {
      showError('Error de autenticación');
      return;
    }

    try {
      setIsSavingEmail(true);
      await emailConfigService.saveConfig(clinicId, userId, emailConfig);
      showSuccessToast('Configuración de email guardada correctamente');
    } catch (error: any) {
      showError(error.message || 'Error al guardar configuración de email');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleTestEmailConfig = async () => {
    if (!clinicId) {
      showError('Error de autenticación');
      return;
    }

    if (!testEmail) {
      showError('Por favor, ingresa un email de prueba');
      return;
    }

    try {
      setIsTestingEmail(true);
      await emailConfigService.testConfig(clinicId, testEmail);
      showSuccessToast(`Email de prueba enviado a ${testEmail}`);
    } catch (error: any) {
      showError(error.message || 'Error al enviar email de prueba');
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Manejar cambio de permiso individual con guardado automático
  const handlePermissionChange = async (role: string, resource: keyof RolePermissions, action: string, value: boolean) => {
    if (!clinicId || !userId) return;
    
    // Actualizar estado local inmediatamente
    const updatedPermissions = {
      ...rolePermissions[role],
      [resource]: {
        ...rolePermissions[role]?.[resource],
        [action]: value
      }
    };
    
    setRolePermissions(prev => ({
      ...prev,
      [role]: updatedPermissions
    }));
    
    // Guardar en el backend automáticamente
    try {
      await rolePermissionsService.updateRolePermissions(
        role, 
        { permissions: updatedPermissions }, 
        clinicId, 
        userId
      );
    } catch (error) {
      console.error('Error updating permission:', error);
      // Revertir el cambio en caso de error
      setRolePermissions(prev => ({
        ...prev,
        [role]: rolePermissions[role]
      }));
      showError('Error al actualizar permiso', 'No se pudo guardar el cambio');
    }
  };

  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showOperatingRoomModal, setShowOperatingRoomModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Estados para configuración general
  const [generalSettings, setGeneralSettings] = useState({
    clinicName: '',
    clinicAddress: '',
    clinicCity: '',
    clinicProvince: '',
    clinicPostalCode: '',
    clinicPhone: '',
    clinicEmail: '',
    clinicWebsite: '',
    clinicLogo: '',
    timezone: 'America/Argentina/Buenos_Aires',
    language: 'es',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        showWarning('Archivo inválido', 'Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showWarning('Archivo muy grande', 'El archivo es demasiado grande. Máximo 5MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setGeneralSettings({...generalSettings, clinicLogo: reader.result as string});
      };
      reader.readAsDataURL(file);

      // TODO: Subir el archivo al servidor
      // const formData = new FormData();
      // formData.append('logo', file);
      // const response = await fetch('/api/settings/logo', { method: 'POST', body: formData });
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setGeneralSettings({...generalSettings, clinicLogo: ''});
    // TODO: Eliminar logo del servidor
    // await fetch('/api/settings/logo', { method: 'DELETE' });
  };

  const tabs = [
    { id: 'general' as SettingsTab, label: 'General', icon: Building2, color: 'blue' },
    { id: 'resources' as SettingsTab, label: 'Recursos Clínicos', icon: Stethoscope, color: 'teal' },
    { id: 'notifications' as SettingsTab, label: 'Notificaciones', icon: Bell, color: 'yellow' },
    { id: 'security' as SettingsTab, label: 'Seguridad', icon: Shield, color: 'red' },
    { id: 'permissions' as SettingsTab, label: 'Permisos', icon: Shield, color: 'indigo' },
    { id: 'billing' as SettingsTab, label: 'Facturación', icon: DollarSign, color: 'green' },
    { id: 'integrations' as SettingsTab, label: 'Integraciones', icon: Database, color: 'purple' },
  ];

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      const settingsToSave = {
        generalSettings: {
          clinicName: generalSettings.clinicName,
          address: generalSettings.clinicAddress,
          clinicAddress: generalSettings.clinicAddress,
          clinicCity: generalSettings.clinicCity,
          clinicProvince: generalSettings.clinicProvince,
          clinicPostalCode: generalSettings.clinicPostalCode,
          phone: generalSettings.clinicPhone,
          clinicPhone: generalSettings.clinicPhone,
          email: generalSettings.clinicEmail,
          clinicEmail: generalSettings.clinicEmail,
          website: generalSettings.clinicWebsite,
          clinicWebsite: generalSettings.clinicWebsite,
          timezone: generalSettings.timezone,
          language: generalSettings.language,
          logo: generalSettings.clinicLogo || null,
        } as any,
        specialties,
        consultingRooms,
        operatingRooms
      };
      
      
      // Guardar en el backend
      const response = await clinicSettingsService.updateSettings(
        clinicId,
        settingsToSave,
        userId
      );
      
      if (response.success) {
        // También guardar en localStorage como cache
        localStorage.setItem(specialtiesStorageKey, JSON.stringify(specialties));
        localStorage.setItem(consultingRoomsStorageKey, JSON.stringify(consultingRooms));
        localStorage.setItem(operatingRoomsStorageKey, JSON.stringify(operatingRooms));

        localStorage.setItem(
          clinicMetaStorageKey,
          JSON.stringify({ clinicName: generalSettings.clinicName, logo: generalSettings.clinicLogo })
        );
        window.dispatchEvent(new Event('clinicSettingsUpdated'));
        
        setShowSuccess(true);
        showSuccessToast('Configuración guardada', 'Los cambios se han guardado exitosamente');
        setTimeout(() => setShowSuccess(false), 3000);
        
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error al guardar', 'No se pudo guardar la configuración. Por favor, intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const getTabColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      teal: 'text-blue-600 bg-blue-50 border-blue-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      red: 'text-red-600 bg-red-50 border-red-200',
      indigo: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-blue-600 bg-blue-50 border-blue-200',
      purple: 'text-blue-600 bg-blue-50 border-blue-200',
      pink: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleAddSpecialty = async (specialty: Omit<MedicalSpecialty, 'id'>) => {
    const newSpecialty = { ...specialty, id: Date.now().toString() };
    const updatedSpecialties = [...specialties, newSpecialty];
    setSpecialties(updatedSpecialties);
    setShowSpecialtyModal(false);
    
    // Guardar automáticamente
    try {
      await clinicSettingsService.updateSpecialties(clinicId, updatedSpecialties, userId);
      localStorage.setItem(specialtiesStorageKey, JSON.stringify(updatedSpecialties));
      showSuccessToast('Especialidad agregada', 'La especialidad se ha guardado exitosamente');
    } catch (error) {
      console.error('Error guardando especialidad:', error);
      showError('Error al guardar', 'No se pudo guardar la especialidad');
      // Revertir cambio en caso de error
      setSpecialties(specialties);
    }
  };

  const handleDeleteSpecialty = async (id: string) => {
    const updatedSpecialties = specialties.filter(s => s.id !== id);
    setSpecialties(updatedSpecialties);
    
    // Guardar automáticamente
    try {
      await clinicSettingsService.updateSpecialties(clinicId, updatedSpecialties, userId);
      localStorage.setItem(specialtiesStorageKey, JSON.stringify(updatedSpecialties));
      showSuccessToast('Especialidad eliminada', 'La especialidad se ha eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando especialidad:', error);
      showError('Error al eliminar', 'No se pudo eliminar la especialidad');
      // Revertir cambio en caso de error
      setSpecialties(specialties);
    }
  };

  const handleToggleSpecialty = async (id: string) => {
    const updatedSpecialties = specialties.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setSpecialties(updatedSpecialties);
    
    // Guardar automáticamente
    try {
      await clinicSettingsService.updateSpecialties(clinicId, updatedSpecialties, userId);
      localStorage.setItem(specialtiesStorageKey, JSON.stringify(updatedSpecialties));
    } catch (error) {
      console.error('Error actualizando especialidad:', error);
      showError('Error al actualizar', 'No se pudo actualizar la especialidad');
      // Revertir cambio en caso de error
      setSpecialties(specialties);
    }
  };

  const handleAddArea = async (area: Omit<SecretaryArea, 'id'>) => {
    const newArea = { ...area, id: Date.now().toString() };
    const updatedAreas = [...secretaryAreas, newArea];
    setSecretaryAreas(updatedAreas);
    setShowAreaModal(false);
    
    // Guardar automáticamente
    try {
      await clinicSettingsService.updateSecretaryAreas(clinicId, updatedAreas, userId);
      localStorage.setItem(secretaryAreasStorageKey, JSON.stringify(updatedAreas));
      showSuccessToast('Área agregada', 'El área se ha guardado exitosamente');
    } catch (error) {
      console.error('Error guardando área:', error);
      showError('Error al guardar', 'No se pudo guardar el área');
      // Revertir cambio en caso de error
      setSecretaryAreas(secretaryAreas);
    }
  };

  const handleDeleteArea = async (id: string) => {
    const updatedAreas = secretaryAreas.filter(a => a.id !== id);
    setSecretaryAreas(updatedAreas);
    
    // Guardar automáticamente
    try {
      await clinicSettingsService.updateSecretaryAreas(clinicId, updatedAreas, userId);
      localStorage.setItem(secretaryAreasStorageKey, JSON.stringify(updatedAreas));
      showSuccessToast('Área eliminada', 'El área se ha eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando área:', error);
      showError('Error al eliminar', 'No se pudo eliminar el área');
      // Revertir cambio en caso de error
      setSecretaryAreas(secretaryAreas);
    }
  };

  const handleToggleArea = async (id: string) => {
    const updatedAreas = secretaryAreas.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setSecretaryAreas(updatedAreas);
    
    // Guardar automáticamente
    try {
      await clinicSettingsService.updateSecretaryAreas(clinicId, updatedAreas, userId);
      localStorage.setItem(secretaryAreasStorageKey, JSON.stringify(updatedAreas));
    } catch (error) {
      console.error('Error actualizando área:', error);
      showError('Error al actualizar', 'No se pudo actualizar el área');
      // Revertir cambio en caso de error
      setSecretaryAreas(secretaryAreas);
    }
  };

  const handleAddRoom = async (room: Omit<ConsultingRoom, 'id'>) => {
    const newRoom = { ...room, id: Date.now().toString() };
    const updatedRooms = [...consultingRooms, newRoom];
    setConsultingRooms(updatedRooms);
    setShowRoomModal(false);
    
    // Guardar automáticamente
    try {
      await clinicSettingsService.updateConsultingRooms(clinicId, updatedRooms, userId);
      localStorage.setItem(consultingRoomsStorageKey, JSON.stringify(updatedRooms));
      showSuccessToast('Consultorio agregado', 'El consultorio se ha guardado exitosamente');
    } catch (error) {
      console.error('Error guardando consultorio:', error);
      showError('Error al guardar', 'No se pudo guardar el consultorio');
      // Revertir cambio en caso de error
      setConsultingRooms(consultingRooms);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    const updatedRooms = consultingRooms.filter(r => r.id !== id);
    setConsultingRooms(updatedRooms);
    
    // Guardar automáticamente
    try {
      await clinicSettingsService.updateConsultingRooms(clinicId, updatedRooms, userId);
      localStorage.setItem(consultingRoomsStorageKey, JSON.stringify(updatedRooms));
      showSuccessToast('Consultorio eliminado', 'El consultorio se ha eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando consultorio:', error);
      showError('Error al eliminar', 'No se pudo eliminar el consultorio');
      // Revertir cambio en caso de error
      setConsultingRooms(consultingRooms);
    }
  };

  const handleAddOperatingRoom = async (room: Omit<OperatingRoom, 'id'>) => {
    const newRoom = { ...room, id: Date.now().toString() };
    const updatedRooms = [...operatingRooms, newRoom];
    setOperatingRooms(updatedRooms);
    setShowOperatingRoomModal(false);
    
    // Guardar automáticamente
    try {
      await clinicSettingsService.updateOperatingRooms(clinicId, updatedRooms, userId);
      localStorage.setItem(operatingRoomsStorageKey, JSON.stringify(updatedRooms));
      showSuccessToast('Quirófano agregado', 'El quirófano se ha guardado exitosamente');
    } catch (error) {
      console.error('Error guardando quirófano:', error);
      showError('Error al guardar', 'No se pudo guardar el quirófano');
      // Revertir cambio en caso de error
      setOperatingRooms(operatingRooms);
    }
  };

  const handleDeleteOperatingRoom = async (id: string) => {
    const updatedRooms = operatingRooms.filter(r => r.id !== id);
    setOperatingRooms(updatedRooms);
    
    // Guardar automáticamente
    try {
      await clinicSettingsService.updateOperatingRooms(clinicId, updatedRooms, userId);
      localStorage.setItem(operatingRoomsStorageKey, JSON.stringify(updatedRooms));
      showSuccessToast('Quirófano eliminado', 'El quirófano se ha eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando quirófano:', error);
      showError('Error al eliminar', 'No se pudo eliminar el quirófano');
      // Revertir cambio en caso de error
      setOperatingRooms(operatingRooms);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando configuración..." />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Administra la configuración general de la clínica
                </p>
              </div>
            </div>
            
            {showSuccess && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-semibold">Cambios guardados exitosamente</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Horizontal Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <nav className="flex items-center gap-2 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                    isActive 
                      ? `${getTabColor(tab.color)} border font-medium shadow-sm` 
                      : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Configuración General</h2>
                        <p className="text-sm text-gray-600 mt-1">Información básica de la clínica y configuración regional</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Información de la Clínica */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Información de la Clínica</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Nombre de la Clínica *
                          </label>
                          <input
                            type="text"
                            value={generalSettings.clinicName}
                            onChange={(e) => setGeneralSettings({...generalSettings, clinicName: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ej: Centro Médico MediCore"
                          />
                        </div>

                        {/* Logo de la Clínica */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Logo de la Clínica
                          </label>
                          <div className="flex items-start gap-4">
                            {/* Preview del logo */}
                            <div className="flex-shrink-0">
                              {logoPreview || generalSettings.clinicLogo ? (
                                <div className="relative group">
                                  <img
                                    src={logoPreview || generalSettings.clinicLogo}
                                    alt="Logo de la clínica"
                                    className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg bg-gray-50"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                    title="Eliminar logo"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                  <ImageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Upload button */}
                            <div className="flex-1 space-y-2">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoUpload}
                                  className="hidden"
                                />
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors w-fit">
                                  <Upload className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {logoPreview || generalSettings.clinicLogo ? 'Cambiar logo' : 'Subir logo'}
                                  </span>
                                </div>
                              </label>
                              <div className="text-xs text-gray-500 space-y-1">
                                <p>• Formatos aceptados: JPG, PNG, SVG</p>
                                <p>• Tamaño máximo: 5MB</p>
                                <p>• Recomendado: 500x500px (cuadrado)</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Dirección *
                          </label>
                          <input
                            type="text"
                            value={generalSettings.clinicAddress}
                            onChange={(e) => setGeneralSettings({...generalSettings, clinicAddress: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ej: Av. Corrientes 1234"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Ciudad *
                          </label>
                          <input
                            type="text"
                            value={generalSettings.clinicCity}
                            onChange={(e) => setGeneralSettings({...generalSettings, clinicCity: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ej: Buenos Aires"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Provincia *
                          </label>
                          <select
                            value={generalSettings.clinicProvince}
                            onChange={(e) => setGeneralSettings({...generalSettings, clinicProvince: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="Buenos Aires">Buenos Aires</option>
                            <option value="Córdoba">Córdoba</option>
                            <option value="Santa Fe">Santa Fe</option>
                            <option value="Mendoza">Mendoza</option>
                            <option value="Tucumán">Tucumán</option>
                            <option value="Entre Ríos">Entre Ríos</option>
                            <option value="Salta">Salta</option>
                            <option value="Chaco">Chaco</option>
                            <option value="Corrientes">Corrientes</option>
                            <option value="Misiones">Misiones</option>
                            <option value="San Juan">San Juan</option>
                            <option value="Jujuy">Jujuy</option>
                            <option value="Río Negro">Río Negro</option>
                            <option value="Neuquén">Neuquén</option>
                            <option value="Formosa">Formosa</option>
                            <option value="Chubut">Chubut</option>
                            <option value="San Luis">San Luis</option>
                            <option value="Catamarca">Catamarca</option>
                            <option value="La Rioja">La Rioja</option>
                            <option value="La Pampa">La Pampa</option>
                            <option value="Santa Cruz">Santa Cruz</option>
                            <option value="Tierra del Fuego">Tierra del Fuego</option>
                            <option value="Santiago del Estero">Santiago del Estero</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Código Postal
                          </label>
                          <input
                            type="text"
                            value={generalSettings.clinicPostalCode}
                            onChange={(e) => setGeneralSettings({...generalSettings, clinicPostalCode: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ej: 1043"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Teléfono *
                          </label>
                          <input
                            type="tel"
                            value={generalSettings.clinicPhone}
                            onChange={(e) => setGeneralSettings({...generalSettings, clinicPhone: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ej: +54 11 4567-8900"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email *
                          </label>
                          <input
                            type="email"
                            value={generalSettings.clinicEmail}
                            onChange={(e) => setGeneralSettings({...generalSettings, clinicEmail: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ej: contacto@clinica.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Sitio Web
                          </label>
                          <input
                            type="url"
                            value={generalSettings.clinicWebsite}
                            onChange={(e) => setGeneralSettings({...generalSettings, clinicWebsite: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Ej: www.clinica.com"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Resources Settings */}
              {activeTab === 'resources' && (
                <div>
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Stethoscope className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Recursos Clínicos</h2>
                        <p className="text-sm text-gray-600 mt-1">Gestiona especialidades, consultorios y quirófanos</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Especialidades Médicas */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Especialidades Médicas</h3>
                        </div>
                        <button
                          onClick={() => setShowSpecialtyModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar Especialidad
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specialties.map((specialty) => (
                          <div key={specialty.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{specialty.name}</h4>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${specialty.active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>
                                    {specialty.active ? 'Activa' : 'Inactiva'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{specialty.description}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleToggleSpecialty(specialty.id)}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  title={specialty.active ? 'Desactivar' : 'Activar'}
                                >
                                  <Activity className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSpecialty(specialty.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {specialties.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No hay especialidades configuradas</p>
                        </div>
                      )}
                    </div>

                    {/* Áreas de Secretaría */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Áreas de Secretaría</h3>
                        </div>
                        <button
                          onClick={() => setShowAreaModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar Área
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {secretaryAreas.map((area) => (
                          <div key={area.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{area.name}</h4>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${area.active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>
                                    {area.active ? 'Activa' : 'Inactiva'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{area.description}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleToggleArea(area.id)}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  title={area.active ? 'Desactivar' : 'Activar'}
                                >
                                  <Activity className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteArea(area.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {secretaryAreas.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Briefcase className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No hay áreas configuradas</p>
                        </div>
                      )}
                    </div>

                    {/* Consultorios */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <DoorOpen className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Consultorios</h3>
                        </div>
                        <button
                          onClick={() => setShowRoomModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar Consultorio
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {consultingRooms.map((room) => (
                          <div key={room.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{room.name}</span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${room.active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>
                                    {room.active ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">N° {room.number} - Piso {room.floor}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-2 text-sm">
                              <p className="text-gray-600">
                                <span className="font-medium">Capacidad:</span> {room.capacity} personas
                              </p>
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Equipamiento:</p>
                                <div className="flex flex-wrap gap-1">
                                  {room.equipment.map((eq, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                                      {eq}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {consultingRooms.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <DoorOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No hay consultorios configurados</p>
                        </div>
                      )}
                    </div>

                    {/* Quirófanos */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Quirófanos</h3>
                        </div>
                        <button
                          onClick={() => setShowOperatingRoomModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar Quirófano
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {operatingRooms.map((room) => (
                          <div key={room.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{room.name}</span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${room.active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>
                                    {room.active ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">N° {room.number} - Piso {room.floor}</p>
                                <p className="text-sm text-gray-600">
                                  Tipo: <span className="font-medium">{room.type === 'general' ? 'General' : 'Especializado'}</span>
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteOperatingRoom(room.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700 mb-1 text-sm">Equipamiento:</p>
                              <div className="flex flex-wrap gap-1">
                                {room.equipment.map((eq, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded">
                                    {eq}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {operatingRooms.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No hay quirófanos configurados</p>
                        </div>
                      )}
                    </div>

                    {/* Info Box */}
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
                      <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-teal-800">
                        <p className="font-medium mb-1">Información importante</p>
                        <p>Los recursos clínicos configurados aquí estarán disponibles para asignar a médicos, programar citas y gestionar cirugías. Asegúrate de mantener esta información actualizada.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Bell className="w-5 h-5 text-yellow-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
                        <p className="text-sm text-gray-600 mt-1">Configura cómo y cuándo recibir notificaciones</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium text-lg">Sección en desarrollo</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Esta sección incluirá: notificaciones por email/SMS, recordatorios de citas, alertas de nuevos pacientes, alertas de facturación
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Shield className="w-5 h-5 text-red-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Seguridad</h2>
                        <p className="text-sm text-gray-600 mt-1">Configuración de seguridad y control de acceso</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium text-lg">Sección en desarrollo</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Esta sección incluirá: autenticación 2FA, tiempo de sesión, expiración de contraseñas, requisitos de contraseña, intentos de login
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Permissions Settings */}
              {activeTab === 'permissions' && (
                <div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Permisos</h2>
                        <p className="text-sm text-gray-600 mt-1">Gestión de permisos y roles de usuario</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {isLoadingRoles ? (
                      <div className="flex items-center justify-center py-12">
                        <LoadingSpinner message="Cargando roles y permisos..." />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Permisos por Rol */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Permisos por Rol</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Configure los permisos específicos para cada rol de usuario en el sistema.
                              </p>
                            </div>
                            <button
                              onClick={() => loadRoles()}
                              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Recargar
                            </button>
                          </div>

                          <div className="space-y-4">
                            {roles.map((roleConfig) => {
                              const perms = rolePermissions[roleConfig.role] || roleConfig.permissions;
                              const isAdmin = roleConfig.role === 'admin';
                              
                              return (
                                <div key={roleConfig.role} className={`border border-gray-200 rounded-lg p-4 ${isAdmin ? 'bg-gray-50' : ''}`}>
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{roleConfig.displayName}</h4>
                                      <p className="text-xs text-gray-500">{roleConfig.description}</p>
                                    </div>
                                    {isAdmin && (
                                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                        Todos los permisos
                                      </span>
                                    )}
                                  </div>
                                  
                                  {!isAdmin && perms && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                      {/* Pacientes */}
                                      {perms.patients && (
                                        <>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.patients.view || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'patients', 'view', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Ver pacientes</span>
                                          </label>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.patients.create || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'patients', 'create', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Crear pacientes</span>
                                          </label>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.patients.edit || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'patients', 'edit', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Editar pacientes</span>
                                          </label>
                                        </>
                                      )}
                                      
                                      {/* Citas */}
                                      {perms.appointments && (
                                        <>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.appointments.view || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'appointments', 'view', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Ver turnos</span>
                                          </label>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.appointments.create || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'appointments', 'create', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Crear turnos</span>
                                          </label>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.appointments.edit || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'appointments', 'edit', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Editar turnos</span>
                                          </label>
                                        </>
                                      )}
                                      
                                      {/* Registros Médicos */}
                                      {perms.medicalRecords && (
                                        <>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.medicalRecords.view || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'medicalRecords', 'view', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Ver historiales</span>
                                          </label>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.medicalRecords.create || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'medicalRecords', 'create', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Crear registros</span>
                                          </label>
                                        </>
                                      )}
                                      
                                      {/* Facturación */}
                                      {perms.billing && (
                                        <>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.billing.view || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'billing', 'view', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Ver facturación</span>
                                          </label>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.billing.create || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'billing', 'create', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Crear facturas</span>
                                          </label>
                                          <label className="flex items-center gap-2 text-sm">
                                            <input 
                                              type="checkbox" 
                                              checked={perms.billing.edit || false}
                                              onChange={(e) => handlePermissionChange(roleConfig.role, 'billing', 'edit', e.target.checked)}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-gray-700">Editar facturas</span>
                                          </label>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Nota informativa */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900 mb-1">Gestión de Permisos</h4>
                              <p className="text-sm text-blue-700">
                                Los cambios en los permisos se aplicarán a todos los usuarios con el rol correspondiente. 
                                Los administradores siempre tienen acceso completo al sistema. Los registros médicos NO pueden editarse por normativa legal.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Billing Settings */}
              {activeTab === 'billing' && (
                <div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Facturación</h2>
                        <p className="text-sm text-gray-600 mt-1">Configuración de facturación y pagos</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-center py-12">
                      <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium text-lg">Sección en desarrollo</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Esta sección incluirá: moneda, tasa de IVA, prefijo de factura, numeración, métodos de pago, facturación automática, recargos por mora
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations Settings */}
              {activeTab === 'integrations' && (
                <div>
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Mail className="w-5 h-5 text-purple-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Configuración de Email</h2>
                        <p className="text-sm text-gray-600 mt-1">Configura el servidor SMTP para envío de emails</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {isLoadingEmail ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                      </div>
                    ) : (
                      <div className="max-w-3xl space-y-6">
                        {/* Estado del servicio */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="font-medium text-blue-900">Configuración SMTP</h3>
                              <p className="text-sm text-blue-700 mt-1">
                                Configura tu servidor SMTP para enviar emails de confirmación de turnos automáticamente.
                                Soporta Gmail, Outlook y otros proveedores.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Toggle para habilitar/deshabilitar */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">Habilitar envío de emails</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Activar el envío automático de emails de confirmación
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailConfig.enabled}
                              onChange={(e) => setEmailConfig({ ...emailConfig, enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>

                        {/* Configuración SMTP */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900 flex items-center gap-2">
                            <Database className="w-5 h-5 text-purple-600" />
                            Servidor SMTP
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Host SMTP <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={emailConfig.smtpHost}
                                onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                                placeholder="smtp.gmail.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Puerto SMTP <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={emailConfig.smtpPort}
                                onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) || 587 })}
                                placeholder="587"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Usuario SMTP <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={emailConfig.smtpUser}
                                onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                                placeholder="tu-email@gmail.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña SMTP <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="password"
                                value={emailConfig.smtpPassword}
                                onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                                placeholder="••••••••••••••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Para Gmail, usa una contraseña de aplicación
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email remitente <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={emailConfig.fromEmail}
                                onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                                placeholder="clinica@gmail.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre remitente <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={emailConfig.fromName}
                                onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                                placeholder="Clínica Odontológica"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Probar configuración */}
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="font-medium text-gray-900 mb-4">Probar configuración</h3>
                          <div className="flex gap-3">
                            <input
                              type="email"
                              value={testEmail}
                              onChange={(e) => setTestEmail(e.target.value)}
                              placeholder="email@ejemplo.com"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <button
                              onClick={handleTestEmailConfig}
                              disabled={isTestingEmail || !testEmail}
                              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            >
                              {isTestingEmail ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Mail className="w-4 h-4" />
                                  Enviar Prueba
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Enviaremos un email de prueba a la dirección indicada para verificar la configuración
                          </p>
                        </div>

                        {/* Botón guardar */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                          <button
                            onClick={handleSaveEmailConfig}
                            disabled={isSavingEmail}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                          >
                            {isSavingEmail ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save className="w-5 h-5" />
                                Guardar Configuración
                              </>
                            )}
                          </button>
                        </div>

                        {/* Ayuda */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-yellow-900">Configuración para Gmail</h4>
                              <ol className="text-sm text-yellow-800 mt-2 space-y-1 list-decimal list-inside">
                                <li>Habilita la verificación en 2 pasos en tu cuenta de Google</li>
                                <li>Ve a Contraseñas de aplicaciones: myaccount.google.com/apppasswords</li>
                                <li>Genera una contraseña para "Correo" y "Otro dispositivo"</li>
                                <li>Usa esa contraseña de 16 caracteres en el campo "Contraseña SMTP"</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" color="white" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
        </div>

        {/* Modal para Agregar Especialidad */}
        {showSpecialtyModal && <SpecialtyModal onClose={() => setShowSpecialtyModal(false)} onSave={handleAddSpecialty} />}

        {/* Modal para Agregar Área de Secretaría */}
        {showAreaModal && <SecretaryAreaModal onClose={() => setShowAreaModal(false)} onSave={handleAddArea} />}

        {/* Modal para Agregar Consultorio */}
        {showRoomModal && <ConsultingRoomModal onClose={() => setShowRoomModal(false)} onSave={handleAddRoom} />}

        {/* Modal para Agregar Quirófano */}
        {showOperatingRoomModal && <OperatingRoomModal onClose={() => setShowOperatingRoomModal(false)} onSave={handleAddOperatingRoom} />}
      </div>
    </div>
  );
}

// Modal Component para Especialidades
function SpecialtyModal({ onClose, onSave }: { onClose: () => void; onSave: (data: Omit<MedicalSpecialty, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Llamar a la API para crear la especialidad
    // const response = await fetch('/api/specialties', { method: 'POST', body: JSON.stringify(formData) });
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Agregar Especialidad Médica</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la Especialidad *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Ej: Cardiología"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={3}
              placeholder="Breve descripción de la especialidad"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="specialty-active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="specialty-active" className="text-sm text-gray-700">
              Especialidad activa
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component para Áreas de Secretaría
function SecretaryAreaModal({ onClose, onSave }: { onClose: () => void; onSave: (data: Omit<SecretaryArea, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Agregar Área de Secretaría</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Área *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Recepción"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Breve descripción del área"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="area-active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="area-active" className="text-sm text-gray-700">
              Área activa
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component para Consultorios
function ConsultingRoomModal({ onClose, onSave }: { onClose: () => void; onSave: (data: Omit<ConsultingRoom, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    floor: '',
    capacity: 3,
    equipment: [] as string[],
    active: true
  });
  const [equipmentInput, setEquipmentInput] = useState('');

  // Generar nombre sugerido basado en piso y número
  const suggestedName = formData.floor && formData.number 
    ? `Consultorio ${formData.floor}${formData.number.padStart(2, '0')}`
    : '';

  const handleAddEquipment = () => {
    if (equipmentInput.trim()) {
      setFormData({ ...formData, equipment: [...formData.equipment, equipmentInput.trim()] });
      setEquipmentInput('');
    }
  };

  const handleRemoveEquipment = (index: number) => {
    setFormData({ ...formData, equipment: formData.equipment.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Llamar a la API para crear el consultorio
    // const response = await fetch('/api/consulting-rooms', { method: 'POST', body: JSON.stringify(formData) });
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-900">Agregar Consultorio</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Número *
              </label>
              <input
                type="text"
                required
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Ej: 101"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Piso *
              </label>
              <input
                type="text"
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Ej: 1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Consultorio *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder={suggestedName || "Ej: Consultorio 101"}
            />
            {suggestedName && !formData.name && (
              <p className="text-xs text-gray-500">
                Sugerido: <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, name: suggestedName })}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {suggestedName}
                </button>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Capacidad (personas) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Equipamiento
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Ej: Camilla, Tensiómetro"
              />
              <button
                type="button"
                onClick={handleAddEquipment}
                className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.equipment.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.equipment.map((eq, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                    {eq}
                    <button type="button" onClick={() => handleRemoveEquipment(idx)} className="hover:text-teal-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="room-active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="room-active" className="text-sm text-gray-700">
              Consultorio activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component para Quirófanos
function OperatingRoomModal({ onClose, onSave }: { onClose: () => void; onSave: (data: Omit<OperatingRoom, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    floor: '',
    type: 'general' as 'general' | 'specialized',
    equipment: [] as string[],
    active: true
  });
  const [equipmentInput, setEquipmentInput] = useState('');

  const handleAddEquipment = () => {
    if (equipmentInput.trim()) {
      setFormData({ ...formData, equipment: [...formData.equipment, equipmentInput.trim()] });
      setEquipmentInput('');
    }
  };

  const handleRemoveEquipment = (index: number) => {
    setFormData({ ...formData, equipment: formData.equipment.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Llamar a la API para crear el quirófano
    // const response = await fetch('/api/operating-rooms', { method: 'POST', body: JSON.stringify(formData) });
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-900">Agregar Quirófano</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Número *
              </label>
              <input
                type="text"
                required
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Ej: Q1"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Piso *
              </label>
              <input
                type="text"
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Ej: 2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Quirófano *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Ej: Quirófano Principal"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Quirófano *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'general' | 'specialized' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="general">General</option>
              <option value="specialized">Especializado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Equipamiento
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Ej: Mesa quirúrgica, Lámpara cialítica"
              />
              <button
                type="button"
                onClick={handleAddEquipment}
                className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.equipment.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.equipment.map((eq, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                    {eq}
                    <button type="button" onClick={() => handleRemoveEquipment(idx)} className="hover:text-teal-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="operating-room-active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="operating-room-active" className="text-sm text-gray-700">
              Quirófano activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
