'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  Save,
  ArrowLeft,
  Loader2,
  Shield,
  Briefcase,
  FileText,
  Clock,
  Building2,
  Stethoscope,
  CheckSquare,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/api/users.service';
import { useToast } from '@/components/ui/ToastProvider';
import { UserFormData, HorarioAtencion } from '@/types/roles';
import { clinicSettingsService } from '@/services/api/clinic-settings.service';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [especialidades, setEspecialidades] = useState<Array<{ value: string; label: string }>>([]);
  const [consultorios, setConsultorios] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'doctor'>('personal');
  
  const [formData, setFormData] = useState<Partial<UserFormData>>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    isDoctor: false,
    especialidades: [],
    consultorio: '',
    matricula: '',
    horariosAtencion: [
      { dia: 1, activo: false, horaInicio: '08:00', horaFin: '18:00' },
      { dia: 2, activo: false, horaInicio: '08:00', horaFin: '18:00' },
      { dia: 3, activo: false, horaInicio: '08:00', horaFin: '18:00' },
      { dia: 4, activo: false, horaInicio: '08:00', horaFin: '18:00' },
      { dia: 5, activo: false, horaInicio: '08:00', horaFin: '18:00' },
      { dia: 6, activo: false, horaInicio: '08:00', horaFin: '18:00' }
    ]
  });

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;

  useEffect(() => {
    if (currentUser) {
      const user = currentUser as any;
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        telefono: user.telefono || '',
        fechaNacimiento: user.fechaNacimiento || '',
        genero: user.genero || '',
        direccion: user.direccion || '',
        ciudad: user.ciudad || '',
        provincia: user.provincia || '',
        codigoPostal: user.codigoPostal || '',
        isDoctor: user.isDoctor || false,
        especialidades: user.especialidades || [],
        consultorio: user.consultorio || '',
        matricula: user.matricula || '',
        horariosAtencion: user.horariosAtencion || [
          { dia: 1, activo: false, horaInicio: '08:00', horaFin: '18:00' },
          { dia: 2, activo: false, horaInicio: '08:00', horaFin: '18:00' },
          { dia: 3, activo: false, horaInicio: '08:00', horaFin: '18:00' },
          { dia: 4, activo: false, horaInicio: '08:00', horaFin: '18:00' },
          { dia: 5, activo: false, horaInicio: '08:00', horaFin: '18:00' },
          { dia: 6, activo: false, horaInicio: '08:00', horaFin: '18:00' }
        ]
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [currentUser]);

  // Cargar especialidades y consultorios si es admin
  useEffect(() => {
    if (!clinicId || currentUser?.role !== 'admin') return;

    void (async () => {
      setIsLoadingSettings(true);
      try {
        const [especialidadesRes, consultoriosRes] = await Promise.all([
          clinicSettingsService.getSpecialties(clinicId),
          clinicSettingsService.getConsultingRooms(clinicId)
        ]);

        if (especialidadesRes.success && especialidadesRes.data) {
          const especialidadesActivas = especialidadesRes.data.filter((esp: any) => esp.active);
          setEspecialidades(especialidadesActivas.map((esp: any) => ({
            value: esp.id,
            label: esp.name
          })));
        }

        if (consultoriosRes.success && consultoriosRes.data) {
          const consultoriosActivos = consultoriosRes.data.filter((cons: any) => cons.active);
          setConsultorios(consultoriosActivos.map((cons: any) => ({
            value: cons.id,
            label: cons.name
          })));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    })();
  }, [clinicId, currentUser?.role]);

  useEffect(() => {
    if (!currentUser?.id) return;

    void (async () => {
      setIsLoading(true);
      try {
        const response = await usersService.getProfile(currentUser.id, clinicId);
        if (!response.success || !response.data) return;

        const user = response.data as any;
        setFormData({
          nombres: user.nombres || '',
          apellidos: user.apellidos || '',
          email: user.email || '',
          telefono: user.telefono || '',
          fechaNacimiento: user.fechaNacimiento || '',
          genero: user.genero || '',
          direccion: user.direccion || '',
          ciudad: user.ciudad || '',
          provincia: user.provincia || '',
          codigoPostal: user.codigoPostal || '',
          isDoctor: user.isDoctor || false,
          especialidades: user.especialidades || [],
          consultorio: user.consultorio || '',
          matricula: user.matricula || '',
          horariosAtencion: user.horariosAtencion || [
            { dia: 1, activo: false, horaInicio: '08:00', horaFin: '18:00' },
            { dia: 2, activo: false, horaInicio: '08:00', horaFin: '18:00' },
            { dia: 3, activo: false, horaInicio: '08:00', horaFin: '18:00' },
            { dia: 4, activo: false, horaInicio: '08:00', horaFin: '18:00' },
            { dia: 5, activo: false, horaInicio: '08:00', horaFin: '18:00' },
            { dia: 6, activo: false, horaInicio: '08:00', horaFin: '18:00' }
          ]
        });
        setAvatarPreview(user.avatar || null);
      } catch (_error) {
        showError('Error al cargar perfil', 'No se pudo obtener tu información. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clinicId, currentUser?.id, showError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEspecialidadToggle = (especialidadId: string) => {
    setFormData(prev => {
      const currentEspecialidades = prev.especialidades || [];
      const isSelected = currentEspecialidades.includes(especialidadId);
      
      return {
        ...prev,
        especialidades: isSelected
          ? currentEspecialidades.filter(id => id !== especialidadId)
          : [...currentEspecialidades, especialidadId]
      };
    });
  };

  const handleHorarioChange = (diaIndex: number, field: 'activo' | 'horaInicio' | 'horaFin', value: boolean | string) => {
    setFormData(prev => {
      const newHorarios = [...(prev.horariosAtencion || [])];
      if (newHorarios[diaIndex]) {
        newHorarios[diaIndex] = {
          ...newHorarios[diaIndex],
          [field]: value
        };
      }
      return { ...prev, horariosAtencion: newHorarios };
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showError('Archivo inválido', 'Por favor selecciona una imagen');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Archivo muy grande', 'El tamaño máximo es 5MB');
      return;
    }

    // Preview local y guardar en formData
    const reader = new FileReader();
    reader.onloadend = () => {
      const localUrl = reader.result as string;
      setAvatarPreview(localUrl);
      // Agregar el avatar al formData para enviarlo al backend
      setFormData(prev => ({ ...prev, avatar: localUrl }));
    };
    reader.readAsDataURL(file);

    showSuccess('Avatar cargado', 'Guarda los cambios para actualizar tu foto de perfil');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;

    setIsSaving(true);
    try {
      const response = await usersService.updateProfile(formData, clinicId, currentUser.id);
      
      if (response.success && response.data) {
        showSuccess('Perfil actualizado', 'Tus datos han sido guardados correctamente');

        const user = response.data as any;
        setFormData({
          nombres: user.nombres || '',
          apellidos: user.apellidos || '',
          email: user.email || '',
          telefono: user.telefono || '',
          fechaNacimiento: user.fechaNacimiento || '',
          genero: user.genero || '',
          direccion: user.direccion || '',
          ciudad: user.ciudad || '',
          provincia: user.provincia || '',
          codigoPostal: user.codigoPostal || '',
          isDoctor: user.isDoctor || false,
          especialidades: user.especialidades || [],
          consultorio: user.consultorio || '',
          matricula: user.matricula || '',
          horariosAtencion: user.horariosAtencion || [
            { dia: 1, activo: false, horaInicio: '08:00', horaFin: '18:00' },
            { dia: 2, activo: false, horaInicio: '08:00', horaFin: '18:00' },
            { dia: 3, activo: false, horaInicio: '08:00', horaFin: '18:00' },
            { dia: 4, activo: false, horaInicio: '08:00', horaFin: '18:00' },
            { dia: 5, activo: false, horaInicio: '08:00', horaFin: '18:00' },
            { dia: 6, activo: false, horaInicio: '08:00', horaFin: '18:00' }
          ]
        });
        setAvatarPreview(user.avatar || null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Error al actualizar', 'No se pudo guardar tu perfil. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-800', icon: Shield },
      doctor: { label: 'Doctor', color: 'bg-green-100 text-green-800', icon: Briefcase },
      secretary: { label: 'Secretaria', color: 'bg-blue-100 text-blue-800', icon: FileText }
    };
    return badges[role as keyof typeof badges] || badges.doctor;
  };

  const roleBadge = getRoleBadge(currentUser.role);
  const RoleIcon = roleBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-sm">
                <UserIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                <p className="text-gray-600 mt-1">Gestiona tu información personal y configuración</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        <div className="w-full max-w-6xl mx-auto">
          {/* Avatar y Info Básica */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{currentUser.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  type="button"
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentUser.name}
                </h2>
                <p className="text-sm text-gray-600">{currentUser.email}</p>
                
                <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${roleBadge.color}`}>
                  <RoleIcon className="w-4 h-4" />
                  {roleBadge.label}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {currentUser.department && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{currentUser.department}</span>
                    </div>
                  )}
                  {currentUser.specialization && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{currentUser.specialization}</span>
                    </div>
                  )}
                  {currentUser.createdAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        Miembro desde {new Date(currentUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex gap-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'personal'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Información Personal
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('doctor')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'doctor'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Configuración como Doctor
                  </button>
                )}
              </nav>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {/* Tab: Información Personal */}
                {activeTab === 'personal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="nombres"
                          value={formData.nombres}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellidos *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="apellidos"
                          value={formData.apellidos}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">El email no puede ser modificado</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Nacimiento
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          name="fechaNacimiento"
                          value={formData.fechaNacimiento}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Género
                      </label>
                      <select
                        name="genero"
                        value={formData.genero}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provincia
                      </label>
                      <input
                        type="text"
                        name="provincia"
                        value={formData.provincia}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        name="codigoPostal"
                        value={formData.codigoPostal}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Tab: Configuración como Doctor */}
                {activeTab === 'doctor' && currentUser.role === 'admin' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isDoctor || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, isDoctor: e.target.checked }))}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">También soy doctor y atiendo pacientes</span>
                          <p className="text-sm text-gray-600 mt-1">
                            Activa esta opción si además de tus funciones administrativas, también atiendes pacientes. 
                            Podrás configurar tus especialidades, consultorio y horarios de atención.
                          </p>
                        </div>
                      </label>
                    </div>

                    {formData.isDoctor && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Especialidades *
                          </label>
                          {isLoadingSettings ? (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Cargando especialidades...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {especialidades.map((esp) => (
                                <label
                                  key={esp.value}
                                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    formData.especialidades?.includes(esp.value)
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.especialidades?.includes(esp.value) || false}
                                    onChange={() => handleEspecialidadToggle(esp.value)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">{esp.label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Consultorio
                            </label>
                            {isLoadingSettings ? (
                              <div className="flex items-center gap-2 text-gray-500 py-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Cargando...</span>
                              </div>
                            ) : (
                              <select
                                name="consultorio"
                                value={formData.consultorio || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Seleccionar consultorio...</option>
                                {consultorios.map((cons) => (
                                  <option key={cons.value} value={cons.value}>
                                    {cons.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Matrícula Profesional
                            </label>
                            <input
                              type="text"
                              name="matricula"
                              value={formData.matricula || ''}
                              onChange={handleInputChange}
                              placeholder="Ej: MP 12345"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Horarios de Atención
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((dia, index) => {
                              const horario = formData.horariosAtencion?.[index];
                              return (
                                <div key={index} className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <input
                                      type="checkbox"
                                      checked={horario?.activo || false}
                                      onChange={(e) => handleHorarioChange(index, 'activo', e.target.checked)}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{dia}</span>
                                  </div>
                                  
                                  {horario?.activo && (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="time"
                                        value={horario.horaInicio}
                                        onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                      <span className="text-gray-500 text-sm">a</span>
                                      <input
                                        type="time"
                                        value={horario.horaFin}
                                        onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Botones */}
                <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
