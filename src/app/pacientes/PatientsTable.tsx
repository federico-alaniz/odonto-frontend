'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Droplets
} from 'lucide-react';
import ViewPatientModal from './modals/ViewPatientModal';
import NewAppointmentModal from './modals/NewAppointmentModal';
import DeletePatientModal from './modals/DeletePatientModal';
import EditPatientModal from './modals/EditPatientModal';
import { PatientFilters } from './PatientsFilters';

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
  ultimaConsulta: string;
  estado: 'activo' | 'inactivo';
}

interface PatientsTableProps {
  filters?: PatientFilters;
}

// Datos de muestra
const samplePatients: Patient[] = [
  {
    id: 'pat_001',
    nombres: 'María Elena',
    apellidos: 'González',
    tipoDocumento: 'dni',
    numeroDocumento: '12345678',
    fechaNacimiento: '1978-03-15',
    genero: 'femenino',
    telefono: '3001234567',
    email: 'maria.gonzalez@email.com',
    ciudad: 'Buenos Aires',
    tipoSangre: 'O+',
    ultimaConsulta: '2025-10-14',
    estado: 'activo'
  },
  {
    id: 'pat_002',
    nombres: 'Juan Carlos',
    apellidos: 'Rodríguez',
    tipoDocumento: 'dni',
    numeroDocumento: '23456789',
    fechaNacimiento: '1985-07-22',
    genero: 'masculino',
    telefono: '3009876543',
    email: 'juan.rodriguez@email.com',
    ciudad: 'Córdoba',
    tipoSangre: 'A+',
    ultimaConsulta: '2025-10-09',
    estado: 'activo'
  },
  {
    id: 'pat_003',
    nombres: 'Ana Sofía',
    apellidos: 'Martínez',
    tipoDocumento: 'dni',
    numeroDocumento: '34567890',
    fechaNacimiento: '1990-12-05',
    genero: 'femenino',
    telefono: '3005555555',
    email: 'ana.martinez@email.com',
    ciudad: 'Rosario',
    tipoSangre: 'B+',
    ultimaConsulta: '2025-10-11',
    estado: 'activo'
  },
  {
    id: 'pat_004',
    nombres: 'Carlos Eduardo',
    apellidos: 'Vargas',
    tipoDocumento: 'dni',
    numeroDocumento: '45678901',
    fechaNacimiento: '1975-09-12',
    genero: 'masculino',
    telefono: '3003333333',
    email: 'carlos.vargas@email.com',
    ciudad: 'Mendoza',
    tipoSangre: 'AB+',
    ultimaConsulta: '2025-10-13',
    estado: 'activo'
  },
  {
    id: 'pat_005',
    nombres: 'Isabella',
    apellidos: 'Ramírez',
    tipoDocumento: 'dni',
    numeroDocumento: '56789012',
    fechaNacimiento: '2015-04-18',
    genero: 'femenino',
    telefono: '3006666666',
    email: 'isabella.ramirez@email.com',
    ciudad: 'La Plata',
    tipoSangre: 'O-',
    ultimaConsulta: '2025-10-10',
    estado: 'activo'
  },
  {
    id: 'pat_006',
    nombres: 'Roberto',
    apellidos: 'García',
    tipoDocumento: 'dni',
    numeroDocumento: '67890123',
    fechaNacimiento: '1988-09-12',
    genero: 'masculino',
    telefono: '3007777777',
    email: 'roberto.garcia@email.com',
    ciudad: 'San Miguel de Tucumán',
    tipoSangre: 'A-',
    ultimaConsulta: '2025-10-12',
    estado: 'activo'
  },
  {
    id: 'pat_007',
    nombres: 'Daniela',
    apellidos: 'Torres',
    tipoDocumento: 'dni',
    numeroDocumento: '78901234',
    fechaNacimiento: '1992-08-25',
    genero: 'femenino',
    telefono: '3001010101',
    email: 'daniela.torres@email.com',
    ciudad: 'Medellín',
    tipoSangre: 'B-',
    ultimaConsulta: '2025-10-15',
    estado: 'activo'
  }
];

