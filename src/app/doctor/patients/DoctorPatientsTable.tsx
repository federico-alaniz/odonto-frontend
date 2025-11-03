'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  Edit3, 
  Calendar, 
  Phone, 
  Mail, 
  User,
  Users, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Droplets,
  Search,
  AlertTriangle,
  Clock,
  FileText,
  Heart,
  Stethoscope
} from 'lucide-react';
import { DoctorPatientFilters } from './DoctorPatientsFilters';
import { patients } from '@/utils/fake-patients';
import { appointments } from '@/utils/fake-appointments';

// Interface para pacientes del doctor con información adicional
interface DoctorPatient {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  email?: string;
  ciudad?: string;
  tipoSangre?: string;
  alergias?: string[];
  medicamentosActuales?: string[];
  antecedentesPersonales?: string[];
  ultimaConsulta?: string;
  proximaCita?: string;
  estado: 'activo' | 'inactivo';
  doctorAsignado?: string;
  age: number;
  lastVisitType: string;
  nextAppointmentDate?: string;
  urgency: 'low' | 'medium' | 'high';
  riskFactors: number;
  daysSinceLastVisit: number;
}

interface DoctorPatientsTableProps {
  filters?: DoctorPatientFilters;
}

type SortKey = 'name' | 'age' | 'lastVisit' | 'urgency' | 'document' | 'bloodType';
type SortOrder = 'asc' | 'desc';

