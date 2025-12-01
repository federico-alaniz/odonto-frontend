'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import Link from 'next/link';
import { 
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  Save,
  AlertTriangle,
  CheckCircle,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Eye
} from 'lucide-react';

// TODO: Reemplazar con llamadas al backend
// import { patients } from '../../../../utils/fake-patients';
// import { appointments } from '../../../../utils/fake-appointments';

// Datos temporales vacíos hasta integrar con backend
const patients: any[] = [];
const appointments: any[] = [];

interface PatientInfo {
  id: string;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  edad: number;
  genero: string;
  direccion: {
    calle: string;
    numero: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
  };
  seguroMedico?: {
    empresa: string;
    numeroPoliza: string;
    vigencia: string;
  };
}

interface AppointmentInfo {
  id: string;
  fecha: string;
  horaInicio: string;
  motivo: string;
  consultorio: string;
  especialidad: string;
}

interface VitalSigns {
  presionArterial: string;
  frecuenciaCardiaca: string;
  temperatura: string;
  peso: string;
  altura: string;
  saturacionOxigeno: string;
}

interface ConsultationData {
  motivoConsulta: string;
  antecedentesFamiliares: string;
  antecedentesPersonales: string;
  medicamentosActuales: string;
  examenFisico: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  proximoControl: string;
}

export default function NewConsultationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSuccess } = useToast();
  
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [appointmentInfo, setAppointmentInfo] = useState<AppointmentInfo | null>(null);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    presionArterial: '',
    frecuenciaCardiaca: '',
    temperatura: '',
    peso: '',
    altura: '',
    saturacionOxigeno: ''
  });
  
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    motivoConsulta: '',
    antecedentesFamiliares: '',
    antecedentesPersonales: '',
    medicamentosActuales: '',
    examenFisico: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    proximoControl: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const appointmentId = searchParams.get('appointmentId');
    const patientId = searchParams.get('patientId');

    if (appointmentId && patientId) {
      // Cargar datos del paciente
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        const today = new Date();
        const birthDate = new Date(patient.fechaNacimiento);
        const age = today.getFullYear() - birthDate.getFullYear();
        
        setPatientInfo({
          ...patient,
          edad: age
        });
      }

      // Cargar datos del turno
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        setAppointmentInfo(appointment);
        // Pre-llenar el motivo de consulta con el motivo del turno
        setConsultationData(prev => ({
          ...prev,
          motivoConsulta: appointment.motivo
        }));
      }
    }

    setLoading(false);
  }, [searchParams]);

  const handleVitalSignsChange = (field: keyof VitalSigns, value: string) => {
    setVitalSigns(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConsultationChange = (field: keyof ConsultationData, value: string) => {
    setConsultationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConsultation = async () => {
    setSaving(true);
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aquí se enviarían los datos al backend
    console.log('Guardando consulta:', {
      patientInfo,
      appointmentInfo,
      vitalSigns,
      consultationData,
      fechaConsulta: new Date().toISOString(),
      doctorId: 'user_doc_001'
    });

    setSaving(false);
    
    // Mostrar mensaje de éxito y redirigir
    showSuccess('Consulta guardada', 'La consulta se guardó exitosamente');
    router.push('/doctor/dashboard');
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del paciente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patientInfo || !appointmentInfo) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar datos</h1>
            <p className="text-gray-600 mb-6">No se pudieron cargar los datos del paciente o turno.</p>
            <Link 
              href="/doctor/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
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
                href="/doctor/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nueva Consulta</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Registro de consulta médica
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveConsultation}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Consulta
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Patient Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Información del Paciente</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <p className="text-lg font-semibold text-gray-900">{patientInfo.nombres} {patientInfo.apellidos}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                <p className="text-gray-900">{patientInfo.numeroDocumento}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                <p className="text-gray-900">{patientInfo.edad} años</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <p className="text-gray-900">{patientInfo.genero}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <p className="text-gray-900">{patientInfo.telefono}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Obra Social</label>
                <p className="text-gray-900">{patientInfo.seguroMedico?.empresa || 'Particular'}</p>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Fecha: {appointmentInfo.fecha}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Hora: {appointmentInfo.horaInicio}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>Consultorio: {appointmentInfo.consultorio}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-5 h-5 text-red-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Signos Vitales</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Presión Arterial</label>
                <input
                  type="text"
                  placeholder="120/80 mmHg"
                  value={vitalSigns.presionArterial}
                  onChange={(e) => handleVitalSignsChange('presionArterial', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia Cardíaca</label>
                <input
                  type="text"
                  placeholder="72 bpm"
                  value={vitalSigns.frecuenciaCardiaca}
                  onChange={(e) => handleVitalSignsChange('frecuenciaCardiaca', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura</label>
                <input
                  type="text"
                  placeholder="36.5°C"
                  value={vitalSigns.temperatura}
                  onChange={(e) => handleVitalSignsChange('temperatura', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peso</label>
                <input
                  type="text"
                  placeholder="70 kg"
                  value={vitalSigns.peso}
                  onChange={(e) => handleVitalSignsChange('peso', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Altura</label>
                <input
                  type="text"
                  placeholder="1.70 m"
                  value={vitalSigns.altura}
                  onChange={(e) => handleVitalSignsChange('altura', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Saturación O₂</label>
                <input
                  type="text"
                  placeholder="98%"
                  value={vitalSigns.saturacionOxigeno}
                  onChange={(e) => handleVitalSignsChange('saturacionOxigeno', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Datos de la Consulta</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de Consulta</label>
              <textarea
                rows={3}
                placeholder="Describa el motivo principal de la consulta..."
                value={consultationData.motivoConsulta}
                onChange={(e) => handleConsultationChange('motivoConsulta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Antecedentes Familiares</label>
                <textarea
                  rows={4}
                  placeholder="Antecedentes familiares relevantes..."
                  value={consultationData.antecedentesFamiliares}
                  onChange={(e) => handleConsultationChange('antecedentesFamiliares', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Antecedentes Personales</label>
                <textarea
                  rows={4}
                  placeholder="Antecedentes personales del paciente..."
                  value={consultationData.antecedentesPersonales}
                  onChange={(e) => handleConsultationChange('antecedentesPersonales', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medicamentos Actuales</label>
              <textarea
                rows={3}
                placeholder="Lista de medicamentos que toma actualmente el paciente..."
                value={consultationData.medicamentosActuales}
                onChange={(e) => handleConsultationChange('medicamentosActuales', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Examen Físico</label>
              <textarea
                rows={5}
                placeholder="Descripción detallada del examen físico realizado..."
                value={consultationData.examenFisico}
                onChange={(e) => handleConsultationChange('examenFisico', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnóstico</label>
                <textarea
                  rows={4}
                  placeholder="Diagnóstico o diagnósticos presuntivos..."
                  value={consultationData.diagnostico}
                  onChange={(e) => handleConsultationChange('diagnostico', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento</label>
                <textarea
                  rows={4}
                  placeholder="Tratamiento indicado, medicación, etc..."
                  value={consultationData.tratamiento}
                  onChange={(e) => handleConsultationChange('tratamiento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                rows={3}
                placeholder="Observaciones adicionales..."
                value={consultationData.observaciones}
                onChange={(e) => handleConsultationChange('observaciones', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Próximo Control</label>
              <input
                type="text"
                placeholder="Indicaciones para próximo control (ej: en 1 semana, en 15 días)"
                value={consultationData.proximoControl}
                onChange={(e) => handleConsultationChange('proximoControl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link 
            href="/doctor/dashboard"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSaveConsultation}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Consulta
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}