export default function PatientsTable({ filters }: PatientsTableProps) {
  const [sortField, setSortField] = useState<keyof Patient>('apellidos');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados para los modales
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  // Lista de pacientes (actualizable)
  const [patients, setPatients] = useState<Patient[]>(samplePatients);

  // Funciones para manejar acciones
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const handleNewAppointment = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowAppointmentModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = (patientId: string) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
  };

  const handleSaveEdit = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => 
      p.id === updatedPatient.id ? updatedPatient : p
    ));
  };

  const handleViewHistoryFromModal = (patient: Patient) => {
    // Navegar a la página de historiales filtrada por paciente
    router.push(`/historiales?patientId=${encodeURIComponent(patient.id)}`);
  };

  const handleEditPatientFromModal = () => {
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleNewAppointmentFromModal = () => {
    setShowViewModal(false);
    setShowAppointmentModal(true);
  };

  const closeModals = () => {
    setSelectedPatient(null);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowAppointmentModal(false);
    setShowDeleteModal(false);
  };

  // Calcular edad
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

  // Filtrar y ordenar pacientes
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = [...patients];

    // Aplicar filtros
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(patient =>
          patient.nombres.toLowerCase().includes(searchLower) ||
          patient.apellidos.toLowerCase().includes(searchLower) ||
          patient.numeroDocumento.includes(searchLower) ||
          patient.email.toLowerCase().includes(searchLower)
        );
      }

      if (filters.numeroDocumento) {
        filtered = filtered.filter(patient => 
          patient.numeroDocumento.includes(filters.numeroDocumento)
        );
      }

      if (filters.genero) {
        filtered = filtered.filter(patient => patient.genero === filters.genero);
      }

      if (filters.ciudad) {
        const cityLower = filters.ciudad.toLowerCase();
        filtered = filtered.filter(patient => patient.ciudad.toLowerCase().includes(cityLower));
      }

      if (filters.tipoSangre) {
        filtered = filtered.filter(patient => patient.tipoSangre === filters.tipoSangre);
      }

      if (filters.edadMin) {
        const minAge = parseInt(filters.edadMin);
        filtered = filtered.filter(patient => calculateAge(patient.fechaNacimiento) >= minAge);
      }

      if (filters.edadMax) {
        const maxAge = parseInt(filters.edadMax);
        filtered = filtered.filter(patient => calculateAge(patient.fechaNacimiento) <= maxAge);
      }
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] as string | number;
      let bValue: string | number = b[sortField] as string | number;

      // Manejar fechas
      if (sortField === 'fechaNacimiento' || sortField === 'ultimaConsulta') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [patients, filters, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredAndSortedPatients.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof Patient) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Patient) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 text-blue-600" /> : 
      <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (estado: string) => {
    return estado === 'activo' 
      ? (
          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            <span>Activo</span>
          </span>
        )
      : (
          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            <span>Inactivo</span>
          </span>
        );
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'cc': 'CC',
      'ti': 'TI',
      'ce': 'CE',
      'pasaporte': 'PAS',
      'rc': 'RC'
    };
    return types[type] || type;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header de la tabla */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pacientes Registrados
              </h2>
              <p className="text-sm text-gray-600">
                Total: {filteredAndSortedPatients.length} paciente(s) encontrado(s)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('apellidos')}
              >
                <div className="flex items-center space-x-2">
                  <span>Paciente</span>
                  {getSortIcon('apellidos')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('numeroDocumento')}
              >
                <div className="flex items-center space-x-2">
                  <span>Documento</span>
                  {getSortIcon('numeroDocumento')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Información
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('ultimaConsulta')}
              >
                <div className="flex items-center space-x-2">
                  <span>Última Consulta</span>
                  {getSortIcon('ultimaConsulta')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {patient.nombres} {patient.apellidos}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{patient.genero === 'masculino' ? 'Masculino' : 'Femenino'}</span>
                      <span>•</span>
                      <MapPin className="w-3 h-3" />
                      <span>{patient.ciudad}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getDocumentTypeLabel(patient.tipoDocumento)} {patient.numeroDocumento}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {calculateAge(patient.fechaNacimiento)} años
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDate(patient.fechaNacimiento)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2 text-sm text-gray-900 mb-1">
                    <Phone className="w-3 h-3" />
                    <span>{patient.telefono}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span>{patient.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2 text-sm text-gray-900 mb-1">
                    <Droplets className="w-3 h-3 text-red-500" />
                    <span>{patient.tipoSangre}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{patient.ciudad}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(patient.ultimaConsulta)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(patient.estado)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewPatient(patient)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                      title="Ver perfil completo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditPatient(patient)}
                      className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" 
                      title="Editar información"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleNewAppointment(patient)}
                      className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2" 
                      title="Programar nueva cita"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePatient(patient)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
                      title="Eliminar paciente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredAndSortedPatients.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron pacientes</h3>
          <p className="medical-text-secondary">
            Intenta modificar los filtros de búsqueda o{' '}
            <a href="/pacientes/nuevo" className="text-blue-600 hover:text-blue-700 font-medium">
              registra un nuevo paciente
            </a>
          </p>
        </div>
      )}

      {/* Modales */}
      <ViewPatientModal
        isOpen={showViewModal}
        onClose={closeModals}
        patient={selectedPatient}
        onEditPatient={handleEditPatientFromModal}
        onNewAppointment={handleNewAppointmentFromModal}
        onViewHistory={handleViewHistoryFromModal}
      />

      <EditPatientModal
        isOpen={showEditModal}
        onClose={closeModals}
        patient={selectedPatient}
        onSave={handleSaveEdit}
      />

      <NewAppointmentModal
        isOpen={showAppointmentModal}
        onClose={closeModals}
        patient={selectedPatient}
      />

      <DeletePatientModal
        isOpen={showDeleteModal}
        onClose={closeModals}
        patient={selectedPatient}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}