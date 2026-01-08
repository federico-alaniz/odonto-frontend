'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  Stethoscope,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity,
  UserCheck,
  UserX,
  Bell,
  Search,
  LogIn,
  LogOut,
  CircleDot,
  FileText,
  Briefcase,
  Plane,
  Home,
  AlertTriangle
} from 'lucide-react';
import { usersService } from '@/services/api/users.service';
import { avisosService, Aviso as AvisoType } from '@/services/api/avisos.service';
import { ausenciasService, Ausencia as AusenciaType } from '@/services/api/ausencias.service';
import { clinicSettingsService, ConsultingRoom, MedicalSpecialty } from '@/services/api/clinic-settings.service';
import { User } from '@/types/roles';

type TabType = 'profesionales' | 'avisos' | 'ausencias';

interface DoctorWithStatus extends User {
  isOnline?: boolean;
  loginTime?: string;
  logoutTime?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  isAttending?: boolean;
  currentPatient?: string;
  currentPatientId?: string;
}

interface Aviso {
  id: string;
  doctorId: string;
  doctorName: string;
  mensaje: string;
  tipo: 'informativo' | 'urgente' | 'recordatorio';
  fecha: string;
  hora: string;
  leido: boolean;
}

interface Ausencia {
  id: string;
  doctorId: string;
  doctorName: string;
  tipo: 'sin_aviso' | 'licencia' | 'vacaciones' | 'razones_particulares' | 'fuerza_mayor';
  fechaInicio: string;
  fechaFin?: string;
  descripcion: string;
  aprobado: boolean;
}

