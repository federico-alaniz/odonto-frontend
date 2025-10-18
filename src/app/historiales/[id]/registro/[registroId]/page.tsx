'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, FileText, Info, Edit3 } from 'lucide-react';
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md inline-flex items-center space-x-2"
            >
              <Edit3 className="w-5 h-5" />
              <span>Editar Registro</span>
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Información General */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-8">
              <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-gray-900">Información de la Consulta</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <label className="block text-sm font-semibold text-blue-700 mb-2">Fecha y Hora</label>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-blue-900">{formatDate(registro.consultationDate)}</p>
                  <p className="text-sm text-blue-700">{registro.consultationTime}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                <label className="block text-sm font-semibold text-emerald-700 mb-2">Doctor</label>
                <p className="text-lg font-bold text-emerald-900">{registro.doctor}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <label className="block text-sm font-semibold text-purple-700 mb-2">Especialidad</label>
                <p className="text-lg font-bold text-purple-900">{getSpecialtyLabel(registro.specialty)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                <label className="block text-sm font-semibold text-amber-700 mb-2">Tipo de Consulta</label>
                <p className="text-lg font-bold text-amber-900">{getTypeLabel(registro.type)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200">
                <label className="block text-sm font-semibold text-rose-700 mb-2">Estado</label>
                <div className="pt-1">
                  {getStatusBadge(registro.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Síntomas y Diagnóstico */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-3 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">Síntomas</h3>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.symptoms}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-3 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">Diagnóstico</h3>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.diagnosis}</p>
              </div>
            </div>
          </div>

          {/* Tratamiento */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-3 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></div>
              <h3 className="text-xl font-bold text-gray-900">Tratamiento</h3>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.treatment}</p>
            </div>
          </div>

          {/* Medicamentos */}
          {registro.medications && registro.medications.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-3 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">Medicamentos Recetados</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {registro.medications.map((med, index) => (
                  <div key={index} className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Medicamento</label>
                        <p className="text-lg font-bold text-indigo-900">{med.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">Dosis</label>
                          <p className="text-sm font-medium text-indigo-800">{med.dosage}</p>
                        </div>
                        <div>
                          <label className="block text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">Frecuencia</label>
                          <p className="text-sm font-medium text-indigo-800">{med.frequency}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">Duración</label>
                        <p className="text-sm font-medium text-indigo-800">{med.duration}</p>
                      </div>
                      {med.instructions && (
                        <div className="pt-2 border-t border-indigo-200">
                          <label className="block text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">Instrucciones</label>
                          <p className="text-sm text-indigo-900 leading-relaxed">{med.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signos Vitales */}
          {registro.vitalSigns && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-3 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">Signos Vitales</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {registro.vitalSigns.bloodPressure && (
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 text-center border border-red-200 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <label className="block text-xs text-red-600 font-bold uppercase tracking-wider mb-2">Presión Arterial</label>
                    <p className="text-2xl font-bold text-red-900">{registro.vitalSigns.bloodPressure}</p>
                    <p className="text-xs text-red-700 font-medium">mmHg</p>
                  </div>
                )}
                {registro.vitalSigns.heartRate && (
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 text-center border border-pink-200 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <label className="block text-xs text-pink-600 font-bold uppercase tracking-wider mb-2">Freq. Cardíaca</label>
                    <p className="text-2xl font-bold text-pink-900">{registro.vitalSigns.heartRate}</p>
                    <p className="text-xs text-pink-700 font-medium">bpm</p>
                  </div>
                )}
                {registro.vitalSigns.temperature && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1" />
                      </svg>
                    </div>
                    <label className="block text-xs text-orange-600 font-bold uppercase tracking-wider mb-2">Temperatura</label>
                    <p className="text-2xl font-bold text-orange-900">{registro.vitalSigns.temperature}</p>
                    <p className="text-xs text-orange-700 font-medium">°C</p>
                  </div>
                )}
                {registro.vitalSigns.weight && (
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 text-center border border-emerald-200 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-3m3 3l3-3" />
                      </svg>
                    </div>
                    <label className="block text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">Peso</label>
                    <p className="text-2xl font-bold text-emerald-900">{registro.vitalSigns.weight}</p>
                    <p className="text-xs text-emerald-700 font-medium">kg</p>
                  </div>
                )}
                {registro.vitalSigns.height && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                      </svg>
                    </div>
                    <label className="block text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">Altura</label>
                    <p className="text-2xl font-bold text-blue-900">{registro.vitalSigns.height}</p>
                    <p className="text-xs text-blue-700 font-medium">cm</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notas y Próxima Cita */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Notas Adicionales */}
            {registro.notes && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-6 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full mr-3"></div>
                  <h3 className="text-xl font-bold text-gray-900">Notas Adicionales</h3>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{registro.notes}</p>
                </div>
              </div>
            )}

            {/* Próxima Cita */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-3 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">Próxima Cita</h3>
              </div>
              {registro.nextAppointment ? (
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6l1 10H7l1-10z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-indigo-900">
                        {formatDate(registro.nextAppointment)}
                      </p>
                      <p className="text-sm text-indigo-700">Cita programada</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6l1 10H7l1-10z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No hay próxima cita programada</p>
                </div>
              )}
            </div>
          </div>

          {/* Odontograma - Solo para especialidad odontología */}
          {registro.specialty === 'odontologia' && registro.odontogram && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-3 h-6 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">Odontograma</h3>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="w-3 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">Imágenes Diagnósticas</h3>
                <span className="ml-auto bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {registro.diagnosticImages.length} {registro.diagnosticImages.length === 1 ? 'imagen' : 'imágenes'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {registro.diagnosticImages.map((image, index) => (
                  <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl overflow-hidden border border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
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
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-200 text-purple-800">
                          {image.type || 'Imagen'}
                        </span>
                        <button
                          onClick={() => openImageViewer(index)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-semibold hover:underline transition-colors"
                        >
                          Ver completa
                        </button>
                      </div>
                      {image.description && (
                        <p className="text-sm text-purple-900 leading-relaxed">{image.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal visor de imágenes */}
      {imageViewerOpen && registro?.diagnosticImages && (
        <ImageViewerModal
          images={registro.diagnosticImages}
          initialIndex={selectedImageIndex}
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
        />
      )}
    </div>
  );
}