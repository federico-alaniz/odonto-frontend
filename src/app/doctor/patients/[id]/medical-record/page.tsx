'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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

export default function MedicalRecordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const patientId = params.id as string;
  const appointmentId = searchParams.get('appointmentId');
  
  const [patient, setPatient] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  
  // Especialidad del médico actual (TODO: obtener del contexto de autenticación)
  const doctorSpecialty = 'Odontología';

  useEffect(() => {
    loadData();
  }, [patientId, appointmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const clinicId = 'clinic_001';

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

      // TODO: Cargar historial médico del paciente filtrado por especialidad
      // Por ahora, datos de ejemplo
      const mockHistory = [
        {
          id: '1',
          fecha: '2025-11-10',
          doctor: 'Dr. Federico Alaniz',
          especialidad: 'Odontología',
          motivo: 'Limpieza dental y control',
          diagnostico: 'Higiene bucal adecuada. Presencia de sarro leve en molares inferiores',
          tratamiento: 'Limpieza dental profesional realizada. Indicación de cepillado 3 veces al día y uso de hilo dental',
          presionArterial: 'N/A',
          peso: 'N/A'
        },
        {
          id: '2',
          fecha: '2025-09-15',
          doctor: 'Dr. Federico Alaniz',
          especialidad: 'Odontología',
          motivo: 'Dolor en muela superior derecha',
          diagnostico: 'Caries profunda en pieza 16 (primer molar superior derecho)',
          tratamiento: 'Obturación con resina compuesta. Indicación de analgésicos (Ibuprofeno 400mg cada 8hs por 3 días)',
          presionArterial: 'N/A',
          peso: 'N/A'
        },
        {
          id: '3',
          fecha: '2025-08-05',
          doctor: 'Dr. Federico Alaniz',
          especialidad: 'Odontología',
          motivo: 'Control post-extracción',
          diagnostico: 'Cicatrización normal post-extracción pieza 38 (muela del juicio)',
          tratamiento: 'Evolución favorable. Alta del tratamiento',
          presionArterial: 'N/A',
          peso: 'N/A'
        },
        {
          id: '4',
          fecha: '2025-07-20',
          doctor: 'Dr. Juan Pérez',
          especialidad: 'Cardiología',
          motivo: 'Control de presión arterial',
          diagnostico: 'Hipertensión arterial controlada',
          tratamiento: 'Enalapril 10mg - 1 comprimido cada 12hs',
          presionArterial: '130/85',
          peso: '75 kg'
        },
        {
          id: '5',
          fecha: '2025-06-10',
          doctor: 'Dra. María González',
          especialidad: 'Medicina General',
          motivo: 'Chequeo anual',
          diagnostico: 'Estado general bueno',
          tratamiento: 'Continuar con medicación habitual',
          presionArterial: '135/88',
          peso: '77 kg'
        }
      ];

      // Filtrar por especialidad del médico actual
      const filteredHistory = mockHistory.filter(
        record => record.especialidad === doctorSpecialty
      );
      
      setMedicalHistory(filteredHistory);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando historia clínica...</p>
        </div>
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
                onClick={() => router.push('/doctor/dashboard')}
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
            <h2 className="text-xl font-semibold text-gray-900">Datos del Paciente</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">{patient.name}</p>
              <p className="text-sm text-gray-600 mt-1">DNI: {patient.numeroDocumento}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Edad: {patient.edad} años</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Sexo: {patient.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{patient.telefono}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{patient.email}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Obra Social</p>
              <p className="text-sm text-gray-900 font-semibold">{patient.obraSocial}</p>
              <p className="text-xs text-gray-600 mt-1">N° {patient.numeroAfiliado}</p>
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
        {medicalHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Historial Médico - {doctorSpecialty}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {medicalHistory.length} consulta{medicalHistory.length !== 1 ? 's' : ''} previa{medicalHistory.length !== 1 ? 's' : ''} de esta especialidad
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/historiales/${patientId}/registro/new`)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  Nuevo Registro
                </button>
              </div>
            </div>
            
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
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
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
          </div>
        )}
      </div>
    </div>
  );
}
