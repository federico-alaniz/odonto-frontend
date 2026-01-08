'use client';

import { useState, useEffect } from 'react';
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
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  Pill
} from 'lucide-react';
import Link from 'next/link';
import { patientsService } from '@/services/api/patients.service';
import { appointmentsService } from '@/services/api/appointments.service';
import { useAuth } from '@/hooks/useAuth';
import { calculateAge } from '@/utils';
import { getAppointmentStatusConfig } from '@/utils/appointment-status';

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
  fechaRegistro?: string;
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

export default function DoctorPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { buildPath } = useTenant();
  const patientId = params.id as string;
  const { currentUser } = useAuth();
  
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
        
        if (!clinicId) {
          console.error('No clinic ID available');
          return;
        }

        // Cargar datos del paciente
        const patientsResponse = await patientsService.getPatients(clinicId, { limit: 1000 });
        
        if (patientsResponse.success && patientsResponse.data) {
          const foundPatient = patientsResponse.data.find(p => p.id === patientId);
          if (foundPatient) {
            setPatient(foundPatient as PatientDetails);
          }
        }

        // Cargar citas del paciente
        const appointmentsResponse = await appointmentsService.getAppointments(clinicId, {
          patientId: patientId,
          limit: 100
        });

        if (appointmentsResponse.success && appointmentsResponse.data) {
          const appointments = appointmentsResponse.data.map((apt: any) => ({
            id: apt.id,
            fecha: apt.fecha,
            horaInicio: apt.horaInicio,
            doctorId: apt.doctorId,
            doctorName: 'Dr. ' + (apt.doctorName || 'Sin asignar'),
            especialidad: apt.especialidad || 'General',
            motivo: apt.motivo || 'Consulta general',
            estado: apt.estado,
            consultorio: apt.consultorio || 'Sin asignar',
            notas: apt.notas
          }));
          setPatientAppointments(appointments);
        }

      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && patientId) {
      loadPatientData();
    }
  }, [patientId, currentUser]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Paciente no encontrado</p>
            <Link
              href={buildPath('/doctor/patients')}
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              Volver a la lista de pacientes
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.nombres} {patient.apellidos}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {patient.tipoDocumento.toUpperCase()}: {patient.numeroDocumento}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={buildPath(`/doctor/patients/${patient.id}/medical-record`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Historia Clínica
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Información Personal
                </div>
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'appointments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Citas ({patientAppointments.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('medical')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'medical'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Información Médica
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Información Personal */}
            {activeTab === 'info' && (
              <div className="space-y-6">
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

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {patient.telefono}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {patient.email || 'No especificado'}
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Dirección</label>
                      <p className="text-lg text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {patient.direccion?.calle || 'No especificado'}
                        {patient.direccion?.ciudad && `, ${patient.direccion.ciudad}`}
                        {patient.direccion?.provincia && `, ${patient.direccion.provincia}`}
                      </p>
                    </div>
                  </div>
                </div>

                {patient.contactoEmergencia && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto de Emergencia</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <p className="text-lg text-gray-900">{patient.contactoEmergencia.nombre}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Relación</label>
                        <p className="text-lg text-gray-900 capitalize">{patient.contactoEmergencia.relacion}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Teléfono</label>
                        <p className="text-lg text-gray-900">{patient.contactoEmergencia.telefono}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Citas */}
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                {patientAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {patientAppointments.map((appointment) => {
                      const statusConfig = getAppointmentStatusConfig(appointment.estado);
                      return (
                        <div
                          key={appointment.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">{formatDate(appointment.fecha)}</span>
                                <Clock className="w-4 h-4 text-gray-500 ml-2" />
                                <span className="text-gray-700">{appointment.horaInicio}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{appointment.motivo}</p>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                  {statusConfig.text}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {appointment.doctorName} • {appointment.consultorio}
                                </span>
                              </div>
                            </div>
                            <Link
                              href={buildPath(`/doctor/consultations/${appointment.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay citas registradas</p>
                  </div>
                )}
              </div>
            )}

            {/* Información Médica */}
            {activeTab === 'medical' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Alergias
                  </h3>
                  {patient.alergias && patient.alergias.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.alergias.map((alergia, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {alergia}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Sin alergias registradas</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-500" />
                    Medicamentos Actuales
                  </h3>
                  {patient.medicamentosActuales && patient.medicamentosActuales.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.medicamentosActuales.map((medicamento, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {medicamento}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Sin medicamentos actuales</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Antecedentes Personales
                  </h3>
                  {patient.antecedentesPersonales && patient.antecedentesPersonales.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {patient.antecedentesPersonales.map((antecedente, index) => (
                        <li key={index}>{antecedente}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">Sin antecedentes personales registrados</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-500" />
                    Antecedentes Familiares
                  </h3>
                  {patient.antecedentesFamiliares && patient.antecedentesFamiliares.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {patient.antecedentesFamiliares.map((antecedente, index) => (
                        <li key={index}>{antecedente}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">Sin antecedentes familiares registrados</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
