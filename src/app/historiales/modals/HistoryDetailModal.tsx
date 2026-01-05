'use client';

import { useState } from 'react';
import Image from 'next/image';
import Portal from '../../calendario/components/Portal';
import { MedicalHistory } from '../adapter';
import ImageViewerModal from './ImageViewerModal';
import Odontogram from '../components/Odontogram';
import { ToothCondition } from '@/services/medicalRecords';

interface HistoryDetailModalProps {
  history: MedicalHistory | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (history: MedicalHistory) => void;
}

export default function HistoryDetailModal({ history, isOpen, onClose, onEdit }: HistoryDetailModalProps) {
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !history) return null;

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'closed': return 'Cerrado';
      case 'follow_up': return 'Seguimiento';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'consulta': 'Consulta',
      'control': 'Control',
      'procedimiento': 'Procedimiento',
      'urgencia': 'Urgencia',
      'laboratorio': 'Laboratorio'
    };
    return types[type] || type;
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

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Historia Clínica - {history.patient.firstName} {history.patient.lastName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {getTypeLabel(history.type)} • {new Date(history.consultationDate).toLocaleDateString('es-ES')} - {history.consultationTime}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Información del Paciente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Información del Paciente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nombre:</span>
                  <p className="text-gray-900">{history.patient.firstName} {history.patient.lastName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{history.patient.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Teléfono:</span>
                  <p className="text-gray-900">{history.patient.phone}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Edad:</span>
                  <p className="text-gray-900">{history.patient.age} años</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    history.status === 'active' ? 'bg-green-100 text-green-800' :
                    history.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {getStatusLabel(history.status)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Doctor:</span>
                  <p className="text-gray-900">{history.doctor}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Especialidad:</span>
                  <p className="text-gray-900">{getSpecialtyLabel(history.specialty)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Tipo:</span>
                  <p className="text-gray-900">{getTypeLabel(history.type)}</p>
                </div>
              </div>
            </div>

            {/* Información de la Consulta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Diagnóstico</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-800">{history.diagnosis}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Síntomas</h3>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-gray-800">{history.symptoms}</p>
                </div>
              </div>
            </div>

            {/* Signos Vitales - No mostrar para especialidad odontología */}
            {history.vitalSigns && history.specialty !== 'odontologia' && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Signos Vitales</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {history.vitalSigns.bloodPressure && (
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{history.vitalSigns.bloodPressure}</div>
                      <div className="text-sm text-red-800">Presión Arterial</div>
                    </div>
                  )}
                  {history.vitalSigns.heartRate && (
                    <div className="bg-pink-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-pink-600">{history.vitalSigns.heartRate}</div>
                      <div className="text-sm text-pink-800">Pulso (bpm)</div>
                    </div>
                  )}
                  {history.vitalSigns.temperature && (
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{history.vitalSigns.temperature}°C</div>
                      <div className="text-sm text-orange-800">Temperatura</div>
                    </div>
                  )}
                  {history.vitalSigns.weight && (
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{history.vitalSigns.weight}</div>
                      <div className="text-sm text-blue-800">Peso (kg)</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tratamiento */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Tratamiento</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-800">{history.treatment}</p>
              </div>
            </div>

            {/* Medicamentos */}
            {history.medications && history.medications.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Medicamentos</h3>
                <div className="space-y-3">
                  {history.medications.map((medication: NonNullable<MedicalHistory['medications']>[number], index: number) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-blue-900">{medication.name}</h4>
                          <p className="text-blue-700">Dosis: {medication.dosage}</p>
                          <p className="text-blue-600 text-sm">Frecuencia: {medication.frequency}</p>
                        </div>
                        <div className="text-right text-sm text-blue-600">
                          <p>Duración: {medication.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notas */}
            {history.notes && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Notas Adicionales</h3>
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-gray-800">{history.notes}</p>
                </div>
              </div>
            )}

            {/* Odontograma - Solo para especialidad odontología */}
            {history.specialty === 'odontologia' && history.odontogram && (
              <div>
                <Odontogram
                  initialConditions={history.odontogram.map((tooth: any) => ({
                    number: tooth.id,
                    status: tooth.status,
                    sectors: tooth.sectors,
                    hasCrown: tooth.hasCrown,
                    hasProsthesis: tooth.hasProsthesis,
                    notes: tooth.notes
                  }))}
                  onUpdate={() => {}} // Modo solo lectura
                  readOnly={true}
                />
              </div>
            )}

            {/* Imágenes Diagnósticas */}
            {history.diagnosticImages && history.diagnosticImages.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Imágenes Diagnósticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.diagnosticImages.map((image: NonNullable<MedicalHistory['diagnosticImages']>[number], index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-50 flex items-center justify-center">
                        <Image 
                          src={image.url} 
                          alt={image.description || image.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openImageViewer(index)}
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            image.type === 'radiografia' ? 'bg-blue-100 text-blue-800' :
                            image.type === 'ecografia' ? 'bg-green-100 text-green-800' :
                            image.type === 'tomografia' ? 'bg-purple-100 text-purple-800' :
                            image.type === 'resonancia' ? 'bg-red-100 text-red-800' :
                            image.type === 'endoscopia' ? 'bg-yellow-100 text-yellow-800' :
                            image.type === 'laboratorio' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {image.type === 'radiografia' ? 'Radiografía' :
                             image.type === 'ecografia' ? 'Ecografía' :
                             image.type === 'tomografia' ? 'Tomografía' :
                             image.type === 'resonancia' ? 'Resonancia' :
                             image.type === 'endoscopia' ? 'Endoscopia' :
                             image.type === 'laboratorio' ? 'Laboratorio' :
                             'Otro'}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 mb-1">{image.name}</h4>
                        {image.description && (
                          <p className="text-xs text-gray-600 mb-2">{image.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(image.uploadDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Archivos Adjuntos */}
            {history.attachments && history.attachments.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Archivos Adjuntos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {history.attachments.map((attachment: NonNullable<MedicalHistory['attachments']>[number], index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-sm text-gray-600">{attachment.type}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Próxima Cita */}
            {history.nextAppointment && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Seguimiento</h3>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <p className="text-purple-900 font-medium">
                    Próxima cita: {new Date(history.nextAppointment).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-purple-700 text-sm">Seguimiento programado</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cerrar
            </button>
            <button 
              onClick={() => onEdit(history)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Editar Historia Clínica
            </button>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {history.diagnosticImages && (
        <ImageViewerModal
          images={history.diagnosticImages}
          initialIndex={selectedImageIndex}
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
        />
      )}
    </Portal>
  );
}