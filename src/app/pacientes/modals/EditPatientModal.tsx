'use client';

import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Heart, Shield, Save, X } from 'lucide-react';
import MedicalModal from '@/components/ui/MedicalModal';
import MedicalInput from '@/components/forms/MedicalInput';
import MedicalSelect from '@/components/forms/MedicalSelect';
import MedicalTextarea from '@/components/forms/MedicalTextarea';
import { useToast } from '@/components/ui/ToastProvider';

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
  ultimaConsulta?: string;
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
  planObraSocial?: string;
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
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<Patient | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos del paciente cuando se abre el modal
  useEffect(() => {
    if (patient && isOpen) {
      setFormData({
        ...patient,
        // Asegurar que tengan valores por defecto
        tipoDocumento: patient.tipoDocumento || 'dni',
        genero: patient.genero || 'masculino',
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
        numeroPoliza: patient.numeroPoliza || '',
        planObraSocial: patient.planObraSocial || ''
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
      // Guardar en backend (lo maneja el padre)
      await Promise.resolve(onSave(formData));
      
      showSuccess(
        'Paciente actualizado exitosamente',
        'Los cambios se han guardado correctamente'
      );
      onClose();
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      showError(
        'Error al actualizar el paciente',
        'Por favor, verifique los datos e intente nuevamente'
      );
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
      title="Editar Información del Paciente"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Personal */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex-shrink-0">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  { value: 'dni', label: 'DNI (Documento Nacional de Identidad)' },
                  { value: 'le', label: 'LE (Libreta de Enrolamiento)' },
                  { value: 'lc', label: 'LC (Libreta Cívica)' },
                  { value: 'ci', label: 'CI (Cédula de Identidad)' },
                  { value: 'pasaporte', label: 'Pasaporte' },
                  { value: 'extranjero', label: 'Documento de Extranjero' }
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
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex-shrink-0">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
            <div className="flex-shrink-0">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información Médica</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex-shrink-0">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Contacto de Emergencia</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información de Seguro Médico</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <MedicalInput
                    label="Plan (obra social)"
                    value={formData.planObraSocial || ''}
                    onChange={handleFormChange('planObraSocial')}
                    placeholder="Ej: 210 / Premium / no indicado"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-4 pt-8">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            <X className="w-4 h-4 inline-block mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 inline-block mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </MedicalModal>
  );
}