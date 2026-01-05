'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/components/ui/ToastProvider';
import { 
  UserPlus,
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Stethoscope,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  MapPin,
  Clock,
  Calendar,
  ChevronDown,
  Search,
  X,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { UserFormData, HorarioAtencion } from '@/types/roles';
import { usersService } from '@/services/api/users.service';
import { useAuth } from '@/hooks/useAuth';
import { clinicSettingsService } from '@/services/api/clinic-settings.service';

const INITIAL_FORM_DATA: UserFormData = {
  nombres: '',
  apellidos: '',
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  fechaNacimiento: '',
  genero: '',
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  provincia: '',
  codigoPostal: '',
  role: '',
  password: '',
  confirmPassword: '',
  estado: 'activo',
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
  ],
  turno: '',
  area: ''
};

// NOTA: Las especialidades ahora se cargan dinámicamente desde la configuración del sistema
// en lugar de estar hardcodeadas aquí
const ESPECIALIDADES_HARDCODED = [
  { value: 'clinica-medica', label: 'Clínica Médica' },
  { value: 'medicina-interna', label: 'Medicina Interna' },
  { value: 'cardiologia', label: 'Cardiología' },
  { value: 'pediatria', label: 'Pediatría' },
  { value: 'dermatologia', label: 'Dermatología' },
  { value: 'traumatologia', label: 'Traumatología' },
  { value: 'ortopedia', label: 'Ortopedia' },
  { value: 'ginecologia', label: 'Ginecología' },
  { value: 'obstetricia', label: 'Obstetricia' },
  { value: 'oftalmologia', label: 'Oftalmología' },
  { value: 'otorrinolaringologia', label: 'Otorrinolaringología' },
  { value: 'neurologia', label: 'Neurología' },
  { value: 'psiquiatria', label: 'Psiquiatría' },
  { value: 'psicologia', label: 'Psicología' },
  { value: 'urologia', label: 'Urología' },
  { value: 'nefrologia', label: 'Nefrología' },
  { value: 'gastroenterologia', label: 'Gastroenterología' },
  { value: 'endocrinologia', label: 'Endocrinología' },
  { value: 'neumologia', label: 'Neumonología' },
  { value: 'reumatologia', label: 'Reumatología' },
  { value: 'hematologia', label: 'Hematología' },
  { value: 'oncologia', label: 'Oncología' },
  { value: 'cirugia-general', label: 'Cirugía General' },
  { value: 'cirugia-cardiovascular', label: 'Cirugía Cardiovascular' },
  { value: 'anestesiologia', label: 'Anestesiología' },
  { value: 'radiologia', label: 'Radiología' },
  { value: 'medicina-familiar', label: 'Medicina Familiar' },
  { value: 'geriatria', label: 'Geriatría' },
  { value: 'infectologia', label: 'Infectología' },
  { value: 'alergia-inmunologia', label: 'Alergia e Inmunología' },
  { value: 'odontologia', label: 'Odontología' },
  { value: 'nutricion', label: 'Nutrición' },
  { value: 'kinesiologia', label: 'Kinesiología' }
];

const DIAS_SEMANA = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' }
];

