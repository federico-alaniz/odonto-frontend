'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { 
  User as UserIcon, 
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Stethoscope,
  Heart,
  Shield,
  AlertTriangle,
  Edit3,
  UserPlus,
  CreditCard,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  Pill
} from 'lucide-react';
import Link from 'next/link';
import { formatGender, formatCity } from '@/utils/format-helpers';
import { formatDocument } from '@/utils/document-formatters';
import { patientsService } from '@/services/api/patients.service';
import { appointmentsService } from '@/services/api/appointments.service';
import { usersService } from '@/services/api/users.service';
import { clinicSettingsService } from '@/services/api/clinic-settings.service';
import { useAuth } from '@/hooks/useAuth';
import { calculateAge } from '@/utils';
import { getAppointmentStatusConfig } from '@/utils/appointment-status';
import { User } from '@/types/roles';

// Datos temporales vacíos hasta integrar con backend
interface PatientDetails {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: any;
  tipoSangre: string;
  contactoEmergencia: any;
  seguroMedico?: any;
  alergias: string[];
  medicamentosActuales: string[];
  antecedentesPersonales: string[];
  antecedentesFamiliares: string[];
  ultimaConsulta?: string;
  proximaCita?: string;
  estado: string;
  fechaRegistro: string;
  doctorAsignado?: string;
}

interface PatientAppointment {
  id: string;
  fecha: string;
  horaInicio: string;
  doctorId: string;
  doctorName: string;
  especialidad: string;
  motivo: string;
  estado: string;
  consultorio: string;
  notas?: string;
}

interface PatientBill {
  id: string;
  fecha: string;
  conceptos: { descripcion: string; cantidad: number; precio: number }[];
  total: number;
  estado: string;
  metodoPago?: string;
}

