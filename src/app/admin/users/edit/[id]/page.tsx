'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  ChevronDown,
  Search,
  X,
  Check,
  Loader2,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { UserFormData, HorarioAtencion, User as UserType } from '@/types/roles';
import { usersService } from '@/services/api/users.service';
import { useToast } from '@/components/ui/ToastProvider';

const DIAS_SEMANA = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' }
];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { showSuccess, showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<UserFormData>>({});
  const [originalData, setOriginalData] = useState<UserType | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [especialidades, setEspecialidades] = useState<Array<{ value: string; label: string }>>([]);
  const [showEspecialidadesDropdown, setShowEspecialidadesDropdown] = useState(false);
  const [especialidadSearch, setEspecialidadSearch] = useState('');

  // TODO: Obtener estos valores del contexto de autenticación
  const clinicId = 'clinic_001';
  const currentUserId = 'usr_000001';

  // Cargar datos del usuario
  useEffect(() => {
    loadUser();
    loadEspecialidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const response = await usersService.getUserById(userId, clinicId);
      
      if (response.success && response.data) {
        setOriginalData(response.data);
        // Convertir User a UserFormData
        setFormData({
          nombres: response.data.nombres,
          apellidos: response.data.apellidos,
          tipoDocumento: response.data.tipoDocumento,
          numeroDocumento: response.data.numeroDocumento,
          fechaNacimiento: response.data.fechaNacimiento,
          genero: response.data.genero,
          email: response.data.email,
          telefono: response.data.telefono,
          direccion: response.data.direccion,
          role: response.data.role,
          estado: response.data.estado,
          especialidades: response.data.especialidades,
          consultorio: response.data.consultorio,
          matricula: response.data.matricula,
          horariosAtencion: response.data.horariosAtencion,
          turno: response.data.turno,
          area: response.data.area,
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      showError('Error al cargar usuario', 'No se pudo cargar la información del usuario.');
      router.push('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEspecialidades = async () => {
    try {
      const savedSpecialties = localStorage.getItem('clinic_specialties');
      
      if (savedSpecialties) {
        const parsed = JSON.parse(savedSpecialties);
        const especialidadesActivas = parsed.filter((esp: any) => esp.active);
        const formattedEspecialidades = especialidadesActivas.map((esp: any) => ({
          value: esp.id,
          label: esp.name
        }));
        setEspecialidades(formattedEspecialidades);
      }
    } catch (error) {
      console.error('Error loading especialidades:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await usersService.updateUser(
        userId,
        formData as UserFormData,
        clinicId,
        currentUserId
      );
      
      if (response.success) {
        showSuccess('Usuario actualizado', 'El usuario ha sido actualizado exitosamente');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Error al actualizar', 'No se pudo actualizar el usuario. Por favor, intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres?.trim()) newErrors.nombres = 'El nombre es requerido';
    if (!formData.apellidos?.trim()) newErrors.apellidos = 'El apellido es requerido';
    if (!formData.email?.trim()) newErrors.email = 'El email es requerido';
    if (!formData.telefono?.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.role) newErrors.role = 'El rol es requerido';

    // Validaciones específicas por rol
    if (formData.role === 'doctor') {
      if (!formData.especialidades || formData.especialidades.length === 0) {
        newErrors.especialidades = 'Debe seleccionar al menos una especialidad';
      }
      if (!formData.consultorio || !formData.consultorio.trim()) {
        newErrors.consultorio = 'El consultorio es requerido';
      }
      if (!formData.matricula || !formData.matricula.trim()) {
        newErrors.matricula = 'La matrícula es requerida';
      }
    }

    if (formData.role === 'secretary') {
      if (!formData.turno) {
        newErrors.turno = 'El turno es requerido';
      }
      if (!formData.area || !formData.area.trim()) {
        newErrors.area = 'El área es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleEspecialidad = (especialidad: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: (prev.especialidades || []).includes(especialidad)
        ? (prev.especialidades || []).filter(e => e !== especialidad)
        : [...(prev.especialidades || []), especialidad]
    }));
  };

  const removeEspecialidad = (especialidad: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: (prev.especialidades || []).filter(e => e !== especialidad)
    }));
  };

  const filteredEspecialidades = especialidades.filter((esp: { value: string; label: string }) =>
    esp.label.toLowerCase().includes(especialidadSearch.toLowerCase())
  );

  // Funciones para manejar horarios de atención
  const toggleDiaActivo = (dia: number) => {
    const horarios = formData.horariosAtencion || [];
    const horarioIndex = horarios.findIndex(h => h.dia === dia);
    
    if (horarioIndex >= 0) {
      const newHorarios = [...horarios];
      newHorarios[horarioIndex] = {
        ...newHorarios[horarioIndex],
        activo: !newHorarios[horarioIndex].activo
      };
      setFormData({ ...formData, horariosAtencion: newHorarios });
    } else {
      // Crear nuevo horario para este día
      setFormData({
        ...formData,
        horariosAtencion: [
          ...horarios,
          { dia, activo: true, horaInicio: '09:00', horaFin: '17:00' }
        ]
      });
    }
  };

  const updateHorario = (dia: number, field: 'horaInicio' | 'horaFin', value: string) => {
    const horarios = formData.horariosAtencion || [];
    const horarioIndex = horarios.findIndex(h => h.dia === dia);
    
    if (horarioIndex >= 0) {
      const newHorarios = [...horarios];
      newHorarios[horarioIndex] = {
        ...newHorarios[horarioIndex],
        [field]: value
      };
      setFormData({ ...formData, horariosAtencion: newHorarios });
    }
  };

  const getHorarioForDia = (dia: number): HorarioAtencion | undefined => {
    return formData.horariosAtencion?.find(h => h.dia === dia);
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/users"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
              <p className="text-gray-600 mt-1">
                Modificar información de {originalData?.nombres} {originalData?.apellidos}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Información Personal */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    value={formData.nombres || ''}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.nombres && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={formData.apellidos || ''}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.apellidos && (
                    <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="admin">Administrador</option>
                    <option value="doctor">Doctor</option>
                    <option value="secretary">Secretaria</option>
                    <option value="nurse">Enfermera</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={formData.estado || 'activo'}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Campos específicos para Doctor */}
            {formData.role === 'doctor' && (
              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Información Profesional
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Matrícula *
                    </label>
                    <input
                      type="text"
                      value={formData.matricula || ''}
                      onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.matricula && (
                      <p className="mt-1 text-sm text-red-600">{errors.matricula}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultorio *
                    </label>
                    <input
                      type="text"
                      value={formData.consultorio || ''}
                      onChange={(e) => setFormData({ ...formData, consultorio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.consultorio && (
                      <p className="mt-1 text-sm text-red-600">{errors.consultorio}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especialidades *
                    </label>
                    
                    {/* Especialidades seleccionadas */}
                    {formData.especialidades && formData.especialidades.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.especialidades.map((espName) => (
                          <span
                            key={espName}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium border border-blue-200"
                          >
                            {espName}
                            <button
                              type="button"
                              onClick={() => removeEspecialidad(espName)}
                              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Dropdown de especialidades */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEspecialidadesDropdown(!showEspecialidadesDropdown)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                      >
                        <span className="text-gray-700">
                          {formData.especialidades && formData.especialidades.length > 0
                            ? `${formData.especialidades.length} especialidad(es) seleccionada(s)`
                            : 'Seleccionar especialidades...'}
                        </span>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </button>

                      {showEspecialidadesDropdown && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                          <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={especialidadSearch}
                                onChange={(e) => setEspecialidadSearch(e.target.value)}
                                placeholder="Buscar especialidad..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          <div className="max-h-64 overflow-y-auto">
                            {filteredEspecialidades.length > 0 ? (
                              filteredEspecialidades.map((esp: { value: string; label: string }) => {
                                const isSelected = formData.especialidades?.includes(esp.label);
                                return (
                                  <button
                                    key={esp.value}
                                    type="button"
                                    onClick={() => toggleEspecialidad(esp.label)}
                                    className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                      isSelected ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <span className={`text-sm ${isSelected ? 'font-medium text-blue-800' : 'text-gray-700'}`}>
                                      {esp.label}
                                    </span>
                                    {isSelected && <Check className="w-4 h-4 text-green-600" />}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                No se encontraron especialidades
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.especialidades && (
                      <p className="mt-2 text-sm text-red-600">{errors.especialidades}</p>
                    )}
                  </div>

                  {/* Horarios de Atención */}
                  <div className="col-span-2 mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Horarios de Atención
                    </label>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {DIAS_SEMANA.map((dia) => {
                        const horario = getHorarioForDia(dia.value);
                        const isActivo = horario?.activo || false;
                        
                        return (
                          <div key={dia.value} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 w-20">
                              <input
                                type="checkbox"
                                checked={isActivo}
                                onChange={() => toggleDiaActivo(dia.value)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <label className="text-sm font-medium text-gray-700">
                                {dia.label}
                              </label>
                            </div>
                            
                            {isActivo && (
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-600">Desde:</label>
                                  <input
                                    type="time"
                                    value={horario?.horaInicio || '09:00'}
                                    onChange={(e) => updateHorario(dia.value, 'horaInicio', e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-600">Hasta:</label>
                                  <input
                                    type="time"
                                    value={horario?.horaFin || '17:00'}
                                    onChange={(e) => updateHorario(dia.value, 'horaFin', e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                            
                            {!isActivo && (
                              <span className="text-sm text-gray-400 italic">No disponible</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Selecciona los días y horarios en los que el doctor estará disponible para atender pacientes.
                    </p>
                  </div>

                  {/* Configuración de Notificaciones */}
                  <div className="col-span-2 mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Configuración de Notificaciones
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-4">
                        Selecciona qué tipos de notificaciones deseas recibir:
                      </p>
                      
                      <div className="space-y-3">
                        {/* Notificaciones de Citas */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Citas</h4>
                          <div className="space-y-2 ml-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.notificacionesConfig?.nuevaCita ?? true}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  notificacionesConfig: {
                                    ...formData.notificacionesConfig,
                                    nuevaCita: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Nueva cita asignada</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.notificacionesConfig?.pacienteLlego ?? true}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  notificacionesConfig: {
                                    ...formData.notificacionesConfig,
                                    pacienteLlego: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Paciente llegó a recepción</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.notificacionesConfig?.cancelacion ?? true}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  notificacionesConfig: {
                                    ...formData.notificacionesConfig,
                                    cancelacion: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Cita cancelada</span>
                            </label>
                          </div>
                        </div>

                        {/* Recordatorios */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recordatorios</h4>
                          <div className="space-y-2 ml-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.notificacionesConfig?.recordatorio1h ?? true}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  notificacionesConfig: {
                                    ...formData.notificacionesConfig,
                                    recordatorio1h: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">1 hora antes de la cita</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.notificacionesConfig?.recordatorio30m ?? true}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  notificacionesConfig: {
                                    ...formData.notificacionesConfig,
                                    recordatorio30m: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">30 minutos antes de la cita</span>
                            </label>
                          </div>
                        </div>

                        {/* Resúmenes */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Resúmenes</h4>
                          <div className="space-y-2 ml-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.notificacionesConfig?.resumenDiario ?? true}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  notificacionesConfig: {
                                    ...formData.notificacionesConfig,
                                    resumenDiario: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Resumen diario (7:00 AM)</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.notificacionesConfig?.resumenFinDia ?? true}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  notificacionesConfig: {
                                    ...formData.notificacionesConfig,
                                    resumenFinDia: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Resumen de fin de día (8:00 PM)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Puedes habilitar o deshabilitar las notificaciones según tus preferencias.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Campos específicos para Secretaria */}
            {formData.role === 'secretary' && (
              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Información Laboral
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Turno *
                    </label>
                    <select
                      value={formData.turno || ''}
                      onChange={(e) => setFormData({ ...formData, turno: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar turno</option>
                      <option value="mañana">Mañana</option>
                      <option value="tarde">Tarde</option>
                      <option value="noche">Noche</option>
                    </select>
                    {errors.turno && (
                      <p className="mt-1 text-sm text-red-600">{errors.turno}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área *
                    </label>
                    <input
                      type="text"
                      value={formData.area || ''}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.area && (
                      <p className="mt-1 text-sm text-red-600">{errors.area}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
              <Link
                href="/admin/users"
                className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
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
          </div>
        </form>
      </div>
    </div>
  );
}
