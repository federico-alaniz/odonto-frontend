'use client';

import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit3, 
  ClipboardList, 
  Droplets, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  CreditCard,
  Cake
} from 'lucide-react';
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
  ultimaConsulta?: string; // Opcional para compatibilidad
  estado: 'activo' | 'inactivo';
}

interface ViewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onEditPatient?: (patient: Patient) => void;
  onNewAppointment?: (patient: Patient) => void;
  onViewHistory?: (patient: Patient) => void;
}

export default function ViewPatientModal({ 
  isOpen, 
  onClose, 
  patient, 
  onEditPatient,
  onNewAppointment,
  onViewHistory 
}: ViewPatientModalProps) {
  if (!patient) return null;

  const handleNewAppointment = () => {
    onNewAppointment?.(patient);
  };

  const handleEditPatient = () => {
    onEditPatient?.(patient);
  };

  const handleViewHistory = () => {
    onViewHistory?.(patient);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'dni': 'DNI (Documento Nacional de Identidad)',
      'le': 'LE (Libreta de Enrolamiento)',
      'lc': 'LC (Libreta Cívica)',
      'ci': 'CI (Cédula de Identidad)',
      'cc': 'Cédula de Ciudadanía',
      'ti': 'Tarjeta de Identidad',
      'ce': 'Cédula de Extranjería',
      'pasaporte': 'Pasaporte',
      'extranjero': 'Documento de Extranjero',
      'rc': 'Registro Civil'
    };
    return types[type] || type.toUpperCase();
  };

  const getGenderLabel = (gender: string) => {
    const genders: { [key: string]: string } = {
      'masculino': 'Masculino',
      'femenino': 'Femenino',
      'otro': 'Otro'
    };
    return genders[gender] || gender;
  };

  const getStatusBadge = (estado: string) => {
    return estado === 'activo' 
      ? (
          <span className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            <span>Activo</span>
          </span>
        )
      : (
          <span className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" />
            <span>Inactivo</span>
          </span>
        );
  };

  return (
    <MedicalModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Perfil de ${patient.nombres} ${patient.apellidos}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header del perfil */}
        <div className="bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white shadow-sm rounded-xl border border-blue-200">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {patient.nombres} {patient.apellidos}
                </h3>
                <p className="text-blue-700 mt-1 font-medium">
                  {calculateAge(patient.fechaNacimiento)} años • {getGenderLabel(patient.genero)}
                </p>
              </div>
            </div>
            <div>
              {getStatusBadge(patient.estado)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">
                Información Personal
              </h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Documento:</span>
                <span className="text-gray-900 font-medium">{getDocumentTypeLabel(patient.tipoDocumento)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Número:</span>
                <span className="text-gray-900 font-medium">{patient.numeroDocumento}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Cake className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-600">Fecha Nacimiento:</span>
                </div>
                <span className="text-gray-900">{formatDate(patient.fechaNacimiento)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-gray-600">Edad:</span>
                <span className="text-gray-900 font-semibold">{calculateAge(patient.fechaNacimiento)} años</span>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white shadow-sm rounded-lg border border-green-200">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-emerald-800">
                Contacto
              </h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-600">Teléfono:</span>
                </div>
                <a 
                  href={`tel:${patient.telefono}`}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {patient.telefono}
                </a>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-600">Email:</span>
                </div>
                <a 
                  href={`mailto:${patient.email}`}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {patient.email}
                </a>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-600">Ciudad:</span>
                </div>
                <span className="text-gray-900">{patient.ciudad}</span>
              </div>
            </div>
          </div>

          {/* Información Médica */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white shadow-sm rounded-lg border border-red-200">
                <Droplets className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-red-800">
                Información Médica
              </h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-gray-600">Tipo de Sangre:</span>
                </div>
                <span className="text-red-600 font-semibold">{patient.tipoSangre}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-600">Última Consulta:</span>
                </div>
                <span className="text-gray-900">{patient.ultimaConsulta ? formatDate(patient.ultimaConsulta) : 'Sin consultas previas'}</span>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl shadow-sm border border-purple-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white shadow-sm rounded-lg border border-purple-200">
                <ClipboardList className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-purple-800">
                Acciones Rápidas
              </h4>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={handleNewAppointment}
                className="w-full p-4 text-left rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-300 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white shadow-sm rounded-lg border border-emerald-200">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-medium text-emerald-800">Nueva Cita</div>
                    <div className="text-sm text-emerald-600">Programar consulta</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={handleEditPatient}
                className="w-full p-4 text-left rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white shadow-sm rounded-lg border border-blue-200">
                    <Edit3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-800">Editar Información</div>
                    <div className="text-sm text-blue-600">Actualizar datos</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={handleViewHistory}
                className="w-full p-4 text-left rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 hover:border-purple-300 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white shadow-sm rounded-lg border border-purple-200">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-purple-800">Ver Historial</div>
                    <div className="text-sm text-purple-600">Consultas anteriores</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Notas adicionales */}
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
          <div className="flex items-start space-x-3">
            <div className="p-1">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">Información Importante</p>
              <p className="text-sm text-amber-700 mt-1">
                Recuerda verificar los datos de contacto y información médica antes de cada consulta.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-200 pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cerrar
          </button>
          <button 
            onClick={handleEditPatient}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Paciente</span>
          </button>
        </div>
      </div>
    </MedicalModal>
  );
}