export default function SecretaryPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { buildPath } = useTenant();
  const patientId = params.id as string;
  const { currentUser } = useAuth();
  
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<PatientAppointment[]>([]);
  const [patientBills, setPatientBills] = useState<PatientBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadPatientData = useCallback(async () => {
    const clinicId = currentUser?.clinicId;
    if (!clinicId || !patientId) {
      router.push(buildPath('/secretary/patients'));
      return;
    }

    try {
      setLoading(true);

      // Cargar datos en paralelo
      const [patientResponse, appointmentsData, doctorsData, adminsData] = await Promise.all([
        patientsService.getPatientById(patientId, clinicId),
        appointmentsService.getAppointments(clinicId, { patientId }),
        usersService.getUsers(clinicId, { role: 'doctor' }),
        usersService.getUsers(clinicId, { role: 'admin' })
      ]);

      if (!patientResponse?.data) {
          router.push(buildPath('/secretary/patients'));
        return;
      }

      const patientData = patientResponse.data;

      // Transformar datos del paciente
      const patientDetails: PatientDetails = {
        id: patientData.id,
        nombres: patientData.nombres,
        apellidos: patientData.apellidos,
        tipoDocumento: patientData.tipoDocumento,
        numeroDocumento: patientData.numeroDocumento,
        fechaNacimiento: patientData.fechaNacimiento,
        genero: patientData.genero,
        telefono: patientData.telefono,
        email: patientData.email || '',
        direccion: patientData.direccion || {},
        tipoSangre: patientData.tipoSangre || '',
        contactoEmergencia: patientData.contactoEmergencia || {},
        seguroMedico: patientData.seguroMedico,
        alergias: patientData.alergias || [],
        medicamentosActuales: patientData.medicamentosActuales || [],
        antecedentesPersonales: patientData.antecedentesPersonales || [],
        antecedentesFamiliares: patientData.antecedentesFamiliares || [],
        estado: patientData.estado,
        fechaRegistro: patientData.createdAt
      };

      setPatient(patientDetails);

      // Combinar doctores y admin-doctores
      const adminDoctors = adminsData.data.filter((user: User) => user.isDoctor === true);
      const allDoctors = [...doctorsData.data, ...adminDoctors];

      // Cargar especialidades para mapear IDs a nombres
      const specialtiesRes = await clinicSettingsService.getSpecialties(clinicId);
      const specialtiesMap = new Map<string, string>();
      if (specialtiesRes.success && specialtiesRes.data) {
        specialtiesRes.data.forEach((spec: { id: string; name?: string; nombre?: string }) => {
          const name = spec.name || spec.nombre;
          if (name) {
            specialtiesMap.set(spec.id, name);
          }
        });
      }

      // Cargar consultorios para mapear IDs a nombres
      const consultoriosRes = await clinicSettingsService.getConsultingRooms(clinicId);
      const consultoriosMap = new Map<string, string>();
      if (consultoriosRes.success && consultoriosRes.data) {
        consultoriosRes.data.forEach((cons: { id: string; nombre?: string; name?: string }) => {
          const nombre = cons.nombre || cons.name;
          if (nombre) {
            consultoriosMap.set(cons.id, nombre);
          }
        });
      }

      // Fecha actual para comparar
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Transformar datos de citas con información de doctores
      const patientAppts: PatientAppointment[] = appointmentsData.data
        .map(apt => {
          const doctor = allDoctors.find(d => d.id === apt.doctorId);
          
          // Obtener nombre de especialidad
          const especialidadId = doctor?.especialidades?.[0];
          let especialidadNombre = 'No especificada';
          if (especialidadId) {
            especialidadNombre = specialtiesMap.get(especialidadId) || especialidadId;
          }
          
          // Obtener nombre de consultorio
          const consultorioId = doctor?.consultorio;
          let consultorioNombre = 'Sin asignar';
          if (consultorioId) {
            consultorioNombre = consultoriosMap.get(consultorioId) || consultorioId;
          }
          
          // Verificar si la cita es pasada y cambiar estado a 'no_asistio' si está 'programada'
          const appointmentDate = new Date(apt.fecha + 'T' + apt.horaInicio);
          let estado = apt.estado;
          if (appointmentDate < today && estado === 'programada') {
            estado = 'no_asistio';
          }
          
          return {
            id: apt.id,
            fecha: apt.fecha,
            horaInicio: apt.horaInicio,
            doctorId: apt.doctorId,
            doctorName: doctor ? `${doctor.nombres} ${doctor.apellidos}` : 'Doctor no asignado',
            especialidad: especialidadNombre,
            motivo: apt.motivo || 'Sin motivo especificado',
            estado: estado,
            consultorio: consultorioNombre,
            notas: apt.notas
          };
        })
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      setPatientAppointments(patientAppts);
      setPatientBills([]);

    } catch (error) {
      console.error('Error loading patient data:', error);
      router.push(buildPath('/secretary/patients'));
    } finally {
      setLoading(false);
    }
  }, [patientId, currentUser, router]);

  useEffect(() => {
    loadPatientData();
  }, [patientId, currentUser, router]);

  useEffect(() => {
    let lastLoadTime = 0;
    const RELOAD_COOLDOWN = 5000; // 5 segundos entre recargas

    const handlePageFocus = () => {
      const now = Date.now();
      if (now - lastLoadTime < RELOAD_COOLDOWN) {
        return;
      }
      
      if (patientId && currentUser?.clinicId) {
        lastLoadTime = now;
        loadPatientData();
      }
    };

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (now - lastLoadTime < RELOAD_COOLDOWN) {
        return;
      }
      
      if (document.visibilityState === 'visible' && patientId && currentUser?.clinicId) {
        lastLoadTime = now;
        loadPatientData();
      }
    };

    window.addEventListener('focus', handlePageFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handlePageFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [patientId, currentUser, loadPatientData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getBillEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return { color: 'bg-green-100 text-green-800', text: 'Pagado' };
      case 'pendiente':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' };
      case 'vencido':
        return { color: 'bg-red-100 text-red-800', text: 'Vencido' };
      case 'cancelado':
        return { color: 'bg-gray-100 text-gray-800', text: 'Cancelado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: estado };
    }
  };

  // Función para validar si un turno puede ser reprogramado
  const canRescheduleAppointment = (appointment: PatientAppointment) => {
    // Solo se pueden reprogramar turnos en estado 'programada'
    if (appointment.estado !== 'programada') {
      return false;
    }

    // Verificar que la fecha sea futura
    const appointmentDate = new Date(`${appointment.fecha} ${appointment.horaInicio}`);
    const now = new Date();
    
    if (appointmentDate <= now) {
      return false;
    }

    // Verificar que haya al menos 24 horas de anticipación
    const timeDifference = appointmentDate.getTime() - now.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    
    return timeDifference >= twentyFourHours;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando información del paciente..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Paciente no encontrado</h3>
            <p className="text-gray-600 mb-6">El paciente solicitado no existe en el sistema</p>
            <Link 
              href="/secretary/patients"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a Pacientes
            </Link>
          </div>
        </div>
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
              <Link
                href="/secretary/patients"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                <UserIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {patient.nombres} {patient.apellidos}
                </h1>
                <p className="text-gray-600 mt-1">
                  {formatDocument(patient.tipoDocumento, patient.numeroDocumento)} • {calculateAge(patient.fechaNacimiento)} años
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/secretary/patients/${patient.id}/edit`}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors inline-flex items-center space-x-2"
              >
                <Edit3 className="w-5 h-5" />
                <span>Editar</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-700 space-x-2">
            <span>Secretaría</span>
            <span>•</span>
            <Link href="/secretary/patients" className="text-purple-600 hover:text-purple-700">
              Pacientes
            </Link>
            <span>•</span>
            <span className="text-gray-700 font-medium">{patient.nombres} {patient.apellidos}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'info', label: 'Información General', icon: Eye },
                { id: 'appointments', label: 'Turnos', icon: Calendar },
                { id: 'billing', label: 'Facturación', icon: CreditCard }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Información Personal */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre completo</label>
                    <p className="text-lg font-medium text-gray-900">{patient.nombres} {patient.apellidos}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Documento</label>
                    <p className="text-lg text-gray-900">{formatDocument(patient.tipoDocumento, patient.numeroDocumento)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de nacimiento</label>
                    <p className="text-lg text-gray-900">{formatDate(patient.fechaNacimiento)} ({calculateAge(patient.fechaNacimiento)} años)</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Género</label>
                    <p className="text-lg text-gray-900 capitalize">{patient.genero}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo de sangre</label>
                    <p className="text-lg text-gray-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      {patient.tipoSangre || 'No especificado'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <p className="text-lg text-gray-900 capitalize">{patient.estado}</p>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Información de Contacto</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="text-lg text-gray-900">{patient.telefono}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg text-gray-900">{patient.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dirección</label>
                      <p className="text-lg text-gray-900">
                        {patient.direccion?.calle} {patient.direccion?.numero}<br />
                        {patient.direccion?.ciudad}, {patient.direccion?.provincia}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Información Médica</h2>
                </div>
                
                <div className="space-y-4">
                  {patient.alergias?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Alergias
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {patient.alergias.map((alergia, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-md">
                            {alergia}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {patient.medicamentosActuales?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-blue-500" />
                        Medicamentos actuales
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {patient.medicamentosActuales.map((medicamento, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                            {medicamento}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {patient.antecedentesPersonales?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Antecedentes personales</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {patient.antecedentesPersonales.map((antecedente, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-md">
                            {antecedente}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Contacto de Emergencia */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Contacto de Emergencia</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                    <p className="text-gray-900">{patient.contactoEmergencia?.nombre}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Relación</label>
                    <p className="text-gray-900 capitalize">{patient.contactoEmergencia?.relacion}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="text-gray-900">{patient.contactoEmergencia?.telefono}</p>
                  </div>
                </div>
              </div>

              {/* Seguro Médico */}
              {patient.seguroMedico && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Seguro Médico</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Empresa</label>
                      <p className="text-gray-900">{patient.seguroMedico.empresa}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Número de póliza</label>
                      <p className="text-gray-900">{patient.seguroMedico.numeroPoliza}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Vigencia</label>
                      <p className="text-gray-900">{formatDate(patient.seguroMedico.vigencia)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estadísticas Rápidas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total turnos</span>
                    <span className="font-semibold text-gray-900">{patientAppointments.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Turnos pendientes</span>
                    <span className="font-semibold text-blue-600">
                      {patientAppointments.filter(apt => apt.estado === 'programada' || apt.estado === 'confirmada').length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Turnos completados</span>
                    <span className="font-semibold text-green-600">
                      {patientAppointments.filter(apt => apt.estado === 'completada').length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Última consulta</span>
                    <span className="font-semibold text-gray-900">
                      {patient.ultimaConsulta ? formatDate(patient.ultimaConsulta) : 'Nunca'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Facturas pendientes</span>
                    <span className="font-semibold text-red-600">
                      {patientBills.filter(bill => bill.estado === 'pendiente').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Turnos del Paciente</h2>
                <Link
                  href={`/secretary/appointments/new?patientId=${patient.id}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Nuevo Turno
                </Link>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {patientAppointments.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Especialidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consultorio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Motivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patientAppointments.map(appointment => {
                      const estadoConfig = getAppointmentStatusConfig(appointment.estado);
                      
                      // Calcular retraso si es turno de hoy y está programado
                      const now = new Date();
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const appointmentDate = new Date(appointment.fecha + 'T12:00:00');
                      appointmentDate.setHours(0, 0, 0, 0);
                      
                      let delayMinutes = 0;
                      let showDelay = false;
                      
                      if (appointmentDate.getTime() === today.getTime() && appointment.estado === 'programada') {
                        const [hours, minutes] = appointment.horaInicio.split(':').map(Number);
                        const appointmentTime = new Date();
                        appointmentTime.setHours(hours, minutes, 0, 0);
                        
                        if (now > appointmentTime) {
                          delayMinutes = Math.floor((now.getTime() - appointmentTime.getTime()) / (1000 * 60));
                          showDelay = delayMinutes > 0;
                        }
                      }
                      
                      return (
                        <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(appointment.fecha + 'T12:00:00').toLocaleDateString('es-AR', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric' 
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.horaInicio}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <Stethoscope className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.doctorName}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.especialidad}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                              {appointment.consultorio}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {showDelay ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                Retraso: {delayMinutes < 60 ? `${delayMinutes}m` : `${Math.floor(delayMinutes / 60)}h ${delayMinutes % 60}m`}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estadoConfig.color}`}>
                                {estadoConfig.text}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            <div title={appointment.motivo}>
                              {appointment.motivo}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowDetailModal(true);
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                title="Ver detalle"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <Link
                                href={`/secretary/appointments/${appointment.id}/edit`}
                                className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Editar turno"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              {canRescheduleAppointment(appointment) ? (
                                <Link
                                  href={`/secretary/appointments/new?appointmentId=${appointment.id}`}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Reprogramar"
                                >
                                  <Calendar className="w-4 h-4" />
                                </Link>
                              ) : (
                                <button
                                  disabled
                                  className="p-1.5 text-gray-400 cursor-not-allowed rounded-lg"
                                  title={
                                    appointment.estado !== 'programada'
                                      ? `No se puede reprogramar: turno ${appointment.estado}`
                                      : new Date(`${appointment.fecha} ${appointment.horaInicio}`) <= new Date()
                                        ? 'No se puede reprogramar: turno vencido'
                                        : 'No se puede reprogramar: requiere 24hs de anticipación'
                                  }
                                >
                                  <Calendar className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin turnos registrados</h3>
                  <p className="text-gray-600 mb-6">Este paciente no tiene turnos programados</p>
                  <Link
                    href={`/secretary/appointments/new?patientId=${patient.id}`}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    Programar Primer Turno
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Facturación</h2>
            </div>
            
            <div className="p-6">
              {patientBills.length > 0 ? (
                <div className="space-y-4">
                  {patientBills.map(bill => {
                    const estadoConfig = getBillEstadoConfig(bill.estado);
                    return (
                      <div key={bill.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-gray-900">
                                {formatDate(bill.fecha)} - {bill.conceptos[0]?.descripcion || 'Consulta médica'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoConfig.color}`}>
                                {estadoConfig.text}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p><strong>Monto:</strong> {formatCurrency(bill.total)}</p>
                              {bill.metodoPago && <p><strong>Método de pago:</strong> {bill.metodoPago}</p>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <DollarSign className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin facturación</h3>
                  <p className="text-gray-600">Este paciente no tiene facturas registradas</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle del Turno */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Detalle del Turno</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Información del Turno</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Fecha</label>
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedAppointment.fecha)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Hora</label>
                    <p className="text-sm font-medium text-gray-900">{selectedAppointment.horaInicio}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Estado</label>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getAppointmentStatusConfig(selectedAppointment.estado).color}`}>
                      {getAppointmentStatusConfig(selectedAppointment.estado).text}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Consultorio</label>
                    <p className="text-sm font-medium text-gray-900">{selectedAppointment.consultorio}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Paciente</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">{patient.nombres} {patient.apellidos}</p>
                  <p className="text-xs text-gray-600 mt-1">{formatDocument(patient.tipoDocumento, patient.numeroDocumento)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Doctor</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">{selectedAppointment.doctorName}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedAppointment.especialidad}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Motivo de la Consulta</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900">{selectedAppointment.motivo}</p>
                </div>
              </div>

              {selectedAppointment.notas && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Notas</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{selectedAppointment.notas}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
              <Link
                href={`/secretary/appointments/${selectedAppointment.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Editar Turno
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}