export default function NewUserForm() {
  const router = useRouter();
  const { buildPath } = useTenant();
  const { showSuccess, showError } = useToast();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM_DATA);
  const [showPassword, setShowPassword] = useState(false);
  const [especialidades, setEspecialidades] = useState<Array<{ value: string; label: string }>>(ESPECIALIDADES_HARDCODED);
  const [isLoadingEspecialidades, setIsLoadingEspecialidades] = useState(true);
  const [consultorios, setConsultorios] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingConsultorios, setIsLoadingConsultorios] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  const currentUserId = (currentUser as any)?.id;

  // Cargar especialidades desde la configuración del sistema
  useEffect(() => {
    const loadEspecialidades = async () => {
      if (!clinicId) {
        setIsLoadingEspecialidades(false);
        return;
      }

      try {
        const response = await clinicSettingsService.getSpecialties(clinicId);
        
        if (response.success && response.data) {
          const especialidadesActivas = response.data.filter((esp: any) => esp.active);
          
          if (especialidadesActivas.length > 0) {
            const formattedEspecialidades = especialidadesActivas.map((esp: any) => ({
              value: esp.id,
              label: esp.name
            }));
            setEspecialidades(formattedEspecialidades);
          } else {
            // Si no hay especialidades activas, mostrar mensaje
            setEspecialidades([]);
          }
        } else {
          // Si no hay especialidades configuradas, usar array vacío
          setEspecialidades([]);
        }
      } catch (error) {
        console.error('Error cargando especialidades:', error);
        // En caso de error, usar array vacío
        setEspecialidades([]);
      } finally {
        setIsLoadingEspecialidades(false);
      }
    };

    loadEspecialidades();
  }, [clinicId]);

  // Cargar consultorios desde la configuración del sistema
  useEffect(() => {
    const loadConsultorios = async () => {
      if (!clinicId) {
        setIsLoadingConsultorios(false);
        return;
      }

      try {
        const response = await clinicSettingsService.getConsultingRooms(clinicId);
        
        if (response.success && response.data) {
          const consultoriosActivos = response.data.filter((room: any) => room.active);
          
          if (consultoriosActivos.length > 0) {
            // Ordenar por número de forma ascendente
            const sortedConsultorios = consultoriosActivos.sort((a: any, b: any) => {
              const numA = parseInt(a.number) || 0;
              const numB = parseInt(b.number) || 0;
              return numA - numB;
            });
            
            const formattedConsultorios = sortedConsultorios.map((room: any) => ({
              value: room.id,
              label: `${room.name} - Piso ${room.floor}`,
              number: room.number
            }));
            setConsultorios(formattedConsultorios);
          } else {
            setConsultorios([]);
          }
        } else {
          setConsultorios([]);
        }
      } catch (error) {
        console.error('Error cargando consultorios:', error);
        setConsultorios([]);
      } finally {
        setIsLoadingConsultorios(false);
      }
    };

    loadConsultorios();
  }, [clinicId]);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showEspecialidadesDropdown, setShowEspecialidadesDropdown] = useState(false);
  const [especialidadSearch, setEspecialidadSearch] = useState('');

  const updateField = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleEspecialidad = (especialidad: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: (prev.especialidades || []).includes(especialidad)
        ? (prev.especialidades || []).filter(e => e !== especialidad)
        : [...(prev.especialidades || []), especialidad]
    }));
    // Cerrar el dropdown después de seleccionar
    setShowEspecialidadesDropdown(false);
    setEspecialidadSearch('');
  };

  const toggleDiaAtencion = (dia: number) => {
    setFormData(prev => ({
      ...prev,
      horariosAtencion: (prev.horariosAtencion || []).map(h =>
        h.dia === dia ? { ...h, activo: !h.activo } : h
      )
    }));
  };

  const updateHorarioDia = (dia: number, field: 'horaInicio' | 'horaFin', value: string) => {
    setFormData(prev => ({
      ...prev,
      horariosAtencion: (prev.horariosAtencion || []).map(h =>
        h.dia === dia ? { ...h, [field]: value } : h
      )
    }));
  };

  const filteredEspecialidades = especialidades.filter((esp: { value: string; label: string }) =>
    esp.label.toLowerCase().includes(especialidadSearch.toLowerCase())
  );

  const removeEspecialidad = (especialidad: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: (prev.especialidades || []).filter(e => e !== especialidad)
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres.trim()) newErrors.nombres = 'El nombre es requerido';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'El apellido es requerido';
    if (!formData.numeroDocumento.trim()) newErrors.numeroDocumento = 'El documento es requerido';
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.role) newErrors.role = 'El rol es requerido';
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

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
      const diasActivos = (formData.horariosAtencion || []).filter(h => h.activo);
      if (diasActivos.length === 0) {
        newErrors.horariosAtencion = 'Debe seleccionar al menos un día de atención';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await usersService.createUser(formData, clinicId, currentUserId);
      
      if (response.success) {
        // Redirigir inmediatamente
        showSuccess('Usuario creado', 'El usuario ha sido creado exitosamente');
        router.push(buildPath('/admin/users'));
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showError('Error al crear usuario', 'No se pudo crear el usuario. Por favor, intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-600';
      case 'doctor': return 'bg-blue-500';
      case 'secretary': return 'bg-gray-600';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin/users" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="p-3 bg-blue-600 rounded-xl shadow-sm">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nuevo Usuario</h1>
              <p className="text-gray-600 mt-1">Complete la información para crear un nuevo usuario</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="space-y-8">
              
              {/* Información Personal */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <User className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombres *</label>
                    <input
                      type="text"
                      value={formData.nombres}
                      onChange={(e) => updateField('nombres', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.nombres ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ingrese los nombres"
                    />
                    {errors.nombres && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.nombres}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos *</label>
                    <input
                      type="text"
                      value={formData.apellidos}
                      onChange={(e) => updateField('apellidos', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.apellidos ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ingrese los apellidos"
                    />
                    {errors.apellidos && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.apellidos}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento *</label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={(e) => updateField('tipoDocumento', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="DNI">DNI</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="CI">Cédula de Identidad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Documento *</label>
                    <input
                      type="text"
                      value={formData.numeroDocumento}
                      onChange={(e) => updateField('numeroDocumento', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.numeroDocumento ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ingrese el número"
                    />
                    {errors.numeroDocumento && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.numeroDocumento}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={(e) => updateField('fechaNacimiento', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                    <select
                      value={formData.genero}
                      onChange={(e) => updateField('genero', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="">Seleccione...</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Información de Contacto</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="usuario@ejemplo.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => updateField('telefono', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.telefono ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+54 11 1234-5678"
                    />
                    {errors.telefono && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.telefono}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => updateField('direccion', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Calle y número"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                    <input
                      type="text"
                      value={formData.ciudad}
                      onChange={(e) => updateField('ciudad', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Ciudad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                    <input
                      type="text"
                      value={formData.provincia}
                      onChange={(e) => updateField('provincia', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Provincia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                    <input
                      type="text"
                      value={formData.codigoPostal}
                      onChange={(e) => updateField('codigoPostal', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Código postal"
                    />
                  </div>
                </div>
              </div>

              {/* Rol y Acceso */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Rol y Acceso al Sistema</h2>
                </div>

                {/* Selección de Rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Rol del Usuario *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'admin', label: 'Administrador', icon: Shield, description: 'Control total' },
                      { value: 'doctor', label: 'Doctor', icon: Stethoscope, description: 'Atención médica' },
                      { value: 'secretary', label: 'Secretaria', icon: Briefcase, description: 'Gestión operativa' }
                    ].map((role) => {
                      const RoleIcon = role.icon;
                      const isSelected = formData.role === role.value;
                      
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => updateField('role', role.value)}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-12 h-12 mx-auto mb-3 rounded-lg ${getRoleColor(role.value)} flex items-center justify-center shadow-sm`}>
                            <RoleIcon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{role.label}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </button>
                      );
                    })}
                  </div>
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* Campos específicos para Doctor */}
                {formData.role === 'doctor' && (
                  <div className="space-y-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5" />
                      Información Médica
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Matrícula Profesional *</label>
                        <input
                          type="text"
                          value={formData.matricula}
                          onChange={(e) => updateField('matricula', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.matricula ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="MP 12345"
                        />
                        {errors.matricula && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.matricula}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Consultorio *</label>
                        <select
                          value={formData.consultorio}
                          onChange={(e) => updateField('consultorio', e.target.value)}
                          disabled={isLoadingConsultorios}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.consultorio ? 'border-red-500' : 'border-gray-300'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="">
                            {isLoadingConsultorios 
                              ? 'Cargando consultorios...' 
                              : consultorios.length === 0 
                                ? 'No hay consultorios configurados'
                                : 'Seleccione un consultorio'
                            }
                          </option>
                          {consultorios.map((consultorio) => (
                            <option key={consultorio.value} value={consultorio.value}>
                              {consultorio.label}
                            </option>
                          ))}
                        </select>
                        {errors.consultorio && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.consultorio}
                          </p>
                        )}
                        {!isLoadingConsultorios && consultorios.length === 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Configure consultorios en Configuración → Recursos Clínicos
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Especialidades *</label>
                      
                      {/* Especialidades seleccionadas */}
                      {formData.especialidades && formData.especialidades.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.especialidades.map((espName) => (
                              <span
                                key={espName}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
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

                      {/* Dropdown con búsqueda */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowEspecialidadesDropdown(!showEspecialidadesDropdown)}
                          disabled={isLoadingEspecialidades}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-gray-700">
                            {isLoadingEspecialidades ? (
                              'Cargando especialidades...'
                            ) : formData.especialidades && formData.especialidades.length > 0 ? (
                              `${formData.especialidades.length} especialidad(es) seleccionada(s)`
                            ) : (
                              'Seleccionar especialidades...'
                            )}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                            showEspecialidadesDropdown ? 'rotate-180' : ''
                          }`} />
                        </button>

                        {showEspecialidadesDropdown && (
                          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                            {/* Buscador */}
                            <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

                            {/* Lista de especialidades */}
                            <div className="max-h-64 overflow-y-auto">
                              {filteredEspecialidades.length > 0 ? (
                                filteredEspecialidades.map((esp: { value: string; label: string }) => {
                                  const isSelected = formData.especialidades?.includes(esp.label);
                                  return (
                                    <button
                                      key={esp.value}
                                      type="button"
                                      onClick={() => {
                                        toggleEspecialidad(esp.label);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                        isSelected ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <span className={`text-sm ${isSelected ? 'font-medium text-blue-800' : 'text-gray-700'}`}>
                                        {esp.label}
                                      </span>
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                      )}
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                  {especialidades.length === 0 ? (
                                    <div>
                                      <p className="font-medium text-gray-700 mb-1">No hay especialidades configuradas</p>
                                      <p className="text-xs">Configure especialidades en Configuración → Recursos Clínicos</p>
                                    </div>
                                  ) : (
                                    'No se encontraron especialidades'
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {errors.especialidades && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.especialidades}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Horarios de Atención *
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        Selecciona los días y configura el horario para cada uno
                      </p>
                      
                      <div className="space-y-3">
                        {formData.horariosAtencion?.map((horario) => {
                          const diaInfo = DIAS_SEMANA.find(d => d.value === horario.dia);
                          return (
                            <div
                              key={horario.dia}
                              className={`border-2 rounded-lg p-4 transition-all ${
                                horario.activo
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                {/* Checkbox del día */}
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`dia-${horario.dia}`}
                                    checked={horario.activo}
                                    onChange={() => toggleDiaAtencion(horario.dia)}
                                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                  />
                                  <label
                                    htmlFor={`dia-${horario.dia}`}
                                    className={`ml-3 font-medium cursor-pointer min-w-[80px] ${
                                      horario.activo ? 'text-green-900' : 'text-gray-700'
                                    }`}
                                  >
                                    {diaInfo?.label}
                                  </label>
                                </div>

                                {/* Horarios */}
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <input
                                      type="time"
                                      value={horario.horaInicio}
                                      onChange={(e) => updateHorarioDia(horario.dia, 'horaInicio', e.target.value)}
                                      disabled={!horario.activo}
                                      className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                        horario.activo
                                          ? 'border-gray-300 bg-white'
                                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }`}
                                    />
                                  </div>
                                  
                                  <span className="text-gray-400">—</span>
                                  
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <input
                                      type="time"
                                      value={horario.horaFin}
                                      onChange={(e) => updateHorarioDia(horario.dia, 'horaFin', e.target.value)}
                                      disabled={!horario.activo}
                                      className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                        horario.activo
                                          ? 'border-gray-300 bg-white'
                                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {errors.horariosAtencion && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.horariosAtencion}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Campos específicos para Secretaria */}
                {formData.role === 'secretary' && (
                  <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Información Operativa
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Turno *</label>
                        <select
                          value={formData.turno}
                          onChange={(e) => updateField('turno', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.turno ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Seleccione...</option>
                          <option value="mañana">Mañana</option>
                          <option value="tarde">Tarde</option>
                          <option value="noche">Noche</option>
                          <option value="completo">Completo</option>
                        </select>
                        {errors.turno && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.turno}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Área *</label>
                        <input
                          type="text"
                          value={formData.area}
                          onChange={(e) => updateField('area', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.area ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Recepción, Facturación"
                        />
                        {errors.area && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.area}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contraseña */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Repita la contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => updateField('estado', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

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
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Crear Usuario
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
