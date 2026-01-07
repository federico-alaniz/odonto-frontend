'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { appointmentsService, type Appointment } from '@/services/api/appointments.service';
import { patientsService, type Patient } from '@/services/api/patients.service';
import { 
  Stethoscope,
  Plus,
  Search,
  Calendar,
  Clock,
  FileText,
  User,
  Activity,
  Eye,
  Edit,
  Filter,
  RefreshCw
} from 'lucide-react';

// Simular datos de consultas (en el futuro vendrán del backend)
interface Consultation {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  reason: string;
  diagnosis: string;
  status: 'completed' | 'in-progress' | 'pending';
  type: 'consultation' | 'follow-up' | 'emergency';
}

export default function ConsultationsPage() {
  const { currentUser } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        setError(null);

        const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;

        const doctorId =
          (currentUser?.id as string | undefined) ||
          (typeof window !== 'undefined' ? window.localStorage.getItem('userId') || undefined : undefined);

        if (!doctorId) {
          setConsultations([]);
          setFilteredConsultations([]);
          setError('No se pudo determinar el doctor logueado');
          return;
        }

        const [appointmentsRes, patientsRes] = await Promise.all([
          appointmentsService.getAppointments(clinicId, { doctorId, limit: 500 }),
          patientsService.getPatients(clinicId, { limit: 2000 }),
        ]);

        const patientsById = new Map<string, Patient>();
        (patientsRes.data ?? []).forEach((p) => patientsById.set(p.id, p));

        const mapStatus = (estado: Appointment['estado']): Consultation['status'] => {
          switch (estado) {
            case 'completada':
              return 'completed';
            case 'en_curso':
              return 'in-progress';
            case 'programada':
            case 'confirmada':
              return 'pending';
            case 'cancelada':
            case 'no_asistio':
              return 'pending';
            default:
              return 'pending';
          }
        };

        const mapType = (tipo: Appointment['tipo']): Consultation['type'] => {
          switch (tipo) {
            case 'control':
              return 'follow-up';
            case 'urgencia':
              return 'emergency';
            default:
              return 'consultation';
          }
        };

        const mapped: Consultation[] = (appointmentsRes.data ?? [])
          .filter((apt) => apt.doctorId === doctorId)
          .map((apt) => {
            const patient = patientsById.get(apt.patientId);
            const patientName = patient ? `${patient.nombres} ${patient.apellidos}`.trim() : 'Paciente desconocido';

            const hasMotivo = Boolean(apt.motivo && apt.motivo.trim());
            return {
              id: apt.id,
              patientName,
              patientId: apt.patientId,
              date: apt.fecha,
              time: apt.horaInicio,
              reason: hasMotivo ? apt.motivo : 'N/A',
              diagnosis: 'N/A',
              status: mapStatus(apt.estado),
              type: mapType(apt.tipo),
            };
          })
          .sort((a, b) => {
            const aKey = `${a.date} ${a.time}`;
            const bKey = `${b.date} ${b.time}`;
            return bKey.localeCompare(aKey);
          });

        setConsultations(mapped);
        setFilteredConsultations(mapped);
      } catch (e: any) {
        setConsultations([]);
        setFilteredConsultations([]);
        setError(e?.message || 'Error al cargar consultas');
      } finally {
        setLoading(false);
      }
    };

    void fetchConsultations();
  }, [currentUser?.id]);

  // Auto-refresh cada 30 segundos para reflejar cambios de recepción
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchConsultations = async () => {
        try {
          const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
          const doctorId = currentUser?.id as string | undefined;

          if (!doctorId) return;

          const [appointmentsRes, patientsRes] = await Promise.all([
            appointmentsService.getAppointments(clinicId, { doctorId, limit: 500 }),
            patientsService.getPatients(clinicId, { limit: 2000 }),
          ]);

          const patientsById = new Map<string, Patient>();
          (patientsRes.data ?? []).forEach((p) => patientsById.set(p.id, p));

          const mapStatus = (estado: Appointment['estado']): Consultation['status'] => {
            switch (estado) {
              case 'completada':
                return 'completed';
              case 'en_curso':
                return 'in-progress';
              case 'programada':
              case 'confirmada':
                return 'pending';
              case 'cancelada':
              case 'no_asistio':
                return 'pending';
              default:
                return 'pending';
            }
          };

          const mapType = (tipo: Appointment['tipo']): Consultation['type'] => {
            switch (tipo) {
              case 'control':
                return 'follow-up';
              case 'urgencia':
                return 'emergency';
              default:
                return 'consultation';
            }
          };

          const mapped: Consultation[] = (appointmentsRes.data ?? [])
            .filter((apt) => apt.doctorId === doctorId)
            .map((apt) => {
              const patient = patientsById.get(apt.patientId);
              const patientName = patient ? `${patient.nombres} ${patient.apellidos}`.trim() : 'Paciente desconocido';
              const hasMotivo = Boolean(apt.motivo && apt.motivo.trim());
              return {
                id: apt.id,
                patientName,
                patientId: apt.patientId,
                date: apt.fecha,
                time: apt.horaInicio,
                reason: hasMotivo ? apt.motivo : 'N/A',
                diagnosis: 'N/A',
                status: mapStatus(apt.estado),
                type: mapType(apt.tipo),
              };
            })
            .sort((a, b) => {
              const aKey = `${a.date} ${a.time}`;
              const bKey = `${b.date} ${b.time}`;
              return bKey.localeCompare(aKey);
            });

          setConsultations(mapped);
        } catch (e) {
          console.error('Error en auto-refresh:', e);
        }
      };

      void fetchConsultations();
    }, 30000); // Refresh cada 30 segundos

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const handleManualRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    let filtered = consultations;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(consultation =>
        consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(consultation => consultation.status === statusFilter);
    }

    setFilteredConsultations(filtered);
  }, [consultations, searchTerm, statusFilter]);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in-progress': return 'En Curso';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getTypeClasses = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-50 text-blue-700';
      case 'follow-up':
        return 'bg-green-50 text-green-700';
      case 'emergency':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consulta';
      case 'follow-up': return 'Control';
      case 'emergency': return 'Emergencia';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando consultas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-700 font-medium">{error}</p>
            <p className="text-gray-500 text-sm mt-2">Intenta recargar la página.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Consultas</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Historial de consultas médicas realizadas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleManualRefresh}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
                title="Actualizar consultas"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
              <Link
                href="/doctor/dashboard"
                className="px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, motivo o diagnóstico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completadas</option>
                <option value="in-progress">En Curso</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consultations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Lista de Consultas</h2>
                  <p className="text-sm text-gray-600 mt-1">{filteredConsultations.length} consultas encontradas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredConsultations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paciente</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Motivo</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredConsultations.map((consultation) => (
                      <tr key={consultation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{consultation.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{consultation.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{consultation.patientName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">{consultation.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusClasses(consultation.status)}`}>
                            {getStatusText(consultation.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeClasses(consultation.type)}`}>
                            {getTypeText(consultation.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/doctor/consultations/${consultation.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {consultation.status !== 'completed' && (
                              <Link
                                href={`/doctor/consultations/${consultation.id}/edit`}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Editar consulta"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium text-lg">No se encontraron consultas</p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Las consultas realizadas aparecerán aquí'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}