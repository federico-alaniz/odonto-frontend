'use client';

import { useState } from 'react';
import Image from 'next/image';
import Portal from '../../calendario/components/Portal';
import { MedicalHistory } from '../adapter';
import Odontogram from '../components/Odontogram';

type MedicalSpecialty = 'clinica-medica' | 'pediatria' | 'cardiologia' | 'traumatologia' | 'ginecologia' | 'dermatologia' | 'neurologia' | 'psiquiatria' | 'odontologia' | 'oftalmologia' | 'otorrinolaringologia' | 'urologia' | 'endocrinologia' | 'gastroenterologia' | 'nefrologia' | 'neumologia';

interface NewHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (history: Omit<MedicalHistory, 'id'>) => void;
}

export default function NewHistoryModal({ isOpen, onClose, onSave }: NewHistoryModalProps) {
  const [isExistingPatient, setIsExistingPatient] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState('');
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
  }>>([]);
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientPhone: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    doctor: 'Dr. García',
    specialty: 'clinica-medica' as MedicalSpecialty,
    type: 'consultation' as const,
    diagnosis: '',
    symptoms: '',
    treatment: '',
    medications: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    notes: '',
    status: 'active' as const
  });

  // Pacientes existentes simulados
  const existingPatients = [
    { id: '1', name: 'María González', age: 45, phone: '555-0101' },
    { id: '2', name: 'Carlos López', age: 32, phone: '555-0102' },
    { id: '3', name: 'Ana Martínez', age: 28, phone: '555-0103' },
    { id: '4', name: 'Pedro Rodríguez', age: 67, phone: '555-0104' },
    { id: '5', name: 'Laura Sánchez', age: 38, phone: '555-0105' }
  ];

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

  if (!isOpen) return null;

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

  const handlePatientSelect = (patientId: string) => {
    const patient = existingPatients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatientId(patientId);
      setFormData(prev => ({
        ...prev,
        patientName: patient.name,
        patientAge: patient.age.toString(),
        patientPhone: patient.phone
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
    const symptoms = formData.symptoms;
    
    const newHistory: Omit<MedicalHistory, 'id'> = {
      patientId: isExistingPatient ? selectedPatientId : 'new_' + Date.now(),
      patient: {
        firstName: formData.patientName.split(' ')[0] || 'Nombre',
        lastName: formData.patientName.split(' ').slice(1).join(' ') || 'Apellido',
        email: `${formData.patientName.toLowerCase().replace(/\s/g, '.')}@email.com`,
        phone: formData.patientPhone,
        age: parseInt(formData.patientAge),
        dni: 'N/A'
      },
      consultationDate: formData.date,
      consultationTime: formData.time,
      doctor: formData.doctor,
      specialty: formData.specialty,
      type: formData.type,
      diagnosis: formData.diagnosis,
      symptoms,
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
      attachments: [],
      diagnosticImages: diagnosticImages.map((img, index) => ({
        id: `img_${Date.now()}_${index}`,
        name: img.file.name,
        description: img.description,
        type: img.type,
        url: img.preview, // En producción esto sería una URL del servidor
        uploadDate: new Date().toISOString()
      })),
      odontogram: formData.specialty === 'odontologia' ? odontogramData : undefined,
      status: formData.status,
      createdAt: new Date().toISOString()
    };

    onSave(newHistory);
    onClose();
    
    // Reset form
    setFormData({
      patientName: '',
      patientAge: '',
      patientPhone: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      doctor: 'Dr. García',
      specialty: 'clinica-medica' as MedicalSpecialty,
      type: 'consultation',
      diagnosis: '',
      symptoms: '',
      treatment: '',
      medications: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: ''
      },
      notes: '',
      status: 'active'
    });
    setSelectedPatientId('');
    setDiagnosticImages([]);
    setOdontogramData([]);
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Nueva Historia Clínica</h2>
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
            {/* Selección de Paciente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Información del Paciente</h3>
              
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isExistingPatient}
                    onChange={() => setIsExistingPatient(true)}
                    className="mr-2"
                  />
                  Paciente Existente
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isExistingPatient}
                    onChange={() => setIsExistingPatient(false)}
                    className="mr-2"
                  />
                  Nuevo Paciente
                </label>
              </div>

              {isExistingPatient ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Paciente
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccione un paciente...</option>
                    {existingPatients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.age} años - {patient.phone}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => handleInputChange('patientName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Edad *
                    </label>
                    <input
                      type="number"
                      value={formData.patientAge}
                      onChange={(e) => handleInputChange('patientAge', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.patientPhone}
                      onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

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
                  placeholder="Separe los síntomas con comas..."
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
                    placeholder="72"
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

            {/* Imágenes Diagnósticas */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Imágenes Diagnósticas</h3>
              
              {/* Campo de carga */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="diagnostic-images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Subir imágenes de diagnóstico
                      </span>
                      <span className="text-sm text-gray-500">
                        Radiografías, ecografías, tomografías, etc. (PNG, JPG, JPEG)
                      </span>
                    </label>
                    <input
                      id="diagnostic-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Preview de imágenes */}
              {diagnosticImages.length > 0 && (
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

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                Guardar Historia Clínica
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}