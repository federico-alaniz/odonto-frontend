'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Droplets,
  Search
} from 'lucide-react';
import ViewPatientModal from './modals/ViewPatientModal';
import NewAppointmentModal from './modals/NewAppointmentModal';
import DeletePatientModal from './modals/DeletePatientModal';
import EditPatientModal from './modals/EditPatientModal';
import { PatientFilters } from './PatientsFilters';
import { patientsService } from '@/services/api/patients.service';
import { useAuth } from '@/hooks/useAuth';

// Interface adaptada para el componente (compatible con modales existentes)
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

interface PatientsTableProps {
  filters?: PatientFilters;
}

// TODO: Función para adaptar datos del backend al formato de la tabla
const adaptPatientsForTable = (backendPatients: any[]): Patient[] => {
  return backendPatients.map(patient => ({
    ...patient,
    ciudad: patient.direccion?.ciudad || ''
  }));
};

export default function PatientsTable({ filters }: PatientsTableProps) {
  const { currentUser } = useAuth();
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

  // Lista de pacientes
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;

  // Cargar pacientes desde el backend
  useEffect(() => {
    const loadPatients = async () => {
      if (!clinicId) return;
      
      setIsLoading(true);
      try {
        const response = await patientsService.getPatients(clinicId, {
          page: 1,
          limit: 1000 // Cargar todos los pacientes
        });
        
        if (response.success && response.data) {
          setPatientsData(adaptPatientsForTable(response.data));
        }
      } catch (error) {
        console.error('Error cargando pacientes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, [clinicId]);

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
    setPatientsData(prev => prev.filter(p => p.id !== patientId));
  };

  const handleSaveEdit = (updatedPatient: Patient) => {
    setPatientsData(prev => prev.map(p => 
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
    let filtered = [...patientsData];

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
  }, [patientsData, filters, sortField, sortDirection]);

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
      'dni': 'DNI',
      'le': 'LE',
      'lc': 'LC',
      'ci': 'CI',
      'cc': 'CC',
      'ti': 'TI',
      'ce': 'CE',
      'pasaporte': 'PAS',
      'extranjero': 'EXT',
      'rc': 'RC'
    };
    return types[type] || type.toUpperCase();
  };

  // Recargar pacientes cuando se crea uno nuevo
  useEffect(() => {
    const onPatientsUpdated = async () => {
      if (!clinicId) return;
      
      try {
        const response = await patientsService.getPatients(clinicId, {
          page: 1,
          limit: 1000
        });
        
        if (response.success && response.data) {
          setPatientsData(adaptPatientsForTable(response.data));
        }
      } catch (error) {
        console.error('Error recargando pacientes:', error);
      }
    };

    // Suscribirse al evento del window
    if (typeof window !== 'undefined') {
      window.addEventListener('patients:updated', onPatientsUpdated as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('patients:updated', onPatientsUpdated as EventListener);
      }
    };
  }, [clinicId]);

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
      <div className="overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="w-1/4 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('apellidos')}
              >
                <div className="flex items-center space-x-2">
                  <span>Paciente</span>
                  {getSortIcon('apellidos')}
                </div>
              </th>
              <th 
                className="w-1/6 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('numeroDocumento')}
              >
                <div className="flex items-center space-x-2">
                  <span>Documento</span>
                  {getSortIcon('numeroDocumento')}
                </div>
              </th>
              <th className="w-1/8 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Edad
              </th>
              <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Contacto
              </th>
              <th 
                className="w-1/8 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('ultimaConsulta')}
              >
                <div className="flex items-center space-x-2">
                  <span>Últ. Consulta</span>
                  {getSortIcon('ultimaConsulta')}
                </div>
              </th>
              <th className="w-1/12 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="w-1/8 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="truncate">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {patient.nombres} {patient.apellidos}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{patient.genero === 'masculino' ? 'M' : 'F'} • {patient.ciudad}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900 truncate">
                    <div className="font-medium">{patient.numeroDocumento}</div>
                    <div className="text-xs text-gray-700">{getDocumentTypeLabel(patient.tipoDocumento).slice(0, 10)}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{calculateAge(patient.fechaNacimiento)}</div>
                    <div className="text-xs text-gray-700">años</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="truncate">
                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{patient.telefono}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-700">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{patient.ultimaConsulta ? formatDate(patient.ultimaConsulta) : 'Sin consultas'}</div>
                    <div className="flex items-center space-x-1 text-xs text-gray-700">
                      <Droplets className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <span>{patient.tipoSangre}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(patient.estado)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleViewPatient(patient)}
                      className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                      title="Ver perfil completo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditPatient(patient)}
                      className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" 
                      title="Editar información"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleNewAppointment(patient)}
                      className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                      title="Programar nueva cita"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePatient(patient)}
                      className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
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
          <div className="flex justify-center mb-4">
            <Search className="w-16 h-16 text-gray-400" />
          </div>
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