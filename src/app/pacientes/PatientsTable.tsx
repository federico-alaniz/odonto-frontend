'use client';

import { useState, useMemo } from 'react';
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
  estadoCivil: string;
  ultimaConsulta: string;
  estado: 'activo' | 'inactivo';
}

interface PatientsTableProps {
  filters?: PatientFilters;
}

// Datos de muestra
const samplePatients: Patient[] = [
  {
    id: '1',
    nombres: 'María Elena',
    apellidos: 'González Rodríguez',
    tipoDocumento: 'cc',
    numeroDocumento: '12345678',
    fechaNacimiento: '1985-03-15',
    genero: 'femenino',
    telefono: '3001234567',
    email: 'maria.gonzalez@email.com',
    ciudad: 'Bogotá',
    tipoSangre: 'O+',
    estadoCivil: 'casado',
    ultimaConsulta: '2024-10-10',
    estado: 'activo'
  },
  {
    id: '2',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez López',
    tipoDocumento: 'cc',
    numeroDocumento: '87654321',
    fechaNacimiento: '1992-07-22',
    genero: 'masculino',
    telefono: '3109876543',
    email: 'juan.perez@email.com',
    ciudad: 'Medellín',
    tipoSangre: 'A+',
    estadoCivil: 'soltero',
    ultimaConsulta: '2024-10-12',
    estado: 'activo'
  },
  {
    id: '3',
    nombres: 'Ana Sofía',
    apellidos: 'Martínez Silva',
    tipoDocumento: 'cc',
    numeroDocumento: '45678912',
    fechaNacimiento: '1978-12-08',
    genero: 'femenino',
    telefono: '3201357924',
    email: 'ana.martinez@email.com',
    ciudad: 'Cali',
    tipoSangre: 'B-',
    estadoCivil: 'divorciado',
    ultimaConsulta: '2024-09-28',
    estado: 'activo'
  },
  {
    id: '4',
    nombres: 'Carlos Alberto',
    apellidos: 'Ramírez Torres',
    tipoDocumento: 'cc',
    numeroDocumento: '78912345',
    fechaNacimiento: '1990-05-18',
    genero: 'masculino',
    telefono: '3158024613',
    email: 'carlos.ramirez@email.com',
    ciudad: 'Barranquilla',
    tipoSangre: 'AB+',
    estadoCivil: 'union_libre',
    ultimaConsulta: '2024-10-08',
    estado: 'activo'
  },
  {
    id: '5',
    nombres: 'Patricia',
    apellidos: 'Hernández Moreno',
    tipoDocumento: 'cc',
    numeroDocumento: '65432178',
    fechaNacimiento: '1973-11-30',
    genero: 'femenino',
    telefono: '3007531468',
    email: 'patricia.hernandez@email.com',
    ciudad: 'Cartagena',
    tipoSangre: 'O-',
    estadoCivil: 'viudo',
    ultimaConsulta: '2024-10-05',
    estado: 'inactivo'
  },
  {
    id: '6',
    nombres: 'Roberto',
    apellidos: 'García Castillo',
    tipoDocumento: 'cc',
    numeroDocumento: '32165487',
    fechaNacimiento: '1988-09-12',
    genero: 'masculino',
    telefono: '3129634785',
    email: 'roberto.garcia@email.com',
    ciudad: 'Bucaramanga',
    tipoSangre: 'A-',
    estadoCivil: 'casado',
    ultimaConsulta: '2024-10-14',
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

      if (filters.tipoDocumento) {
        filtered = filtered.filter(patient => patient.tipoDocumento === filters.tipoDocumento);
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

      if (filters.estadoCivil) {
        filtered = filtered.filter(patient => patient.estadoCivil === filters.estadoCivil);
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
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
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
      ? <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">🟢 Activo</span>
      : <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">🔴 Inactivo</span>;
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
    <div className="medical-card">
      {/* Header de la tabla */}
      <div className="p-6 border-b medical-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              📋 Pacientes Registrados
            </h2>
            <p className="text-sm medical-text-secondary">
              Total: {filteredAndSortedPatients.length} paciente(s) encontrado(s)
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <span className="text-sm medical-text-secondary">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border medical-border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border medical-border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('apellidos')}
              >
                Paciente {getSortIcon('apellidos')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('numeroDocumento')}
              >
                Documento {getSortIcon('numeroDocumento')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Edad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Información
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('ultimaConsulta')}
              >
                Última Consulta {getSortIcon('ultimaConsulta')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {patient.nombres} {patient.apellidos}
                    </div>
                    <div className="text-sm medical-text-secondary">
                      {patient.genero === 'masculino' ? '♂️' : '♀️'} {patient.ciudad}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {getDocumentTypeLabel(patient.tipoDocumento)} {patient.numeroDocumento}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {calculateAge(patient.fechaNacimiento)} años
                  </div>
                  <div className="text-xs medical-text-secondary">
                    {formatDate(patient.fechaNacimiento)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">📱 {patient.telefono}</div>
                  <div className="text-xs medical-text-secondary">📧 {patient.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">🩸 {patient.tipoSangre}</div>
                  <div className="text-xs medical-text-secondary">💑 {patient.estadoCivil}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
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
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all focus-ring" 
                      title="Ver perfil completo"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => handleEditPatient(patient)}
                      className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-all focus-ring" 
                      title="Editar información"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleNewAppointment(patient)}
                      className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-all focus-ring" 
                      title="Programar nueva cita"
                    >
                      📅
                    </button>
                    <button 
                      onClick={() => handleDeletePatient(patient)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all focus-ring" 
                      title="Eliminar paciente"
                    >
                      🗑️
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