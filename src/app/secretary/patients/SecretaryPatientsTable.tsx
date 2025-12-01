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
  Search,
  UserPlus,
  Clock,
  MapPin,
  AlertTriangle,
  FileText,
  UserCheck,
  X
} from 'lucide-react';
import { SecretaryPatientFilters } from './SecretaryPatientsFilters';
import { patientsService, Patient } from '@/services/api/patients.service';
import { useToast } from '@/components/ui/ToastProvider';

// Interface adaptada para secretaria
interface SecretaryPatient {
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
  proximaCita?: string;
  estado: 'activo' | 'inactivo' | 'pendiente' | 'seguimiento';
  fechaRegistro: string;
  requiereSeguimiento?: boolean;
  observaciones?: string;
  doctorAsignado?: string;
}

interface SecretaryPatientsTableProps {
  filters?: SecretaryPatientFilters;
  showOnlyAssigned?: boolean;
}

type SortField = keyof SecretaryPatient;
type SortOrder = 'asc' | 'desc';

export default function SecretaryPatientsTable({ filters, showOnlyAssigned = false }: SecretaryPatientsTableProps) {
  const router = useRouter();
  const { showSuccess, showError, showWarning } = useToast();
  const [patientsData, setPatientsData] = useState<SecretaryPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('fechaRegistro');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  // Modales
  const [viewModal, setViewModal] = useState<{ open: boolean; patient?: SecretaryPatient }>({ open: false });
  const [editModal, setEditModal] = useState<{ open: boolean; patient?: SecretaryPatient }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; patient?: SecretaryPatient }>({ open: false });
  const [appointmentModal, setAppointmentModal] = useState<{ open: boolean; patient?: SecretaryPatient }>({ open: false });
  const [assignDoctorModal, setAssignDoctorModal] = useState<{ open: boolean; patient?: SecretaryPatient }>({ open: false });
  
  // Estados para asignación de doctor
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  useEffect(() => {
    const loadPatientsData = async () => {
      try {
        setLoading(true);
        const clinicId = localStorage.getItem('clinicId') || 'clinic_001';
        
        const response = await patientsService.getPatients(clinicId, {
          page: currentPage,
          limit: itemsPerPage
        });
        
        // Transformar datos del backend al formato de la tabla
        const secretaryPatientsData: SecretaryPatient[] = response.data.map((patient: Patient) => ({
          id: patient.id,
          nombres: patient.nombres,
          apellidos: patient.apellidos,
          tipoDocumento: patient.tipoDocumento,
          numeroDocumento: patient.numeroDocumento,
          fechaNacimiento: patient.fechaNacimiento,
          genero: patient.genero,
          telefono: patient.telefono,
          email: patient.email || '',
          ciudad: patient.direccion?.ciudad || 'No especificada',
          tipoSangre: patient.tipoSangre || '',
          ultimaConsulta: undefined,
          proximaCita: undefined,
          estado: patient.estado as 'activo' | 'inactivo',
          fechaRegistro: patient.createdAt,
          requiereSeguimiento: false,
          observaciones: undefined,
          doctorAsignado: patient.doctorAsignado
        }));

        setPatientsData(secretaryPatientsData);
      } catch (error) {
        console.error('Error loading patients:', error);
        setPatientsData([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatientsData();
  }, [currentPage, itemsPerPage]);

  // Cargar doctores
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const clinicId = localStorage.getItem('clinicId') || 'clinic_001';
        const { usersService } = await import('@/services/api/users.service');
        const response = await usersService.getUsers(clinicId, { role: 'doctor' });
        if (response.success) {
          setDoctors(response.data);
        }
      } catch (error) {
        console.error('Error loading doctors:', error);
      }
    };
    loadDoctors();
  }, []);

  // Función para asignar doctor
  const handleAssignDoctor = async () => {
    if (!assignDoctorModal.patient || !selectedDoctorId) {
      showWarning('Selección requerida', 'Por favor seleccione un doctor');
      return;
    }

    try {
      const clinicId = localStorage.getItem('clinicId') || 'clinic_001';
      const userId = localStorage.getItem('userId') || 'system';
      
      const response = await patientsService.assignDoctor(
        assignDoctorModal.patient.id,
        selectedDoctorId,
        clinicId,
        userId
      );

      if (response.success) {
        setPatientsData(prev => prev.map(p =>
          p.id === assignDoctorModal.patient!.id
            ? { ...p, doctorAsignado: selectedDoctorId }
            : p
        ));
        setAssignDoctorModal({ open: false });
        setSelectedDoctorId('');
        showSuccess('Doctor asignado', 'El doctor se asignó exitosamente al paciente');
      }
    } catch (error: any) {
      console.error('Error asignando doctor:', error);
      showError('Error al asignar', error.message || 'Error al asignar doctor');
    }
  };

  // Función para desasignar doctor
  const handleUnassignDoctor = async (patientId: string) => {
    // TODO: Implementar modal de confirmación en lugar de confirm()

    try {
      const clinicId = localStorage.getItem('clinicId') || 'clinic_001';
      const userId = localStorage.getItem('userId') || 'system';
      
      const response = await patientsService.unassignDoctor(patientId, clinicId, userId);

      if (response.success) {
        setPatientsData(prev => prev.map(p =>
          p.id === patientId ? { ...p, doctorAsignado: undefined } : p
        ));
        showSuccess('Doctor desasignado', 'El doctor se desasignó exitosamente');
      }
    } catch (error: any) {
      console.error('Error desasignando doctor:', error);
      showError('Error al desasignar', error.message || 'Error al desasignar doctor');
    }
  };

  // Filtrado
  const filteredPatients = useMemo(() => {
    let patients = patientsData;

    // Filtro por pacientes asignados
    if (showOnlyAssigned) {
      patients = patients.filter(patient => patient.doctorAsignado);
    }

    if (!filters) return patients;

    return patients.filter(patient => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${patient.nombres} ${patient.apellidos} ${patient.numeroDocumento} ${patient.telefono} ${patient.email}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      if (filters.numeroDocumento && !patient.numeroDocumento.includes(filters.numeroDocumento)) return false;
      if (filters.genero && patient.genero !== filters.genero) return false;
      if (filters.tipoSangre && patient.tipoSangre !== filters.tipoSangre) return false;
      if (filters.ciudad && patient.ciudad !== filters.ciudad) return false;
      if (filters.estado && patient.estado !== filters.estado) return false;

      if (filters.edadMin || filters.edadMax) {
        const birthDate = new Date(patient.fechaNacimiento);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (filters.edadMin && age < parseInt(filters.edadMin)) return false;
        if (filters.edadMax && age > parseInt(filters.edadMax)) return false;
      }

      return true;
    });
  }, [patientsData, filters, showOnlyAssigned]);

  // Ordenado
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return sortOrder === 'asc' ? 1 : -1;
      if (valueB == null) return sortOrder === 'asc' ? -1 : 1;

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPatients, sortField, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = sortedPatients.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'activo':
        return { text: 'Activo', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'inactivo':
        return { text: 'Inactivo', color: 'bg-gray-100 text-gray-800 border-gray-200' };
      case 'pendiente':
        return { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'seguimiento':
        return { text: 'Seguimiento', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { text: estado, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewPatient = (patient: SecretaryPatient) => {
    router.push(`/secretary/patients/${patient.id}`);
  };

  const handleEditPatient = (patient: SecretaryPatient) => {
    setEditModal({ open: true, patient });
  };

  const handleDeletePatient = (patient: SecretaryPatient) => {
    setDeleteModal({ open: true, patient });
  };

  const handleNewAppointment = (patient: SecretaryPatient) => {
    router.push(`/secretary/appointments/new?patientId=${patient.id}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {showOnlyAssigned ? 'Pacientes Asignados' : 'Lista de Pacientes'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} encontrado{filteredPatients.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedPatients.length === currentPatients.length && currentPatients.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPatients(currentPatients.map(p => p.id));
                    } else {
                      setSelectedPatients([]);
                    }
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nombres')}
              >
                <div className="flex items-center space-x-1">
                  <span>Paciente</span>
                  {getSortIcon('nombres')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('numeroDocumento')}
              >
                <div className="flex items-center space-x-1">
                  <span>Documento</span>
                  {getSortIcon('numeroDocumento')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('fechaNacimiento')}
              >
                <div className="flex items-center space-x-1">
                  <span>Edad</span>
                  {getSortIcon('fechaNacimiento')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('estado')}
              >
                <div className="flex items-center space-x-1">
                  <span>Estado</span>
                  {getSortIcon('estado')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor Asignado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPatients.length > 0 ? (
              currentPatients.map((patient) => {
                const estadoConfig = getEstadoConfig(patient.estado);
                const age = calculateAge(patient.fechaNacimiento);
                
                return (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(patient.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPatients([...selectedPatients, patient.id]);
                          } else {
                            setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.nombres} {patient.apellidos}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>{patient.tipoDocumento}</span>
                            {patient.requiereSeguimiento && (
                              <div title="Requiere seguimiento">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {patient.numeroDocumento}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1 mb-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{patient.telefono}</span>
                        </div>
                        {patient.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{patient.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{age} años</div>
                        <div className="text-gray-500 flex items-center gap-1">
                          <Droplets className="w-4 h-4" />
                          {patient.tipoSangre || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoConfig.color}`}>
                        {estadoConfig.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {patient.doctorAsignado ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-900">
                              {doctors.find(d => d.id === patient.doctorAsignado)?.nombres || 'Doctor asignado'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleUnassignDoctor(patient.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Desasignar doctor"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAssignDoctorModal({ open: true, patient });
                            setSelectedDoctorId('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Asignar Doctor</span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver historial"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleNewAppointment(patient)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Nuevo turno"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeletePatient(patient)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Search className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No se encontraron pacientes
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {showOnlyAssigned 
                        ? 'No hay pacientes asignados a doctores'
                        : 'Intenta ajustar los filtros de búsqueda o agregar un nuevo paciente'
                      }
                    </p>
                    <button
                      onClick={() => router.push('/secretary/patients/new')}
                      className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Nuevo Paciente</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredPatients.length)} de {filteredPatients.length} pacientes
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Asignación de Doctor */}
      {assignDoctorModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Asignar Doctor
                </h3>
                <button
                  onClick={() => setAssignDoctorModal({ open: false })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Seleccione el doctor que desea asignar a{' '}
                  <span className="font-medium">
                    {assignDoctorModal.patient?.nombres} {assignDoctorModal.patient?.apellidos}
                  </span>
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccione un doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.nombres} {doctor.apellidos}
                      {doctor.especialidades && doctor.especialidades.length > 0 && 
                        ` - ${doctor.especialidades[0]}`
                      }
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setAssignDoctorModal({ open: false })}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignDoctor}
                  disabled={!selectedDoctorId}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Asignar Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
