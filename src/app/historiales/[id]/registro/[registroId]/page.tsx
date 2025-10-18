'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, FileText, Info, Edit3, User, Calendar, Stethoscope, Activity, Pill, ClipboardList } from 'lucide-react';
import { MedicalHistory, getMedicalHistoryById } from '../../../adapter';
import Odontogram from '../../../components/Odontogram';
import ImageViewerModal from '../../../modals/ImageViewerModal';

export default function RegistroDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const registroId = params.registroId as string;
  
  const [registro, setRegistro] = useState<MedicalHistory | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Estados para el visor de imágenes
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    // Buscar el registro médico específico usando el adaptador
    const foundRegistro = getMedicalHistoryById(registroId);
    
    if (foundRegistro) {
      setPatientName(`${foundRegistro.patient.firstName} ${foundRegistro.patient.lastName}`);
      setRegistro(foundRegistro);
    }
    
    setLoading(false);
  }, [registroId]);

  const handleBack = () => {
    router.push(`/historiales/${patientId}`);
  };

  const handleEdit = () => {
    router.push(`/historiales/${patientId}/registro/${registroId}/editar`);
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      follow_up: 'bg-blue-100 text-blue-800'
    };

    const statusLabels = {
      active: 'Activo',
      closed: 'Cerrado',
      follow_up: 'Seguimiento'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const getSpecialtyLabel = (specialty: string) => {
    const specialties: { [key: string]: string } = {
      'clinica-medica': 'Clínica Médica',
      'pediatria': 'Pediatría',
      'cardiologia': 'Cardiología',
      'traumatologia': 'Traumatología',
      'ginecologia': 'Ginecología',
      'dermatologia': 'Dermatología',
      'neurologia': 'Neurología',
      'psiquiatria': 'Psiquiatría',
      'odontologia': 'Odontología',
      'oftalmologia': 'Oftalmología',
      'otorrinolaringologia': 'Otorrinolaringología',
      'urologia': 'Urología',
      'endocrinologia': 'Endocrinología',
      'gastroenterologia': 'Gastroenterología',
      'nefrologia': 'Nefrología',
      'neumologia': 'Neumología'
    };
    return specialties[specialty] || specialty;
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'consultation': 'Consulta',
      'followup': 'Seguimiento',
      'emergency': 'Urgencia',
      'checkup': 'Control',
      'surgery': 'Cirugía',
      'therapy': 'Terapia'
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
    <div className="flex flex-col bg-gray-50 -m-6 min-h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
                <h1 className="text-3xl font-bold text-gray-900">Registro Médico</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {patientName} • {formatDate(registro.consultationDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusBadge(registro.status)}
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md flex items-center space-x-2"
              >
                <Edit3 className="w-5 h-5" />
                <span>Editar Registro</span>
              </button>
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
            <span>{patientName}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          
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
                <label className="block text-sm font-medium text-gray-500">Fecha y Hora</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(registro.consultationDate)}</p>
                    <p className="text-sm text-gray-600">{registro.consultationTime}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Doctor</label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{registro.doctor}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Especialidad</label>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{getSpecialtyLabel(registro.specialty)}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Tipo de Consulta</label>
                <p className="text-lg font-semibold text-gray-900">{getTypeLabel(registro.type)}</p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Estado</label>
                <div className="pt-1">
                  {getStatusBadge(registro.status)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Síntomas y Diagnóstico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <h3 className="text-xl font-semibold text-gray-900">Síntomas</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Síntomas reportados por el paciente</p>
            </div>
            <div className="p-6">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.symptoms}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Diagnóstico</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Diagnóstico médico establecido</p>
            </div>
            <div className="p-6">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.diagnosis}</p>
            </div>
          </div>
        </div>

        {/* Tratamiento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Tratamiento</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">Plan de tratamiento recomendado</p>
          </div>
          <div className="p-6">
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.treatment}</p>
          </div>
        </div>

        {/* Medicamentos */}
        {registro.medications && registro.medications.length > 0 && (
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
                {registro.medications.map((medication, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded border">
                        {medication.dosage}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{medication.instructions}</p>
                    <p className="text-gray-600 text-xs">
                      <strong>Frecuencia:</strong> {medication.frequency} | 
                      <strong> Duración:</strong> {medication.duration}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Signos Vitales */}
        {registro.vitalSigns && (
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
                <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold text-red-600">{registro.vitalSigns.bloodPressure}</div>
                  <div className="text-sm text-gray-600">Presión Arterial</div>
                  <div className="text-xs text-gray-500">mmHg</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold text-blue-600">{registro.vitalSigns.heartRate}</div>
                  <div className="text-sm text-gray-600">Frecuencia Cardíaca</div>
                  <div className="text-xs text-gray-500">bpm</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold text-green-600">{registro.vitalSigns.temperature}</div>
                  <div className="text-sm text-gray-600">Temperatura</div>
                  <div className="text-xs text-gray-500">°C</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-2xl font-bold text-purple-600">{registro.vitalSigns.weight || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Peso</div>
                  <div className="text-xs text-gray-500">kg</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notas y Próxima Cita */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Notas Adicionales */}
          {registro.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Notas Adicionales</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">Observaciones del médico</p>
              </div>
              <div className="p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.notes}</p>
              </div>
            </div>
          )}

          {/* Próxima Cita */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Próxima Cita</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Seguimiento programado</p>
            </div>
            <div className="p-6">
              {registro.nextAppointment ? (
                <div className="flex items-center gap-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-blue-900">
                      {formatDate(registro.nextAppointment)}
                    </p>
                    <p className="text-sm text-blue-700">Cita programada</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">No hay próxima cita programada</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Odontograma - Solo para especialidad odontología */}
        {registro.specialty === 'odontologia' && registro.odontogram && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                <h3 className="text-xl font-semibold text-gray-900">Odontograma</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Estado dental del paciente</p>
            </div>
            <div className="p-6">
              <Odontogram
                initialConditions={registro.odontogram}
                onUpdate={() => {}} // Solo lectura
                readOnly={true}
              />
            </div>
          </div>
        )}

        {/* Imágenes Diagnósticas */}
        {registro.diagnosticImages && registro.diagnosticImages.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Imágenes Diagnósticas</h3>
                </div>
                <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {registro.diagnosticImages.length} {registro.diagnosticImages.length === 1 ? 'imagen' : 'imágenes'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Estudios e imágenes médicas</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {registro.diagnosticImages.map((image, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-gray-50">
                    <div 
                      className="cursor-pointer relative"
                      onClick={() => openImageViewer(index)}
                    >
                      <Image
                        src={image.url || ''}
                        alt={image.description || `Imagen diagnóstica ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-white bg-opacity-90 rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity">
                          <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          {image.type || 'Imagen'}
                        </span>
                        <button
                          onClick={() => openImageViewer(index)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline transition-colors"
                        >
                          Ver completa
                        </button>
                      </div>
                      {image.description && (
                        <p className="text-sm text-gray-700 leading-relaxed">{image.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal visor de imágenes */}
      {imageViewerOpen && registro.diagnosticImages && (
        <ImageViewerModal
          images={registro.diagnosticImages as any}
          initialIndex={selectedImageIndex}
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
        />
      )}
    </div>
  );
}