'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, 
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

// TODO: Reemplazar con llamadas al backend
// import { patients } from '../../../../utils/fake-patients';
// import { appointments } from '../../../../utils/fake-appointments';
// import { bills } from '../../../../utils/fake-billing';

// Datos temporales vacíos hasta integrar con backend
const patients: any[] = [];
const appointments: any[] = [];
const bills: any[] = [];

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
}

interface PatientBill {
  id: string;
  fecha: string;
  conceptos: any[];
  total: number;
  estado: string;
  metodoPago?: string;
}

export default function SecretaryPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<PatientAppointment[]>([]);
  const [patientBills, setPatientBills] = useState<PatientBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadPatientData = () => {
      // Buscar paciente
      const foundPatient = patients.find(p => p.id === patientId);
      if (!foundPatient) {
        router.push('/secretary/patients');
        return;
      }

      setPatient(foundPatient as PatientDetails);

      // Buscar citas del paciente
      const patientAppts = appointments
        .filter(apt => apt.patientId === patientId)
        .map(apt => {
          const doctorNames: Record<string, string> = {
            'user_doc_001': 'Dr. Juan Pérez',
            'user_doc_002': 'Dra. María González', 
            'user_doc_003': 'Dr. Carlos Rodríguez'
          };
          
          const specialties: Record<string, string> = {
            'clinica-medica': 'Clínica Médica',
            'cardiologia': 'Cardiología',
            'pediatria': 'Pediatría',
            'dermatologia': 'Dermatología'
          };

          return {
            ...apt,
            doctorName: doctorNames[apt.doctorId] || 'Doctor no asignado',
            especialidad: specialties[apt.especialidad] || apt.especialidad
          };
        })
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      setPatientAppointments(patientAppts);

      // Buscar facturas del paciente
      const patientBillsData = bills
        .filter(bill => bill.patientId === patientId)
        .map(bill => ({
          id: bill.id,
          fecha: bill.fecha,
          conceptos: bill.conceptos,
          total: bill.total,
          estado: bill.estado,
          metodoPago: bill.metodoPago
        }))
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      
      setPatientBills(patientBillsData);

      setLoading(false);
    };

    setTimeout(loadPatientData, 800);
  }, [patientId, router]);

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

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

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'programada':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Programada' };
      case 'confirmada':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Confirmada' };
      case 'completada':
        return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Completada' };
      case 'cancelada':
        return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Cancelada' };
      case 'no-show':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'No asistió' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: estado };
    }
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
  const canRescheduleAppointment = (appointment: any) => {
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del paciente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {patient.nombres} {patient.apellidos}
                </h1>
                <p className="text-gray-600 mt-1">
                  {patient.tipoDocumento.toUpperCase()}: {patient.numeroDocumento} • {calculateAge(patient.fechaNacimiento)} años
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/secretary/appointments/new?patientId=${patient.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Nuevo Turno</span>
              </Link>
              
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors inline-flex items-center space-x-2">
                <Edit3 className="w-5 h-5" />
                <span>Editar</span>
              </button>
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
                { id: 'overview', label: 'Resumen General', icon: Eye },
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Información Personal */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
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
                    <p className="text-lg text-gray-900">{patient.tipoDocumento.toUpperCase()}: {patient.numeroDocumento}</p>
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
                      const estadoConfig = getEstadoConfig(appointment.estado);
                      return (
                        <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(appointment.fecha)}
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoConfig.color}`}>
                              {estadoConfig.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            <div title={appointment.motivo}>
                              {appointment.motivo}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalle">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Editar turno">
                                <Edit3 className="w-4 h-4" />
                              </button>
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
    </div>
  );
}