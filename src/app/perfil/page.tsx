'use client';

import { useState } from 'react';
import { User, Mail, Phone, Calendar, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import MedicalFormContainer from '@/components/forms/MedicalFormContainer';
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import MedicalInputField from '@/components/forms/MedicalInputField';
import MedicalSelectField from '@/components/forms/MedicalSelectField';
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';
import MedicalButton from '@/components/forms/MedicalButton';

export default function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nombres: 'Carlos Eduardo',
    apellidos: 'Mendoza García',
    email: 'carlos.mendoza@clinica.com',
    telefono: '3001234567',
    especialidades: [
      { id: '1', nombre: 'Cardiología', tipo: 'cardiologia', fechaCertificacion: '2010-06-15', institucion: 'Universidad Nacional' },
      { id: '2', nombre: 'Medicina Interna', tipo: 'medicina-interna', fechaCertificacion: '2008-12-10', institucion: 'Hospital San Juan' }
    ],
    licencia: 'LIC-12345678',
    fechaNacimiento: '1980-05-15',
    direccion: 'Calle 123 #45-67, Bogotá',
    biografia: 'Cardiólogo e internista con más de 15 años de experiencia en el diagnóstico y tratamiento de enfermedades cardiovasculares y medicina interna.'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addEspecialidad = () => {
    const newEspecialidad = {
      id: Date.now().toString(),
      nombre: '',
      tipo: '',
      fechaCertificacion: '',
      institucion: ''
    };
    setFormData(prev => ({
      ...prev,
      especialidades: [...prev.especialidades, newEspecialidad]
    }));
  };

  const removeEspecialidad = (id: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter(esp => esp.id !== id)
    }));
  };

  const updateEspecialidad = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.map(esp => 
        esp.id === id ? { ...esp, [field]: value } : esp
      )
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simular guardado
    setTimeout(() => {
      setSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tu información personal y profesional
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <MedicalButton
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </MedicalButton>
                <MedicalButton
                  variant="primary"
                  onClick={handleSave}
                  loading={saving}
                  loadingText="Guardando..."
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </MedicalButton>
              </>
            ) : (
              <MedicalButton
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </MedicalButton>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <MedicalFormContainer>
          
          {/* Información Personal */}
          <MedicalFormSection
            title="Información Personal"
            description="Datos básicos del perfil profesional"
            icon={User}
            iconColor="text-blue-600"
          >
            <MedicalFieldGroup>
              <MedicalInputField
                label="Nombres"
                value={formData.nombres}
                onChange={(value) => handleInputChange('nombres', value)}
                disabled={!isEditing}
                required
              />
              <MedicalInputField
                label="Apellidos"
                value={formData.apellidos}
                onChange={(value) => handleInputChange('apellidos', value)}
                disabled={!isEditing}
                required
              />
              <MedicalInputField
                label="Fecha de Nacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(value) => handleInputChange('fechaNacimiento', value)}
                disabled={!isEditing}
              />
              <div className="text-sm text-gray-500 mt-1">
                Edad: {calculateAge(formData.fechaNacimiento)} años
              </div>
            </MedicalFieldGroup>
          </MedicalFormSection>

          {/* Información de Contacto */}
          <MedicalFormSection
            title="Información de Contacto"
            description="Datos de contacto y ubicación"
            icon={Mail}
            iconColor="text-green-600"
          >
            <MedicalFieldGroup>
              <MedicalInputField
                label="Correo Electrónico"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                disabled={!isEditing}
                required
              />
              <MedicalInputField
                label="Teléfono"
                value={formData.telefono}
                onChange={(value) => handleInputChange('telefono', value)}
                disabled={!isEditing}
                required
              />
              <MedicalInputField
                label="Dirección"
                value={formData.direccion}
                onChange={(value) => handleInputChange('direccion', value)}
                disabled={!isEditing}
                className="md:col-span-2"
              />
            </MedicalFieldGroup>
          </MedicalFormSection>

          {/* Información Profesional */}
          <MedicalFormSection
            title="Información Profesional"
            description="Datos de especialidades y licencia médica"
            icon={Calendar}
            iconColor="text-purple-600"
          >
            <div className="space-y-6">
              {/* Especialidades */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Especialidades Médicas</h4>
                  {isEditing && (
                    <button
                      onClick={addEspecialidad}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Especialidad
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {formData.especialidades.map((especialidad, index) => (
                    <div key={especialidad.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-gray-900">Especialidad {index + 1}</h5>
                        {isEditing && formData.especialidades.length > 1 && (
                          <button
                            onClick={() => removeEspecialidad(especialidad.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <MedicalFieldGroup>
                        <MedicalSelectField
                          label="Especialidad"
                          value={especialidad.tipo}
                          onChange={(value) => {
                            updateEspecialidad(especialidad.id, 'tipo', value);
                            // Actualizar también el nombre basado en el tipo
                            const nombres = {
                              'clinica-medica': 'Clínica Médica',
                              'cardiologia': 'Cardiología',
                              'pediatria': 'Pediatría',
                              'traumatologia': 'Traumatología',
                              'ginecologia': 'Ginecología',
                              'dermatologia': 'Dermatología',
                              'neurologia': 'Neurología',
                              'psiquiatria': 'Psiquiatría',
                              'odontologia': 'Odontología',
                              'oftalmologia': 'Oftalmología',
                              'medicina-interna': 'Medicina Interna',
                              'cirugia-general': 'Cirugía General',
                              'anestesiologia': 'Anestesiología',
                              'radiologia': 'Radiología'
                            };
                            updateEspecialidad(especialidad.id, 'nombre', nombres[value as keyof typeof nombres] || '');
                          }}
                          disabled={!isEditing}
                          options={[
                            { value: 'clinica-medica', label: 'Clínica Médica' },
                            { value: 'cardiologia', label: 'Cardiología' },
                            { value: 'pediatria', label: 'Pediatría' },
                            { value: 'traumatologia', label: 'Traumatología' },
                            { value: 'ginecologia', label: 'Ginecología' },
                            { value: 'dermatologia', label: 'Dermatología' },
                            { value: 'neurologia', label: 'Neurología' },
                            { value: 'psiquiatria', label: 'Psiquiatría' },
                            { value: 'odontologia', label: 'Odontología' },
                            { value: 'oftalmologia', label: 'Oftalmología' },
                            { value: 'medicina-interna', label: 'Medicina Interna' },
                            { value: 'cirugia-general', label: 'Cirugía General' },
                            { value: 'anestesiologia', label: 'Anestesiología' },
                            { value: 'radiologia', label: 'Radiología' }
                          ]}
                          required
                        />
                        <MedicalInputField
                          label="Institución Certificadora"
                          value={especialidad.institucion}
                          onChange={(value) => updateEspecialidad(especialidad.id, 'institucion', value)}
                          disabled={!isEditing}
                          placeholder="Universidad o institución"
                          required
                        />
                        <MedicalInputField
                          label="Fecha de Certificación"
                          type="date"
                          value={especialidad.fechaCertificacion}
                          onChange={(value) => updateEspecialidad(especialidad.id, 'fechaCertificacion', value)}
                          disabled={!isEditing}
                          required
                        />
                      </MedicalFieldGroup>
                    </div>
                  ))}
                </div>
              </div>

              {/* Licencia Médica */}
              <MedicalFieldGroup>
                <MedicalInputField
                  label="Número de Licencia Médica"
                  value={formData.licencia}
                  onChange={(value) => handleInputChange('licencia', value)}
                  disabled={!isEditing}
                  required
                />
              </MedicalFieldGroup>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografía Profesional
              </label>
              <textarea
                value={formData.biografia}
                onChange={(e) => handleInputChange('biografia', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'
                }`}
                placeholder="Describe tu experiencia y especialización profesional"
              />
            </div>
          </MedicalFormSection>

          {/* Vista Previa de la Tarjeta de Perfil */}
          {!isEditing && (
            <MedicalFormSection
              title="Vista Previa del Perfil"
              description="Cómo aparece tu perfil en el sistema"
              icon={User}
              iconColor="text-gray-600"
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      Dr. {formData.nombres} {formData.apellidos}
                    </h3>
                    <div className="mt-2">
                      {formData.especialidades.length > 0 ? (
                        <div className="space-y-1">
                          {formData.especialidades.map((esp) => (
                            <p key={esp.id} className="text-blue-600 font-medium">
                              {esp.nombre}
                              {esp.institucion && (
                                <span className="text-sm text-gray-600 font-normal ml-2">
                                  - {esp.institucion}
                                </span>
                              )}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-600 font-medium">Sin especialidades registradas</p>
                      )}
                    </div>
                    <p className="text-gray-600 mt-3 text-sm">
                      {formData.biografia}
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{formData.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{formData.telefono}</span>
                      </div>
                    </div>
                    {formData.especialidades.length > 1 && (
                      <div className="mt-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {formData.especialidades.length} especialidades
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </MedicalFormSection>
          )}

        </MedicalFormContainer>
      </div>
    </div>
  );
}