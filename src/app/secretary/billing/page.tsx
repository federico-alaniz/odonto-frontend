'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { appointmentsService, Appointment } from '@/services/api/appointments.service';
import { patientsService, Patient } from '@/services/api/patients.service';
import { usersService } from '@/services/api/users.service';
import { User as UserType } from '@/types/roles';
import { 
  DollarSign, 
  Search, 
  Calendar,
  User,
  FileText,
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  appointmentId: string;
  fecha: string;
  hora: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  sena: number;
  complemento: number;
  total: number;
  pagado: boolean;
  motivo: string;
}

export default function BillingPage() {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    if (currentUser) {
      loadPayments();
    }
  }, [currentUser]);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, dateFilter, statusFilter, payments]);

  const loadPayments = async () => {
    const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
    
    if (!clinicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        appointmentsService.getAppointments(clinicId, { limit: 1000 }),
        patientsService.getPatients(clinicId, { limit: 1000 }),
        usersService.getUsers(clinicId, { role: 'doctor', limit: 100 })
      ]);

      const allAppointments = appointmentsRes.data;
      const patients = patientsRes.data;
      const doctors = doctorsRes.data;

      const paymentsData: PaymentRecord[] = allAppointments
        .filter(apt => apt.estado === 'confirmada' || apt.estado === 'completada' || apt.estado === 'en_curso')
        .filter(apt => apt.notas && apt.notas.includes('Pago registrado'))
        .map(apt => {
          const patient = patients.find(p => p.id === apt.patientId);
          const doctor = doctors.find(d => d.id === apt.doctorId);
          
          const paymentInfo = parsePaymentInfo(apt.notas || '');
          
          return {
            id: apt.id,
            appointmentId: apt.id,
            fecha: apt.fecha,
            hora: apt.horaInicio,
            patientId: apt.patientId,
            patientName: patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente desconocido',
            doctorName: doctor ? `Dr. ${doctor.nombres} ${doctor.apellidos}` : 'Doctor no asignado',
            specialty: doctor?.especialidades?.[0] || doctor?.specialization || 'Sin especialidad',
            sena: paymentInfo.sena,
            complemento: paymentInfo.complemento,
            total: paymentInfo.total,
            pagado: paymentInfo.pagado,
            motivo: apt.motivo
          };
        })
        .sort((a, b) => {
          const dateCompare = b.fecha.localeCompare(a.fecha);
          if (dateCompare !== 0) return dateCompare;
          return b.hora.localeCompare(a.hora);
        });

      setPayments(paymentsData);
      setFilteredPayments(paymentsData);

    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const parsePaymentInfo = (notas: string): { sena: number; complemento: number; total: number; pagado: boolean } => {
    const senaMatch = notas.match(/Seña: \$?([\d.]+)/);
    const complementoMatch = notas.match(/Complemento: \$?([\d.]+)/);
    const totalMatch = notas.match(/Total: \$?([\d.]+)/);
    const pagadoMatch = notas.match(/Pagado: (Sí|No)/);

    return {
      sena: senaMatch ? parseFloat(senaMatch[1]) : 0,
      complemento: complementoMatch ? parseFloat(complementoMatch[1]) : 0,
      total: totalMatch ? parseFloat(totalMatch[1]) : 0,
      pagado: pagadoMatch ? pagadoMatch[1] === 'Sí' : false
    };
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.patientName.toLowerCase().includes(term) ||
        payment.doctorName.toLowerCase().includes(term) ||
        payment.motivo.toLowerCase().includes(term)
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(payment => payment.fecha === dateFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => 
        statusFilter === 'paid' ? payment.pagado : !payment.pagado
      );
    }

    setFilteredPayments(filtered);
  };

  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.total, 0);
  const totalPaid = filteredPayments.filter(p => p.pagado).reduce((sum, p) => sum + p.total, 0);
  const totalPending = filteredPayments.filter(p => !p.pagado).reduce((sum, p) => sum + p.total, 0);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando facturación...</p>
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
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Gestión de pagos y cobros
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facturado</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">${totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">{filteredPayments.length} registros</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <DollarSign className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos Completados</p>
                <p className="text-3xl font-bold mt-2 text-green-600">${totalPaid.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">{filteredPayments.filter(p => p.pagado).length} pagos</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                <p className="text-3xl font-bold mt-2 text-yellow-600">${totalPending.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">{filteredPayments.filter(p => !p.pagado).length} pendientes</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por paciente, doctor o motivo..."
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'pending')}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="paid">Pagados</option>
                  <option value="pending">Pendientes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Seña
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Complemento
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(payment.fecha + 'T00:00:00').toLocaleDateString('es-AR', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric' 
                              })}
                            </div>
                            <div className="text-xs text-gray-500">{payment.hora}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div className="text-sm font-medium text-gray-900">{payment.patientName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.doctorName}</div>
                        <div className="text-xs text-gray-500">{payment.specialty}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{payment.motivo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">${payment.sena.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">${payment.complemento.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-gray-900">${payment.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {payment.pagado ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle className="w-3 h-3" />
                            Pagado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <AlertCircle className="w-3 h-3" />
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No se encontraron registros de pago</p>
                      <p className="text-sm text-gray-400 mt-1">Los pagos se registran al confirmar la llegada de pacientes</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