export default function MedicalStaffPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profesionales');
  const [doctors, setDoctors] = useState<DoctorWithStatus[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  const [consultingRooms, setConsultingRooms] = useState<ConsultingRoom[]>([]);
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;

  useEffect(() => {
    if (clinicId) {
      loadData();
    }
  }, [clinicId]);

  const loadData = async () => {
    // Cargar consultorios y especialidades primero, luego el resto
    await Promise.all([
      loadConsultingRooms(),
      loadSpecialties()
    ]);
    await loadMedicalStaff();
    loadAvisos();
    loadAusencias();
  };

  const loadConsultingRooms = async () => {
    if (!clinicId) return;
    
    try {
      const response = await clinicSettingsService.getConsultingRooms(clinicId);
      if (response.success && response.data) {
        console.log('Consultorios cargados:', response.data);
        setConsultingRooms(response.data);
      }
    } catch (error) {
      console.error('Error cargando consultorios:', error);
      setConsultingRooms([]);
    }
  };

  const loadSpecialties = async () => {
    if (!clinicId) return;
    
    try {
      const response = await clinicSettingsService.getSpecialties(clinicId);
      if (response.success && response.data) {
        console.log('Especialidades cargadas:', response.data);
        setSpecialties(response.data);
      }
    } catch (error) {
      console.error('Error cargando especialidades:', error);
      setSpecialties([]);
    }
  };

  const loadMedicalStaff = async () => {
    if (!clinicId) {
      console.log('No clinicId disponible');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Cargando médicos para clinicId:', clinicId);
      
      const [doctorsRes, adminsRes] = await Promise.all([
        usersService.getUsers(clinicId, { role: 'doctor', limit: 100 }),
        usersService.getUsers(clinicId, { role: 'admin', limit: 100 })
      ]);

      console.log('Doctores recibidos:', doctorsRes.data?.length || 0);
      console.log('Admins recibidos:', adminsRes.data?.length || 0);

      const adminDoctors = adminsRes.data.filter((user: User) => user.isDoctor === true);
      console.log('Admin-doctores filtrados:', adminDoctors.length);
      
      const allDoctors: DoctorWithStatus[] = [...doctorsRes.data, ...adminDoctors].map(doctor => {
        const isOnline = Math.random() > 0.3;
        const isAttending = isOnline && Math.random() > 0.5;
        
        // Debug log para verificar datos del doctor
        console.log(`Doctor: ${doctor.nombres} ${doctor.apellidos}`, {
          consultorio: doctor.consultorio,
          especialidades: doctor.especialidades,
          role: doctor.role
        });
        
        return {
          ...doctor,
          isOnline,
          loginTime: isOnline ? new Date(Date.now() - Math.random() * 14400000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : undefined,
          logoutTime: !isOnline && Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : undefined,
          scheduledStart: '08:00',
          scheduledEnd: '16:00',
          isAttending,
          currentPatient: isAttending ? ['Juan Pérez', 'María González', 'Carlos López', 'Ana Martínez'][Math.floor(Math.random() * 4)] : undefined,
          currentPatientId: isAttending ? 'PAT-' + Math.floor(Math.random() * 1000) : undefined
        };
      });

      console.log('Total médicos procesados:', allDoctors.length);
      console.log('Consultorios cargados:', consultingRooms.length);
      setDoctors(allDoctors);
    } catch (error) {
      console.error('Error cargando personal médico:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvisos = async () => {
    if (!clinicId) return;
    
    try {
      const response = await avisosService.getAvisos(clinicId);
      if (response.success && response.data) {
        setAvisos(response.data);
      }
    } catch (error) {
      console.error('Error cargando avisos:', error);
      // Fallback a datos vacíos en caso de error
      setAvisos([]);
    }
  };

  const loadAusencias = async () => {
    if (!clinicId) return;
    
    try {
      const response = await ausenciasService.getAusencias(clinicId);
      if (response.success && response.data) {
        setAusencias(response.data);
      }
    } catch (error) {
      console.error('Error cargando ausencias:', error);
      // Fallback a datos vacíos en caso de error
      setAusencias([]);
    }
  };

  const filteredDoctors = doctors.filter(doctor => 
    `${doctor.nombres} ${doctor.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.especialidades?.some(esp => esp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAvisos = avisos.filter(aviso =>
    aviso.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aviso.mensaje.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAusencias = ausencias.filter(ausencia =>
    ausencia.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineDoctors = doctors.filter(d => d.isOnline).length;
  const attendingDoctors = doctors.filter(d => d.isAttending).length;
  const avisosNoLeidos = avisos.filter(a => !a.leido).length;

  const getAusenciaTipo = (tipo: string) => {
    switch (tipo) {
      case 'sin_aviso': return { label: 'Sin Aviso', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-4 h-4" /> };
      case 'licencia': return { label: 'Licencia', color: 'bg-blue-100 text-blue-700', icon: <FileText className="w-4 h-4" /> };
      case 'vacaciones': return { label: 'Vacaciones', color: 'bg-green-100 text-green-700', icon: <Plane className="w-4 h-4" /> };
      case 'razones_particulares': return { label: 'Razones Particulares', color: 'bg-yellow-100 text-yellow-700', icon: <Home className="w-4 h-4" /> };
      case 'fuerza_mayor': return { label: 'Fuerza Mayor', color: 'bg-orange-100 text-orange-700', icon: <AlertCircle className="w-4 h-4" /> };
      default: return { label: tipo, color: 'bg-gray-100 text-gray-700', icon: <Bell className="w-4 h-4" /> };
    }
  };

  const getAvisoTipo = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return { color: 'bg-red-50 border-red-200', icon: <AlertCircle className="w-5 h-5 text-red-600" />, badge: 'bg-red-100 text-red-700' };
      case 'recordatorio': return { color: 'bg-blue-50 border-blue-200', icon: <Bell className="w-5 h-5 text-blue-600" />, badge: 'bg-blue-100 text-blue-700' };
      default: return { color: 'bg-gray-50 border-gray-200', icon: <FileText className="w-5 h-5 text-gray-600" />, badge: 'bg-gray-100 text-gray-700' };
    }
  };

  const getSpecialtyName = (specialty: string): string => {
    if (!specialty) return 'Sin especialidad';
    
    // Primero intentar buscar por ID en las especialidades cargadas del backend
    const specialtyById = specialties.find(s => s.id === specialty);
    if (specialtyById) {
      return specialtyById.name;
    }
    
    // Fallback: mapeo estático de códigos a nombres
    const names: Record<string, string> = {
      'clinica-medica': 'Clínica Médica',
      'medicina-interna': 'Medicina Interna',
      'cardiologia': 'Cardiología',
      'pediatria': 'Pediatría',
      'dermatologia': 'Dermatología',
      'ginecologia': 'Ginecología',
      'obstetricia': 'Obstetricia',
      'odontologia': 'Odontología',
      'traumatologia': 'Traumatología',
      'ortopedia': 'Ortopedia',
      'psiquiatria': 'Psiquiatría'
    };
    
    // Si es un código conocido, retornar el nombre
    if (names[specialty]) {
      return names[specialty];
    }
    
    // Si el valor es un ID largo (número) y no se encontró en el backend
    if (/^\d{10,}$/.test(specialty)) {
      console.warn(`Especialidad con ID no encontrado: ${specialty}`, {
        specialtiesCount: specialties.length,
        specialties: specialties.map(s => ({ id: s.id, name: s.name }))
      });
      return 'Sin especialidad';
    }
    
    return specialty;
  };

  const getConsultingRoomName = (consultorioId: string | undefined): string => {
    if (!consultorioId) return 'Sin consultorio';
    
    // Buscar por ID
    const room = consultingRooms.find(r => r.id === consultorioId);
    if (room) {
      return room.name;
    }
    
    // Buscar por número de consultorio
    const roomByNumber = consultingRooms.find(r => r.number === consultorioId);
    if (roomByNumber) {
      return roomByNumber.name;
    }
    
    // Si no se encuentra, mostrar el ID como fallback
    console.warn(`Consultorio no encontrado: ${consultorioId}`, {
      consultingRoomsCount: consultingRooms.length,
      consultingRooms: consultingRooms.map(r => ({ id: r.id, number: r.number, name: r.name }))
    });
    
    return `Consultorio ${consultorioId}`;
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Plantilla Médica</h1>
                <p className="text-gray-600 mt-1">Estado y novedades del personal médico</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Total Médicos</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{doctors.length}</div>
            <div className="text-xs text-gray-500 mt-1">Personal activo</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Presentes</span>
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700">{onlineDoctors}</div>
            <div className="text-xs text-green-600 mt-1">Logueados</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Atendiendo</span>
              <CircleDot className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700">{attendingDoctors}</div>
            <div className="text-xs text-blue-600 mt-1">En consulta</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Avisos Nuevos</span>
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-700">{avisosNoLeidos}</div>
            <div className="text-xs text-yellow-600 mt-1">Sin leer</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profesionales')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profesionales'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Profesionales</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {doctors.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('avisos')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'avisos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>Avisos</span>
                  {avisosNoLeidos > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                      {avisosNoLeidos}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('ausencias')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'ausencias'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  <span>Ausencias</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {ausencias.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          {/* Búsqueda */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Buscar ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Activity className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <>
                {/* Tab Profesionales */}
                {activeTab === 'profesionales' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profesional</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Especialidad</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Horario Programado</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Entrada/Salida</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Atendiendo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDoctors.map((doctor) => (
                          <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  {doctor.avatar ? (
                                    <img
                                      src={doctor.avatar}
                                      alt={`${doctor.nombres} ${doctor.apellidos}`}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                      {doctor.nombres.charAt(0)}{doctor.apellidos.charAt(0)}
                                    </div>
                                  )}
                                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                    doctor.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                  }`} />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {doctor.nombres} {doctor.apellidos}
                                  </div>
                                  <div className="text-xs text-gray-500">{getConsultingRoomName(doctor.consultorio)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-700 text-sm">
                              {doctor.especialidades && doctor.especialidades.length > 0
                                ? getSpecialtyName(doctor.especialidades[0])
                                : 'Sin especialidad'}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                doctor.isOnline 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {doctor.isOnline ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    Presente
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3" />
                                    Ausente
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center text-sm text-gray-700">
                              <div className="flex items-center justify-center gap-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {doctor.scheduledStart} - {doctor.scheduledEnd}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center text-sm">
                              {doctor.isOnline ? (
                                <div className="flex items-center justify-center gap-1 text-green-700">
                                  <LogIn className="w-4 h-4" />
                                  {doctor.loginTime}
                                </div>
                              ) : doctor.logoutTime ? (
                                <div className="flex items-center justify-center gap-1 text-gray-500">
                                  <LogOut className="w-4 h-4" />
                                  {doctor.logoutTime}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {doctor.isAttending && doctor.currentPatient ? (
                                <div className="flex items-center gap-2">
                                  <CircleDot className="w-4 h-4 text-blue-600 animate-pulse" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{doctor.currentPatient}</div>
                                    <div className="text-xs text-gray-500">{doctor.currentPatientId}</div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredDoctors.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No se encontraron profesionales</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Avisos */}
                {activeTab === 'avisos' && (
                  <div className="space-y-3">
                    {filteredAvisos.map((aviso) => {
                      const tipoInfo = getAvisoTipo(aviso.tipo);
                      return (
                        <div 
                          key={aviso.id}
                          className={`border rounded-lg p-4 ${tipoInfo.color} ${!aviso.leido ? 'border-l-4' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            {tipoInfo.icon}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{aviso.doctorName}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tipoInfo.badge}`}>
                                      {aviso.tipo.charAt(0).toUpperCase() + aviso.tipo.slice(1)}
                                    </span>
                                    {!aviso.leido && (
                                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                        Nuevo
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(aviso.fecha).toLocaleDateString('es-AR')}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {aviso.hora}
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{aviso.mensaje}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredAvisos.length === 0 && (
                      <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No hay avisos</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Ausencias */}
                {activeTab === 'ausencias' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Profesional</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha Inicio</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha Fin</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Descripción</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAusencias.map((ausencia) => {
                          const tipoInfo = getAusenciaTipo(ausencia.tipo);
                          return (
                            <tr key={ausencia.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-medium text-gray-900">{ausencia.doctorName}</div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${tipoInfo.color}`}>
                                  {tipoInfo.icon}
                                  {tipoInfo.label}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-700">
                                {new Date(ausencia.fechaInicio).toLocaleDateString('es-AR')}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-700">
                                {ausencia.fechaFin 
                                  ? new Date(ausencia.fechaFin).toLocaleDateString('es-AR')
                                  : '-'
                                }
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-700">
                                {ausencia.descripcion}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                  ausencia.aprobado 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {ausencia.aprobado ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      Aprobado
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3" />
                                      Pendiente
                                    </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredAusencias.length === 0 && (
                      <div className="text-center py-12">
                        <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No hay ausencias registradas</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
