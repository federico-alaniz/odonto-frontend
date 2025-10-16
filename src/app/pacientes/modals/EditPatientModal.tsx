'use client';

import { useState, useEffect } from 'react';
import MedicalModal from '@/components/ui/MedicalModal';
import MedicalInput from '@/components/forms/MedicalInput';
import MedicalSelect from '@/components/forms/MedicalSelect';
import MedicalTextarea from '@/components/forms/MedicalTextarea';

interface Patient {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  ciudad: string;
  tipoSangre: string;
  estadoCivil: string;
  ultimaConsulta: string;
  estado: 'activo' | 'inactivo';
  // Campos adicionales opcionales para edición
  direccion?: string;
  departamento?: string;
  alergias?: string;
  medicamentos?: string;
  enfermedades?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaParentesco?: string;
  contactoEmergenciaTelefono?: string;
  tieneSeguro?: string;
  nombreSeguro?: string;
  numeroPoliza?: string;
}

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (updatedPatient: Patient) => void;
}

interface FormErrors {
  [key: string]: string;
}

export default function EditPatientModal({ isOpen, onClose, patient, onSave }: EditPatientModalProps) {
  const [formData, setFormData] = useState<Patient | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos del paciente cuando se abre el modal
  useEffect(() => {
    if (patient && isOpen) {
      setFormData({
        ...patient,
        // Asegurar que tengan valores por defecto
        tipoDocumento: patient.tipoDocumento || 'cedula',
        genero: patient.genero || 'masculino',
        estadoCivil: patient.estadoCivil || 'soltero',
        direccion: patient.direccion || '',
        departamento: patient.departamento || 'Cundinamarca',
        tipoSangre: patient.tipoSangre || 'O+',
        alergias: patient.alergias || '',
        medicamentos: patient.medicamentos || '',
        enfermedades: patient.enfermedades || '',
        contactoEmergenciaNombre: patient.contactoEmergenciaNombre || '',
        contactoEmergenciaParentesco: patient.contactoEmergenciaParentesco || 'familiar',
        contactoEmergenciaTelefono: patient.contactoEmergenciaTelefono || '',
        tieneSeguro: patient.tieneSeguro || 'no',
        nombreSeguro: patient.nombreSeguro || '',
        numeroPoliza: patient.numeroPoliza || ''
      });
      setErrors({});
    }
  }, [patient, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Limpiar error del campo cuando se edita
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    handleInputChange(field, e.target.value);
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    
    const newErrors: FormErrors = {};

    // Validaciones básicas
    if (!formData.nombres.trim()) newErrors.nombres = 'Los nombres son requeridos';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos';
    if (!formData.numeroDocumento.trim()) newErrors.numeroDocumento = 'El documento es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validación de teléfono
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (formData.telefono && !phoneRegex.test(formData.telefono)) {
      newErrors.telefono = 'El formato del teléfono no es válido';
    }

    // Validación de fecha de nacimiento
    if (formData.fechaNacimiento) {
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      
      if (birthDate > today) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura';
      } else {
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age > 120) {
          newErrors.fechaNacimiento = 'La edad no puede ser mayor a 120 años';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Llamar al callback con los datos actualizados
      onSave(formData);
      
      alert('✅ Paciente actualizado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      alert('❌ Error al actualizar el paciente. Intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      setErrors({});
    }
  };

  if (!formData) return null;

  return (
    <MedicalModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Paciente"
      icon="✏️"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Personal */}
        <div className="medical-section">
          <div className="medical-section-header">
            <span className="medical-section-icon">👤</span>
            <h3 className="medical-section-title">Información Personal</h3>
          </div>
          <div className="medical-section-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MedicalInput
                label="Nombres"
                value={formData.nombres}
                onChange={handleFormChange('nombres')}
                error={errors.nombres}
                required
              />
              <MedicalInput
                label="Apellidos"
                value={formData.apellidos}
                onChange={handleFormChange('apellidos')}
                error={errors.apellidos}
                required
              />
              <MedicalSelect
                label="Tipo de Documento"
                value={formData.tipoDocumento || ''}
                onChange={handleFormChange('tipoDocumento')}
                options={[
                  { value: 'cedula', label: 'Cédula de Ciudadanía' },
                  { value: 'cedula_extranjeria', label: 'Cédula de Extranjería' },
                  { value: 'pasaporte', label: 'Pasaporte' },
                  { value: 'tarjeta_identidad', label: 'Tarjeta de Identidad' }
                ]}
                required
              />
              <MedicalInput
                label="Número de Documento"
                value={formData.numeroDocumento}
                onChange={handleFormChange('numeroDocumento')}
                error={errors.numeroDocumento}
                required
              />
              <MedicalInput
                label="Fecha de Nacimiento"
                value={formData.fechaNacimiento}
                onChange={handleFormChange('fechaNacimiento')}
                type="date"
                error={errors.fechaNacimiento}
                required
              />
              <MedicalSelect
                label="Género"
                value={formData.genero || ''}
                onChange={handleFormChange('genero')}
                options={[
                  { value: 'masculino', label: 'Masculino' },
                  { value: 'femenino', label: 'Femenino' },
                  { value: 'otro', label: 'Otro' }
                ]}
                required
              />
              <MedicalSelect
                label="Estado Civil"
                value={formData.estadoCivil || ''}
                onChange={handleFormChange('estadoCivil')}
                options={[
                  { value: 'soltero', label: 'Soltero/a' },
                  { value: 'casado', label: 'Casado/a' },
                  { value: 'union_libre', label: 'Unión Libre' },
                  { value: 'divorciado', label: 'Divorciado/a' },
                  { value: 'viudo', label: 'Viudo/a' }
                ]}
                required
              />
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="medical-section">
          <div className="medical-section-header">
            <span className="medical-section-icon">📞</span>
            <h3 className="medical-section-title">Información de Contacto</h3>
          </div>
          <div className="medical-section-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MedicalInput
                label="Teléfono"
                value={formData.telefono}
                onChange={handleFormChange('telefono')}
                error={errors.telefono}
                placeholder="Ej: +57 300 123 4567"
                required
              />
              <MedicalInput
                label="Email"
                value={formData.email}
                onChange={handleFormChange('email')}
                type="email"
                error={errors.email}
                placeholder="ejemplo@correo.com"
                required
              />
              <div className="md:col-span-2">
                <MedicalInput
                  label="Dirección"
                  value={formData.direccion || ''}
                  onChange={handleFormChange('direccion')}
                  placeholder="Calle, carrera, número, barrio"
                />
              </div>
              <MedicalInput
                label="Ciudad"
                value={formData.ciudad}
                onChange={handleFormChange('ciudad')}
                error={errors.ciudad}
                required
              />
              <MedicalSelect
                label="Departamento"
                value={formData.departamento || ''}
                onChange={handleFormChange('departamento')}
                options={[
                  { value: 'Amazonas', label: 'Amazonas' },
                  { value: 'Antioquia', label: 'Antioquia' },
                  { value: 'Arauca', label: 'Arauca' },
                  { value: 'Atlántico', label: 'Atlántico' },
                  { value: 'Bolívar', label: 'Bolívar' },
                  { value: 'Boyacá', label: 'Boyacá' },
                  { value: 'Caldas', label: 'Caldas' },
                  { value: 'Caquetá', label: 'Caquetá' },
                  { value: 'Casanare', label: 'Casanare' },
                  { value: 'Cauca', label: 'Cauca' },
                  { value: 'Cesar', label: 'Cesar' },
                  { value: 'Chocó', label: 'Chocó' },
                  { value: 'Córdoba', label: 'Córdoba' },
                  { value: 'Cundinamarca', label: 'Cundinamarca' },
                  { value: 'Guainía', label: 'Guainía' },
                  { value: 'Guaviare', label: 'Guaviare' },
                  { value: 'Huila', label: 'Huila' },
                  { value: 'La Guajira', label: 'La Guajira' },
                  { value: 'Magdalena', label: 'Magdalena' },
                  { value: 'Meta', label: 'Meta' },
                  { value: 'Nariño', label: 'Nariño' },
                  { value: 'Norte de Santander', label: 'Norte de Santander' },
                  { value: 'Putumayo', label: 'Putumayo' },
                  { value: 'Quindío', label: 'Quindío' },
                  { value: 'Risaralda', label: 'Risaralda' },
                  { value: 'San Andrés y Providencia', label: 'San Andrés y Providencia' },
                  { value: 'Santander', label: 'Santander' },
                  { value: 'Sucre', label: 'Sucre' },
                  { value: 'Tolima', label: 'Tolima' },
                  { value: 'Valle del Cauca', label: 'Valle del Cauca' },
                  { value: 'Vaupés', label: 'Vaupés' },
                  { value: 'Vichada', label: 'Vichada' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Información Médica */}
        <div className="medical-section">
          <div className="medical-section-header">
            <span className="medical-section-icon">🩺</span>
            <h3 className="medical-section-title">Información Médica</h3>
          </div>
          <div className="medical-section-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MedicalSelect
                label="Tipo de Sangre"
                value={formData.tipoSangre || ''}
                onChange={handleFormChange('tipoSangre')}
                options={[
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' }
                ]}
              />
              <div></div>
              <div className="md:col-span-2">
                <MedicalTextarea
                  label="Alergias Conocidas"
                  value={formData.alergias || ''}
                  onChange={handleFormChange('alergias')}
                  placeholder="Describe cualquier alergia conocida del paciente"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <MedicalTextarea
                  label="Medicamentos Actuales"
                  value={formData.medicamentos || ''}
                  onChange={handleFormChange('medicamentos')}
                  placeholder="Lista los medicamentos que toma actualmente"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <MedicalTextarea
                  label="Enfermedades Preexistentes"
                  value={formData.enfermedades || ''}
                  onChange={handleFormChange('enfermedades')}
                  placeholder="Historial de enfermedades o condiciones médicas"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="medical-section">
          <div className="medical-section-header">
            <span className="medical-section-icon">🚨</span>
            <h3 className="medical-section-title">Contacto de Emergencia</h3>
          </div>
          <div className="medical-section-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MedicalInput
                label="Nombre Completo"
                value={formData.contactoEmergenciaNombre || ''}
                onChange={handleFormChange('contactoEmergenciaNombre')}
                placeholder="Nombre del contacto de emergencia"
              />
              <MedicalSelect
                label="Parentesco"
                value={formData.contactoEmergenciaParentesco || ''}
                onChange={handleFormChange('contactoEmergenciaParentesco')}
                options={[
                  { value: 'madre', label: 'Madre' },
                  { value: 'padre', label: 'Padre' },
                  { value: 'hijo', label: 'Hijo/a' },
                  { value: 'hermano', label: 'Hermano/a' },
                  { value: 'conyugue', label: 'Cónyuge' },
                  { value: 'familiar', label: 'Otro Familiar' },
                  { value: 'amigo', label: 'Amigo/a' },
                  { value: 'otro', label: 'Otro' }
                ]}
              />
              <MedicalInput
                label="Teléfono de Emergencia"
                value={formData.contactoEmergenciaTelefono || ''}
                onChange={handleFormChange('contactoEmergenciaTelefono')}
                placeholder="Número de contacto de emergencia"
              />
            </div>
          </div>
        </div>

        {/* Información de Seguro */}
        <div className="medical-section">
          <div className="medical-section-header">
            <span className="medical-section-icon">🛡️</span>
            <h3 className="medical-section-title">Información de Seguro Médico</h3>
          </div>
          <div className="medical-section-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MedicalSelect
                label="¿Tiene Seguro Médico?"
                value={formData.tieneSeguro || ''}
                onChange={handleFormChange('tieneSeguro')}
                options={[
                  { value: 'si', label: 'Sí' },
                  { value: 'no', label: 'No' }
                ]}
              />
              {formData.tieneSeguro === 'si' && (
                <>
                  <MedicalInput
                    label="Nombre del Seguro"
                    value={formData.nombreSeguro || ''}
                    onChange={handleFormChange('nombreSeguro')}
                    placeholder="EPS, Medicina Prepagada, etc."
                  />
                  <MedicalInput
                    label="Número de Póliza"
                    value={formData.numeroPoliza || ''}
                    onChange={handleFormChange('numeroPoliza')}
                    placeholder="Número de afiliación o póliza"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t medical-border">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="medical-button-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="medical-button-primary"
          >
            {isSaving ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Guardando...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </MedicalModal>
  );
}