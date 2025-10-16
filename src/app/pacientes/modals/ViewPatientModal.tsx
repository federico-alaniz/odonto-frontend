'use client';

import MedicalModal from '@/components/ui/MedicalModal';

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
}

interface ViewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export default function ViewPatientModal({ isOpen, onClose, patient }: ViewPatientModalProps) {
  if (!patient) return null;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'cc': 'Cédula de Ciudadanía',
      'ti': 'Tarjeta de Identidad',
      'ce': 'Cédula de Extranjería',
      'pasaporte': 'Pasaporte',
      'rc': 'Registro Civil'
    };
    return types[type] || type;
  };

  const getGenderLabel = (gender: string) => {
    const genders: { [key: string]: string } = {
      'masculino': 'Masculino ♂️',
      'femenino': 'Femenino ♀️',
      'otro': 'Otro'
    };
    return genders[gender] || gender;
  };

  const getStatusBadge = (estado: string) => {
    return estado === 'activo' 
      ? <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">🟢 Activo</span>
      : <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium">🔴 Inactivo</span>;
  };

  return (
    <MedicalModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Perfil de ${patient.nombres} ${patient.apellidos}`}
      icon="👤"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header del perfil */}
        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div>
            <h3 className="text-xl font-bold text-blue-900">
              {patient.nombres} {patient.apellidos}
            </h3>
            <p className="text-blue-700 mt-1">
              {calculateAge(patient.fechaNacimiento)} años • {getGenderLabel(patient.genero)}
            </p>
          </div>
          <div>
            {getStatusBadge(patient.estado)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center">
              <span className="mr-2">👤</span>
              Información Personal
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Documento:</span>
                <span className="text-slate-900">{getDocumentTypeLabel(patient.tipoDocumento)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Número:</span>
                <span className="text-slate-900">{patient.numeroDocumento}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Fecha Nacimiento:</span>
                <span className="text-slate-900">{formatDate(patient.fechaNacimiento)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Edad:</span>
                <span className="text-slate-900">{calculateAge(patient.fechaNacimiento)} años</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Estado Civil:</span>
                <span className="text-slate-900 capitalize">{patient.estadoCivil.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center">
              <span className="mr-2">📞</span>
              Contacto
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Teléfono:</span>
                <a 
                  href={`tel:${patient.telefono}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  📱 {patient.telefono}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Email:</span>
                <a 
                  href={`mailto:${patient.email}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  📧 {patient.email}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Ciudad:</span>
                <span className="text-slate-900">🏙️ {patient.ciudad}</span>
              </div>
            </div>
          </div>

          {/* Información Médica */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center">
              <span className="mr-2">🩺</span>
              Información Médica
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Tipo de Sangre:</span>
                <span className="text-slate-900 font-semibold text-red-600">🩸 {patient.tipoSangre}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Última Consulta:</span>
                <span className="text-slate-900">{formatDate(patient.ultimaConsulta)}</span>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800 flex items-center">
              <span className="mr-2">⚡</span>
              Acciones Rápidas
            </h4>
            
            <div className="space-y-3">
              <button className="w-full p-3 text-left rounded-lg border medical-border hover:border-green-300 hover:bg-green-50 transition-all focus-ring">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📅</span>
                  <div>
                    <div className="font-medium text-slate-800">Nueva Cita</div>
                    <div className="text-sm medical-text-secondary">Programar consulta</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left rounded-lg border medical-border hover:border-blue-300 hover:bg-blue-50 transition-all focus-ring">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✏️</span>
                  <div>
                    <div className="font-medium text-slate-800">Editar Información</div>
                    <div className="text-sm medical-text-secondary">Actualizar datos</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 text-left rounded-lg border medical-border hover:border-purple-300 hover:bg-purple-50 transition-all focus-ring">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📋</span>
                  <div>
                    <div className="font-medium text-slate-800">Ver Historial</div>
                    <div className="text-sm medical-text-secondary">Consultas anteriores</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Notas adicionales */}
        <div className="border-t medical-border pt-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">Información Importante</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Recuerda verificar los datos de contacto y información médica antes de cada consulta.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end border-t medical-border pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border medical-border rounded-lg text-slate-700 hover:bg-slate-50 transition-colors focus-ring"
          >
            Cerrar
          </button>
          <button className="medical-button-primary px-6 py-2 rounded-lg hover:shadow-md transition-all focus-ring">
            <span className="mr-2">✏️</span>
            Editar Paciente
          </button>
        </div>
      </div>
    </MedicalModal>
  );
}