'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Portal from '../../calendario/components/Portal';
import { MedicalHistory } from '../adapter';
import Odontogram from '../components/Odontogram';

interface EditHistoryModalProps {
  history: MedicalHistory | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedHistory: MedicalHistory) => void;
}

export default function EditHistoryModal({ history, isOpen, onClose, onSave }: EditHistoryModalProps) {
  const [diagnosticImages, setDiagnosticImages] = useState<Array<{
    file: File;
    preview: string;
    description: string;
    type: 'radiografia' | 'ecografia' | 'tomografia' | 'resonancia' | 'endoscopia' | 'laboratorio' | 'otro';
  }>>([]);
  
  const [odontogramData, setOdontogramData] = useState<Array<{
    id: number;
    status: 'healthy' | 'caries' | 'filling' | 'crown' | 'extraction' | 'root_canal' | 'implant' | 'missing';
    notes?: string;
  }>>(history?.odontogram || []);
  
  const [formData, setFormData] = useState({
    date: history?.consultationDate || '',
    time: history?.consultationTime || '',
    doctor: history?.doctor || '',
    specialty: history?.specialty || 'clinica-medica',
    type: history?.type || 'consultation',
    diagnosis: history?.diagnosis || '',
    symptoms: history?.symptoms || '',
    treatment: history?.treatment || '',
    medications: history?.medications?.map(med => 
      `${med.name}, ${med.dosage}, ${med.frequency}, ${med.duration}`
    ).join('\n') || '',
    vitalSigns: {
      bloodPressure: history?.vitalSigns?.bloodPressure || '',
      heartRate: history?.vitalSigns?.heartRate?.toString() || '',
      temperature: history?.vitalSigns?.temperature?.toString() || '',
      weight: history?.vitalSigns?.weight?.toString() || '',
      height: history?.vitalSigns?.height?.toString() || ''
    },
    notes: history?.notes || '',
    status: history?.status || 'active'
  });

  // Doctores disponibles
  const availableDoctors = [
    'Dr. García',
    'Dra. Rodríguez',
    'Dr. Martínez',
    'Dra. López',
    'Dr. Sánchez'
  ];

  // Especialidades médicas disponibles
  const availableSpecialties = [
    { value: 'clinica-medica', label: 'Clínica Médica' },
    { value: 'pediatria', label: 'Pediatría' },
    { value: 'cardiologia', label: 'Cardiología' },
    { value: 'traumatologia', label: 'Traumatología' },
    { value: 'ginecologia', label: 'Ginecología' },
    { value: 'dermatologia', label: 'Dermatología' },
    { value: 'neurologia', label: 'Neurología' },
    { value: 'psiquiatria', label: 'Psiquiatría' },
    { value: 'odontologia', label: 'Odontología' },
    { value: 'oftalmologia', label: 'Oftalmología' },
    { value: 'otorrinolaringologia', label: 'Otorrinolaringología' },
    { value: 'urologia', label: 'Urología' },
    { value: 'endocrinologia', label: 'Endocrinología' },
    { value: 'gastroenterologia', label: 'Gastroenterología' },
    { value: 'nefrologia', label: 'Nefrología' },
    { value: 'neumologia', label: 'Neumología' }
  ];

  // Actualizar formData cuando cambie la historia
  useEffect(() => {
    if (history) {
      setFormData({
        date: history.consultationDate,
        time: history.consultationTime,
        doctor: history.doctor,
        specialty: history.specialty,
        type: history.type,
        diagnosis: history.diagnosis,
        symptoms: history.symptoms,
        treatment: history.treatment,
        medications: history.medications?.map(med => 
          `${med.name}, ${med.dosage}, ${med.frequency}, ${med.duration}`
        ).join('\n') || '',
        vitalSigns: {
          bloodPressure: history.vitalSigns?.bloodPressure || '',
          heartRate: history.vitalSigns?.heartRate?.toString() || '',
          temperature: history.vitalSigns?.temperature?.toString() || '',
          weight: history.vitalSigns?.weight?.toString() || '',
          height: history.vitalSigns?.height?.toString() || ''
        },
        notes: history.notes || '',
        status: history.status
      });
      setOdontogramData(history.odontogram || []);
    }
  }, [history]);

  if (!isOpen || !history) return null;

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const parseMedications = (medicationsText: string) => {
    if (!medicationsText.trim()) return [];
    
    return medicationsText.split('\n').map(line => {
      const parts = line.split(',').map(part => part.trim());
      return {
        name: parts[0] || '',
        dosage: parts[1] || '',
        frequency: parts[2] || '',
        duration: parts[3] || ''
      };
    }).filter(med => med.name);
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setDiagnosticImages(prev => [...prev, {
            file,
            preview: e.target?.result as string,
            description: '',
            type: 'otro'
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setDiagnosticImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageDescription = (index: number, description: string) => {
    setDiagnosticImages(prev => prev.map((img, i) => 
      i === index ? { ...img, description } : img
    ));
  };

  const updateImageType = (index: number, type: 'radiografia' | 'ecografia' | 'tomografia' | 'resonancia' | 'endoscopia' | 'laboratorio' | 'otro') => {
    setDiagnosticImages(prev => prev.map((img, i) => 
      i === index ? { ...img, type } : img
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const medications = parseMedications(formData.medications);
    
    const updatedHistory: MedicalHistory = {
      ...history,
      consultationDate: formData.date,
      consultationTime: formData.time,
      doctor: formData.doctor,
      specialty: formData.specialty as MedicalHistory['specialty'],
      type: formData.type as MedicalHistory['type'],
      diagnosis: formData.diagnosis,
      symptoms: formData.symptoms,
      treatment: formData.treatment,
      medications,
      vitalSigns: {
        bloodPressure: formData.vitalSigns.bloodPressure || undefined,
        heartRate: formData.vitalSigns.heartRate ? parseInt(formData.vitalSigns.heartRate) : undefined,
        temperature: formData.vitalSigns.temperature ? parseFloat(formData.vitalSigns.temperature) : undefined,
        weight: formData.vitalSigns.weight ? parseFloat(formData.vitalSigns.weight) : undefined,
        height: formData.vitalSigns.height ? parseFloat(formData.vitalSigns.height) : undefined
      },
      notes: formData.notes,
      diagnosticImages: [
        ...(history.diagnosticImages || []),
        ...diagnosticImages.map((img, index) => ({
          id: `img_${Date.now()}_${index}`,
          name: img.file.name,
          description: img.description,
          type: img.type,
          url: img.preview,
          uploadDate: new Date().toISOString()
        }))
      ],
      odontogram: formData.specialty === 'odontologia' ? odontogramData : history.odontogram,
      status: formData.status as MedicalHistory['status']
    };

    onSave(updatedHistory);
    onClose();
    setDiagnosticImages([]);
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Editar Historia Clínica
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {history.patient.firstName} {history.patient.lastName} • {history.patient.age} años
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

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información de la Consulta */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor *
                </label>
                <select
                  value={formData.doctor}
                  onChange={(e) => handleInputChange('doctor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {availableDoctors.map((doctor) => (
                    <option key={doctor} value={doctor}>{doctor}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidad *
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {availableSpecialties.map((specialty) => (
                    <option key={specialty.value} value={specialty.value}>{specialty.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Consulta *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="consultation">Consulta</option>
                  <option value="followup">Seguimiento</option>
                  <option value="emergency">Urgencia</option>
                  <option value="checkup">Control</option>
                  <option value="surgery">Cirugía</option>
                  <option value="therapy">Terapia</option>
                </select>
              </div>
            </div>

            {/* Información Médica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico *
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del diagnóstico..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Síntomas
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción de los síntomas..."
                />
              </div>
            </div>

            {/* Signos Vitales - Solo mostrar si NO es odontología */}
            {formData.specialty !== 'odontologia' && (
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Signos Vitales</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Presión Arterial
                  </label>
                  <input
                    type="text"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={(e) => handleInputChange('vitalSigns.bloodPressure', e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pulso (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.vitalSigns.heartRate}
                    onChange={(e) => handleInputChange('vitalSigns.heartRate', e.target.value)}
                    placeholder="70"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitalSigns.temperature}
                    onChange={(e) => handleInputChange('vitalSigns.temperature', e.target.value)}
                    placeholder="36.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitalSigns.weight}
                    onChange={(e) => handleInputChange('vitalSigns.weight', e.target.value)}
                    placeholder="70"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.vitalSigns.height}
                    onChange={(e) => handleInputChange('vitalSigns.height', e.target.value)}
                    placeholder="170"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            )}

            {/* Tratamiento y Medicamentos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tratamiento
                </label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => handleInputChange('treatment', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del tratamiento recomendado..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicamentos
                </label>
                <textarea
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Formato: Nombre, Dosis, Frecuencia, Duración (una línea por medicamento)
Ejemplo:
Ibuprofeno, 400mg, Cada 8 horas, 5 días
Paracetamol, 500mg, Cada 6 horas, 3 días"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observaciones, recomendaciones especiales, etc..."
              />
            </div>

            {/* Odontograma - Solo para especialidad odontología */}
            {formData.specialty === 'odontologia' && (
              <div>
                <Odontogram
                  initialConditions={odontogramData}
                  onUpdate={setOdontogramData}
                  readOnly={false}
                />
              </div>
            )}

            {/* Imágenes Diagnósticas Adicionales */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Agregar Nuevas Imágenes Diagnósticas</h3>
              
              {/* Campo de carga */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="diagnostic-images-edit" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Agregar nuevas imágenes de diagnóstico
                      </span>
                      <span className="text-sm text-gray-500">
                        Radiografías, ecografías, tomografías, etc. (PNG, JPG, JPEG)
                      </span>
                    </label>
                    <input
                      id="diagnostic-images-edit"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Preview de nuevas imágenes */}
              {diagnosticImages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Imágenes seleccionadas:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diagnosticImages.map((image, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{image.file.name}</h4>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <Image 
                        src={image.preview} 
                        alt="Preview" 
                        width={300}
                        height={128}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                      
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tipo de imagen
                          </label>
                          <select
                            value={image.type}
                            onChange={(e) => updateImageType(index, e.target.value as 'radiografia' | 'ecografia' | 'tomografia' | 'resonancia' | 'endoscopia' | 'laboratorio' | 'otro')}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="radiografia">Radiografía</option>
                            <option value="ecografia">Ecografía</option>
                            <option value="tomografia">Tomografía</option>
                            <option value="resonancia">Resonancia Magnética</option>
                            <option value="endoscopia">Endoscopia</option>
                            <option value="laboratorio">Laboratorio</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          <input
                            type="text"
                            value={image.description}
                            onChange={(e) => updateImageDescription(index, e.target.value)}
                            placeholder="Descripción de la imagen..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado del Caso
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Activo</option>
                <option value="follow_up">Seguimiento</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}