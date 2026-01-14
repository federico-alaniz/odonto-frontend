'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { 
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  FileText,
  Pill,
  TestTube,
  AlertCircle,
  Clock,
  Save,
  Printer,
  History,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { patientsService } from '@/services/api/patients.service';
import { appointmentsService } from '@/services/api/appointments.service';
import { medicalRecordsService } from '@/services/api/medical-records.service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';

export default function MedicalRecordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { buildPath } = useTenant();
  const { currentUser } = useAuth();
  
  const patientId = params.id as string;
  const appointmentId = searchParams.get('appointmentId');
  
  const [patient, setPatient] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const { showError } = useToast();
  
  // Especialidad del médico actual (TODO: obtener del contexto de autenticación)
  const doctorSpecialty = 'Odontología';

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [patientId, appointmentId, currentUser]);

  const loadData = async () => {
    const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
    
    if (!clinicId) {
      return;
    }

    try {
      setLoading(true);

      // Cargar datos del paciente
      const patientsResponse = await patientsService.getPatients(clinicId);
      const patientData = patientsResponse.data.find((p: any) => p.id === patientId);
      
      if (patientData) {
        setPatient(patientData);
      }

      // Cargar datos de la cita si existe appointmentId
      if (appointmentId) {
        const appointmentsResponse = await appointmentsService.getAppointments(clinicId);
        const appointmentData = appointmentsResponse.data.find((a: any) => a.id === appointmentId);
        
        if (appointmentData) {
          setAppointment(appointmentData);
        }
      }

      // Cargar registros médicos del paciente
      try {
        const recordsResponse = await medicalRecordsService.getPatientRecords(patientId, clinicId, 1, 1000);
        
        if (recordsResponse.success && recordsResponse.data) {
          // Obtener IDs únicos de doctores para cargar sus nombres
          const doctorIds = [...new Set(
            recordsResponse.data
              .filter((record: any) => record.doctorId)
              .map((record: any) => record.doctorId)
          )];

          // Cargar información de los doctores (usuarios)
          const doctorsMap = new Map();
          try {
            // Intentar obtener el nombre del doctor desde localStorage o hacer una llamada al API
            const usersData = localStorage.getItem(`${clinicId}_users`);
            if (usersData) {
              const users = JSON.parse(usersData);
              users.forEach((user: any) => {
                if (doctorIds.includes(user.id)) {
                  doctorsMap.set(user.id, user.nombre || user.email || user.id);
                }
              });
            }
          } catch (error) {
            console.error('Error cargando información de doctores:', error);
          }

          // Filtrar registros guardados (no borradores)
          // Incluir registros sin estadoRegistro (registros antiguos) o con estadoRegistro === 'guardado'
          const filteredRecords = recordsResponse.data
            .filter((record: any) => 
              !record.estadoRegistro || record.estadoRegistro === 'guardado'
            )
            .map((record: any) => ({
              id: record.id,
              fecha: record.fecha,
              doctor: doctorsMap.get(record.doctorId) || record.doctorId || 'Doctor no especificado',
              especialidad: record.tipoConsulta === 'odontologia' ? 'Odontología' : 'General',
              motivo: record.motivoConsulta || 'No especificado',
              diagnostico: record.diagnostico || '',
              tratamiento: record.tratamiento || '',
              presionArterial: record.signosVitales?.presionArterial || 'N/A',
              peso: record.signosVitales?.peso || 'N/A'
            }))
            .sort((a: any, b: any) => b.fecha.localeCompare(a.fecha)); // Ordenar por fecha descendente
          
          setMedicalHistory(filteredRecords);
        } else {
          setMedicalHistory([]);
        }
      } catch (error) {
        console.error('Error cargando historial médico:', error);
        setMedicalHistory([]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      showError('Error', 'No se pudieron cargar los datos del paciente');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando historia clínica..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Paciente no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(buildPath('/doctor/dashboard'))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Historia Clínica</h1>
                <p className="text-sm text-gray-600 mt-1">Registro médico del paciente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Datos del Paciente - Sección completa arriba */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Datos del Paciente</h2>
              <p className="text-2xl font-bold text-gray-900 mt-1">{patient.nombreCompleto || `${patient.nombres} ${patient.apellidos}`}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">DNI: {patient.numeroDocumento}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Edad: {patient.edad} años</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Sexo: {patient.genero === 'masculino' ? 'Masculino' : patient.genero === 'femenino' ? 'Femenino' : 'Otro'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{patient.telefono}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{patient.email || 'N/A'}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Obra Social</p>
              {patient.seguroMedico ? (
                <>
                  <p className="text-sm text-gray-900 font-semibold">{patient.seguroMedico.empresa}</p>
                  <p className="text-xs text-gray-600 mt-1">N° {patient.seguroMedico.numeroPoliza}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">N/A</p>
              )}
            </div>
          </div>

          {appointment && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Cita Actual</h3>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Fecha:</span>
                  <span className="text-gray-600 ml-2">{appointment.fecha}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Hora:</span>
                  <span className="text-gray-600 ml-2">{appointment.horaInicio}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Motivo:</span>
                  <span className="text-gray-600 ml-2">{appointment.motivo}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Historial Médico */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Historial Médico - {doctorSpecialty}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {medicalHistory.length} consulta{medicalHistory.length !== 1 ? 's' : ''} previa{medicalHistory.length !== 1 ? 's' : ''} de esta especialidad
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const url = appointmentId 
                    ? `/historiales/${patientId}/registro/new?appointmentId=${appointmentId}`
                    : `/historiales/${patientId}/registro/new`;
                  router.push(url);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Nuevo Registro
              </button>
            </div>
          </div>
          
          {medicalHistory.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {medicalHistory.map((record) => (
                <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">{record.fecha}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{record.doctor}</span>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {record.especialidad}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Motivo: </span>
                          <span className="text-sm text-gray-600">{record.motivo}</span>
                        </div>
                        
                        {expandedRecord === record.id && (
                          <>
                            <div className="pt-3 border-t border-gray-200 space-y-2">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Diagnóstico: </span>
                                <span className="text-sm text-gray-600">{record.diagnostico}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Tratamiento: </span>
                                <span className="text-sm text-gray-600">{record.tratamiento}</span>
                              </div>
                              {record.presionArterial !== 'N/A' && (
                                <div className="flex gap-6 pt-2">
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">Presión: </span>
                                    <span className="text-sm text-gray-600">{record.presionArterial}</span>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-700">Peso: </span>
                                    <span className="text-sm text-gray-600">{record.peso}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {expandedRecord === record.id ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Ver más
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros médicos previos</h3>
              <p className="text-gray-600 mb-6">
                Este paciente no tiene consultas registradas en {doctorSpecialty}
              </p>
              <button
                onClick={() => {
                  const url = appointmentId 
                    ? `/historiales/${patientId}/registro/new?appointmentId=${appointmentId}`
                    : `/historiales/${patientId}/registro/new`;
                  router.push(url);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FileText className="w-4 h-4" />
                Crear Primer Registro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