export default function DoctorPatientsTable({ filters }: DoctorPatientsTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [loading, setLoading] = useState(true);
  const [doctorPatients, setDoctorPatients] = useState<DoctorPatient[]>([]);
  
  const itemsPerPage = 10;
  const currentDoctorId = 'user_doc_001'; // ID del doctor en fake data

  // Cargar y procesar datos de pacientes del doctor
  useEffect(() => {
    const loadDoctorPatients = () => {
      const today = new Date();
      
      // Filtrar pacientes asignados al doctor actual
      const processedPatients = patients
        .filter(patient => patient.doctorAsignado === currentDoctorId)
        .map(patient => {
          // Calcular edad
          const birthDate = new Date(patient.fechaNacimiento);
          const age = today.getFullYear() - birthDate.getFullYear();
          
          // Encontrar última cita
          const patientAppointments = appointments.filter(apt => apt.patientId === patient.id);
          const lastAppointment = patientAppointments
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
          
          // Encontrar próxima cita
          const futureAppointments = patientAppointments
            .filter(apt => new Date(apt.fecha) > today)
            .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
          
          // Calcular días desde última consulta
          const daysSinceLastVisit = patient.ultimaConsulta ? 
            Math.floor((today.getTime() - new Date(patient.ultimaConsulta).getTime()) / (1000 * 3600 * 24)) : 999;
          
          // Calcular factores de riesgo
          const riskFactors = (patient.alergias?.length || 0) + 
                             (patient.antecedentesPersonales?.length || 0) + 
                             (patient.medicamentosActuales?.length || 0);
          
          // Determinar urgencia
          let urgency: 'low' | 'medium' | 'high' = 'low';
          if (riskFactors >= 3 || daysSinceLastVisit > 180) urgency = 'high';
          else if (riskFactors >= 2 || daysSinceLastVisit > 90) urgency = 'medium';

          return {
            ...patient,
            age,
            lastVisitType: lastAppointment?.tipo || 'N/A',
            nextAppointmentDate: futureAppointments[0]?.fecha,
            urgency,
            riskFactors,
            daysSinceLastVisit
          } as DoctorPatient;
        });

      setDoctorPatients(processedPatients);
      setLoading(false);
    };

    setTimeout(loadDoctorPatients, 800); // Simular carga
  }, []);

  // Filtrar pacientes basado en los filtros aplicados
  const filteredPatients = useMemo(() => {
    if (!filters) return doctorPatients;

    return doctorPatients.filter(patient => {
      // Filtro de búsqueda por nombre
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const fullName = `${patient.nombres} ${patient.apellidos}`.toLowerCase();
        if (!fullName.includes(searchTerm)) return false;
      }

      // Filtro por número de documento
      if (filters.numeroDocumento) {
        if (!patient.numeroDocumento.includes(filters.numeroDocumento)) return false;
      }

      // Filtro por género
      if (filters.genero && patient.genero !== filters.genero) return false;

      // Filtro por tipo de sangre
      if (filters.tipoSangre && patient.tipoSangre !== filters.tipoSangre) return false;

      // Filtro por urgencia
      if (filters.urgencia && patient.urgency !== filters.urgencia) return false;

      // Filtro por edad
      if (filters.edadMin && patient.age < parseInt(filters.edadMin)) return false;
      if (filters.edadMax && patient.age > parseInt(filters.edadMax)) return false;

      // Filtro por última consulta
      if (filters.ultimaConsulta) {
        const days = parseInt(filters.ultimaConsulta);
        if (patient.daysSinceLastVisit > days) return false;
      }

      return true;
    });
  }, [doctorPatients, filters]);

  // Ordenar pacientes
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortKey) {
        case 'name':
          aValue = `${a.apellidos} ${a.nombres}`;
          bValue = `${b.apellidos} ${b.nombres}`;
          break;
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'lastVisit':
          aValue = a.ultimaConsulta ? new Date(a.ultimaConsulta).getTime() : 0;
          bValue = b.ultimaConsulta ? new Date(b.ultimaConsulta).getTime() : 0;
          break;
        case 'urgency':
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          aValue = urgencyOrder[a.urgency];
          bValue = urgencyOrder[b.urgency];
          break;
        case 'document':
          aValue = a.numeroDocumento;
          bValue = b.numeroDocumento;
          break;
        case 'bloodType':
          aValue = a.tipoSangre || '';
          bValue = b.tipoSangre || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPatients, sortKey, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = sortedPatients.slice(startIndex, startIndex + itemsPerPage);

  // Función para cambiar ordenamiento
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Función para obtener icono de ordenamiento
  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  // Función para obtener clases de urgencia
  const getUrgencyClasses = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getUrgencyIcon = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Header de la tabla */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Mis Pacientes</h3>
            <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded-full">
              {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {paginatedPatients.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Paciente
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('document')}
                  >
                    <div className="flex items-center gap-1">
                      Documento
                      {getSortIcon('document')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('age')}
                  >
                    <div className="flex items-center gap-1">
                      Edad
                      {getSortIcon('age')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('bloodType')}
                  >
                    <div className="flex items-center gap-1">
                      Tipo Sangre
                      {getSortIcon('bloodType')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('urgency')}
                  >
                    <div className="flex items-center gap-1">
                      Prioridad
                      {getSortIcon('urgency')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('lastVisit')}
                  >
                    <div className="flex items-center gap-1">
                      Última Consulta
                      {getSortIcon('lastVisit')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Paciente */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.apellidos}, {patient.nombres}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.genero} • {patient.ciudad || 'Ciudad no especificada'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Documento */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{patient.numeroDocumento}</div>
                      <div className="text-xs text-gray-500">{patient.tipoDocumento.toUpperCase()}</div>
                    </td>

                    {/* Edad */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{patient.age} años</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(patient.fechaNacimiento)}
                      </div>
                    </td>

                    {/* Tipo de sangre */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {patient.tipoSangre || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Prioridad */}
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyClasses(patient.urgency)}`}>
                        {getUrgencyIcon(patient.urgency)}
                        {patient.urgency === 'high' ? 'Alta' : patient.urgency === 'medium' ? 'Media' : 'Baja'}
                      </div>
                      {patient.riskFactors > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          {patient.riskFactors} factor{patient.riskFactors > 1 ? 'es' : ''} de riesgo
                        </div>
                      )}
                    </td>

                    {/* Última consulta */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(patient.ultimaConsulta)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {patient.lastVisitType} • {patient.daysSinceLastVisit} días
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{patient.telefono}</span>
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Mail className="w-4 h-4" />
                          <span className="truncate max-w-32">{patient.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/historiales/${patient.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver historial médico"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/calendario?patient=${patient.id}`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Programar cita"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/doctor/consultations/new?patient=${patient.id}`)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Nueva consulta"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredPatients.length)} de {filteredPatients.length} pacientes
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron pacientes
          </h3>
          <p className="text-gray-600 mb-6">
            {filters && Object.values(filters).some(v => v !== '') 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Aún no tienes pacientes asignados'
            }
          </p>
        </div>
      )}
    </div>
  );
}