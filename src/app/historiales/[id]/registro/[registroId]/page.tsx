'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Info, User, Calendar, Stethoscope, Activity, Pill, ClipboardList, FileText } from 'lucide-react';
import medicalRecordsService, { MedicalRecord } from '@/services/medicalRecords';
import { patientsService } from '@/services/api/patients.service';
import Odontogram from '../../../components/Odontogram';
import ImageViewerModal from '../../../modals/ImageViewerModal';

/**
 * Página de detalle de registro médico (Solo lectura)
 * 
 * IMPORTANTE: Los registros médicos NO deben ser editables para mantener
 * la integridad y trazabilidad de la historia clínica del paciente.
 * 
 * Si se necesita corregir información, se debe implementar un sistema de
 * rectificaciones que mantenga el registro original y agregue una nota
 * de corrección con fecha, usuario y motivo.
 */
export default function RegistroDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const registroId = params.registroId as string;
  
  const [registro, setRegistro] = useState<MedicalRecord | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el visor de imágenes
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const clinicId = localStorage.getItem('clinicId') || 'CLINIC_001';
        
        // Load patient data
        const patientResponse = await patientsService.getPatientById(patientId, clinicId);
        if (patientResponse.success) {
          setPatient(patientResponse.data);
        }
        
        // Load medical record
        const recordResponse = await medicalRecordsService.getById(registroId);
        if (recordResponse.success && recordResponse.data) {
          setRegistro(recordResponse.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [registroId, patientId]);

  const handleBack = () => {
    router.push(`/historiales/${patientId}`);
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getConsultaTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'general': 'Consulta General',
      'odontologia': 'Odontología',
      'pediatria': 'Pediatría',
      'cardiologia': 'Cardiología',
      'traumatologia': 'Traumatología',
      'ginecologia': 'Ginecología',
      'dermatologia': 'Dermatología',
      'neurologia': 'Neurología',
      'psiquiatria': 'Psiquiatría',
      'oftalmologia': 'Oftalmología'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!registro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Registro médico no encontrado</h2>
          <p className="text-gray-600 mb-4">El registro médico que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Volver a Historia Clínica
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Registro Médico</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {patient?.nombreCompleto || 'Paciente'} • {formatDate(registro.fecha)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Info className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800 font-medium">Registro de solo lectura</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <span>Gestión</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">Historiales Clínicos</span>
            <span>•</span>
            <span>{patient?.nombreCompleto || 'Paciente'}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
          
        {/* Información General */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Información de la Consulta</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Datos generales del registro médico</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Fecha</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{formatDate(registro.fecha)}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Tipo de Consulta</label>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{getConsultaTypeLabel(registro.tipoConsulta)}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Creado</label>
                <p className="text-sm text-gray-600">{formatDateTime(registro.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivo de Consulta y Anamnesis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {registro.motivoConsulta && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Motivo de Consulta</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">Razón de la visita</p>
              </div>
              <div className="p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.motivoConsulta}</p>
              </div>
            </div>
          )}
          
          {registro.anamnesis && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Anamnesis</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">Historia clínica del paciente</p>
              </div>
              <div className="p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.anamnesis}</p>
              </div>
            </div>
          )}
        </div>

        {/* Diagnóstico y Tratamiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {registro.diagnostico && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Diagnóstico</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">Diagnóstico médico establecido</p>
              </div>
              <div className="p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.diagnostico}</p>
              </div>
            </div>
          )}
          
          {registro.tratamiento && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Tratamiento</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">Plan de tratamiento recomendado</p>
              </div>
              <div className="p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.tratamiento}</p>
              </div>
            </div>
          )}
        </div>

        {/* Signos Vitales */}
        {registro.signosVitales && registro.signosVitales.presionArterial && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">Signos Vitales</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Mediciones de signos vitales</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {registro.signosVitales.presionArterial && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-red-600">{registro.signosVitales.presionArterial}</div>
                    <div className="text-sm text-gray-600">Presión Arterial</div>
                    <div className="text-xs text-gray-500">mmHg</div>
                  </div>
                )}
                {registro.signosVitales.frecuenciaCardiaca && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-blue-600">{registro.signosVitales.frecuenciaCardiaca}</div>
                    <div className="text-sm text-gray-600">Frecuencia Cardíaca</div>
                    <div className="text-xs text-gray-500">bpm</div>
                  </div>
                )}
                {registro.signosVitales.temperatura && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-green-600">{registro.signosVitales.temperatura}</div>
                    <div className="text-sm text-gray-600">Temperatura</div>
                    <div className="text-xs text-gray-500">°C</div>
                  </div>
                )}
                {registro.signosVitales.peso && (
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-purple-600">{registro.signosVitales.peso}</div>
                    <div className="text-sm text-gray-600">Peso</div>
                    <div className="text-xs text-gray-500">kg</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Examen Físico */}
        {registro.examenFisico && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Examen Físico</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Hallazgos del examen físico</p>
            </div>
            <div className="p-6">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.examenFisico}</p>
            </div>
          </div>
        )}

        {/* Medicamentos */}
        {registro.medicamentos && registro.medicamentos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-900">Medicamentos Recetados</h3>
      </div>
      <p className="text-sm text-gray-600 mt-1">Medicamentos prescritos y dosificación</p>
    </div>
    <div className="p-6">
      <div className="grid gap-4">
        {registro.medicamentos.map((medication: any, index: number) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900">{medication.nombre}</h4>
              <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded border">
                {medication.dosis}
              </span>
            </div>
            <p className="text-gray-700 text-sm mb-2">{medication.instrucciones}</p>
            <p className="text-gray-600 text-xs">
              <strong>Frecuencia:</strong> {medication.frecuencia} | 
              <strong> Duración:</strong> {medication.duracion}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

{/* Observaciones y Próxima Cita */}
<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
  {/* Observaciones */}
  {registro.observaciones && (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-yellow-600" />
          <h3 className="text-xl font-semibold text-gray-900">Observaciones</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">Notas adicionales del médico</p>
      </div>
      <div className="p-6">
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.observaciones}</p>
      </div>
    </div>
  )}

  {/* Próxima Cita */}
  {registro.proximaCita && (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Próxima Cita</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">Seguimiento programado</p>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-blue-900">
              {formatDate(registro.proximaCita)}
            </p>
            <p className="text-sm text-blue-700">Cita programada</p>
          </div>
        </div>
      </div>
    </div>
  )}
</div>

{/* Odontograma - Solo para especialidad odontología */}
{registro.tipoConsulta === 'odontologia' && registro.odontogramas && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-teal-600" />
        <h3 className="text-xl font-semibold text-gray-900">Odontograma Actual</h3>
      </div>
      <p className="text-sm text-gray-600 mt-1">Estado dental del paciente</p>
    </div>
    <div className="p-6">
      <Odontogram
        initialConditions={registro.odontogramas.actual || []}
        onUpdate={() => {}} // Solo lectura
        readOnly={true}
      />
    </div>
  </div>
)}

{/* Imágenes */}
{registro.imagenes && registro.imagenes.length > 0 && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">Imágenes</h3>
        </div>
        <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
          {registro.imagenes.length} {registro.imagenes.length === 1 ? 'imagen' : 'imágenes'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">Imágenes adjuntas al registro</p>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {registro.imagenes.map((image: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-gray-50">
            <div className="p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{image.nombre || `Imagen ${index + 1}`}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}