'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Download, 
  Filter, 
  FileText, 
  TrendingUp, 
  Stethoscope, 
  Activity,
  ChevronRight,
  Printer,
  CalendarDays,
  UserCheck,
  Clock,
  Search,
  PieChart,
  ArrowRight,
  Info
} from 'lucide-react';
import { appointmentsService } from '@/services/api/appointments.service';
import { patientsService } from '@/services/api/patients.service';
import { usersService } from '@/services/api/users.service';
import { getSpecialtyName } from '@/utils';
import { dateHelper } from '@/utils/date-helper';
import { RoleGuard } from '@/components/guards/RoleGuards';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Tipos de reportes
type ReportType = 'appointments' | 'patients' | 'doctors' | 'treatments';

interface ReportFilter {
  startDate: string;
  endDate: string;
  doctorId?: string;
  status?: string;
}

export default function ReportsPage() {
  const { currentUser } = useAuth();
  const [activeReport, setActiveReport] = useState<ReportType>('appointments');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: dateHelper.formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    endDate: dateHelper.today(),
  });

  const [data, setData] = useState<{
    appointments: any[];
    patients: any[];
    users: any[];
  }>({
    appointments: [],
    patients: [],
    users: [],
  });

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
    if (!clinicId) return;

    try {
      setLoading(true);
      const [appointmentsRes, patientsRes, usersRes] = await Promise.all([
        appointmentsService.getAppointments(clinicId, { limit: 1000 }),
        patientsService.getPatients(clinicId, { limit: 1000 }),
        usersService.getUsers(clinicId)
      ]);

      setData({
        appointments: appointmentsRes.success ? appointmentsRes.data : [],
        patients: patientsRes.success ? patientsRes.data : [],
        users: usersRes.success ? usersRes.data : [],
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar datos según fechas
  const filteredAppointments = useMemo(() => {
    return data.appointments.filter(apt => {
      const date = apt.fecha;
      const matchDate = date >= filters.startDate && date <= filters.endDate;
      const matchDoctor = filters.doctorId ? apt.doctorId === filters.doctorId : true;
      const matchStatus = filters.status ? apt.estado === filters.status : true;
      return matchDate && matchDoctor && matchStatus;
    });
  }, [data.appointments, filters]);

  const filteredPatients = useMemo(() => {
    return data.patients.filter(p => {
      const date = p.createdAt?.split('T')[0];
      return date >= filters.startDate && date <= filters.endDate;
    });
  }, [data.patients, filters]);

  // Cálculos para Reporte de Turnos
  const appointmentStats = useMemo(() => {
    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter(a => a.estado === 'completada').length;
    const cancelled = filteredAppointments.filter(a => a.estado === 'cancelada').length;
    const pending = filteredAppointments.filter(a => a.estado === 'confirmada' || a.estado === 'programada').length;
    
    return { total, completed, cancelled, pending };
  }, [filteredAppointments]);

  // Cálculos para Reporte de Pacientes
  const patientStats = useMemo(() => {
    const total = data.patients.length;
    const newInPeriod = filteredPatients.length;
    const byGender = data.patients.reduce((acc: any, p) => {
      const gender = p.genero || 'otro';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});
    
    return { total, newInPeriod, byGender };
  }, [data.patients, filteredPatients]);

  // Cálculos para Reporte de Doctores
  const doctorStats = useMemo(() => {
    const doctors = data.users.filter(u => u.role === 'doctor' || u.isDoctor);
    return doctors.map(d => {
      const apts = filteredAppointments.filter(a => a.doctorId === d.id);
      return {
        id: d.id,
        name: `${d.nombres} ${d.apellidos}`,
        total: apts.length,
        completed: apts.filter(a => a.estado === 'completada').length,
        cancelled: apts.filter(a => a.estado === 'cancelada').length,
      };
    }).sort((a, b) => b.total - a.total);
  }, [data.users, filteredAppointments]);

  // Cálculos para Estadísticas de Tratamientos (basado en el motivo del turno)
  const treatmentStats = useMemo(() => {
    const reasons = filteredAppointments.reduce((acc: any, a) => {
      const reason = a.motivo || 'Consulta General';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(reasons)
      .map(([name, count]: [string, any]) => ({
        name,
        count,
        percentage: Math.round((count / filteredAppointments.length) * 100) || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredAppointments]);

  // Exportar a CSV
  const exportCSV = () => {
    let exportData: any[] = [];
    let filename = '';

    if (activeReport === 'appointments') {
      exportData = filteredAppointments.map(a => ({
        Fecha: a.fecha,
        Hora: a.horaInicio,
        Paciente: a.pacienteNombre || 'N/A',
        Doctor: a.doctorNombre || 'N/A',
        Estado: a.estado,
        Motivo: a.motivo
      }));
      filename = `reporte_turnos_${filters.startDate}_${filters.endDate}`;
    } else if (activeReport === 'patients') {
      exportData = data.patients.map(p => ({
        Nombre: `${p.nombres} ${p.apellidos}`,
        Documento: p.numeroDocumento,
        Email: p.email || 'N/A',
        Telefono: p.telefono,
        Genero: p.genero,
        'Fecha Alta': p.createdAt?.split('T')[0]
      }));
      filename = `reporte_pacientes_${dateHelper.today()}`;
    } else if (activeReport === 'doctors') {
      exportData = doctorStats.map(d => ({
        Doctor: d.name,
        'Total Turnos': d.total,
        Completados: d.completed,
        Cancelados: d.cancelled
      }));
      filename = `reporte_desempeño_doctores_${filters.startDate}_${filters.endDate}`;
    } else if (activeReport === 'treatments') {
      exportData = treatmentStats.map(t => ({
        Tratamiento: t.name,
        Frecuencia: t.count,
        Porcentaje: `${t.percentage}%`
      }));
      filename = `reporte_tratamientos_${filters.startDate}_${filters.endDate}`;
    }

    if (exportData.length === 0) return;
    
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => {
        const cell = row[header] === null || row[header] === undefined ? '' : row[header];
        return typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Exportar a PDF
  const exportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`reporte_${activeReport}_${dateHelper.today()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reportes y Estadísticas</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  Gestión clínica y análisis de datos odontológicos
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    Admin
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
              <button 
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-medium"
              >
                <Printer className="w-4 h-4" />
                Imprimir PDF
              </button>
            </div>
          </div>

          {/* Filters & Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                <nav className="space-y-1">
                  {[
                    { id: 'appointments', label: 'Turnos', icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { id: 'patients', label: 'Pacientes', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { id: 'doctors', label: 'Doctores', icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { id: 'treatments', label: 'Tratamientos', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveReport(item.id as ReportType)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        activeReport === item.id 
                          ? `${item.bg} ${item.color} font-semibold shadow-sm` 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {activeReport === item.id && <ChevronRight className="w-4 h-4" />}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Quick Info Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 opacity-80" />
                  <span className="font-medium opacity-90">Análisis del Periodo</span>
                </div>
                <p className="text-sm leading-relaxed opacity-90">
                  Visualiza el rendimiento de tu clínica en el rango de fechas seleccionado. Los datos se actualizan en tiempo real.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs opacity-70">Total Turnos</p>
                      <p className="text-2xl font-bold">{appointmentStats.total}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-70">Efectividad</p>
                      <p className="text-2xl font-bold">
                        {Math.round((appointmentStats.completed / (appointmentStats.total || 1)) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Filters Bar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filtros</span>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Desde</label>
                      <input 
                        type="date" 
                        value={filters.startDate}
                        onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Hasta</label>
                      <input 
                        type="date" 
                        value={filters.endDate}
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
                      />
                    </div>
                    {activeReport === 'appointments' && (
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Doctor</label>
                        <select 
                          value={filters.doctorId || ''}
                          onChange={(e) => setFilters({...filters, doctorId: e.target.value || undefined})}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none appearance-none bg-white"
                        >
                          <option value="">Todos los doctores</option>
                          {data.users.filter(u => u.role === 'doctor' || u.isDoctor).map(d => (
                            <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Report Canvas */}
              <div ref={reportRef} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[600px]">
                {loading ? (
                  <div className="flex items-center justify-center h-[600px]">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-medium">Generando reporte...</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 space-y-8">
                    
                    {/* Report Specific Header */}
                    <div className="flex items-end justify-between border-b border-gray-100 pb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {activeReport === 'appointments' && 'Resumen de Turnos'}
                          {activeReport === 'patients' && 'Análisis de Pacientes'}
                          {activeReport === 'doctors' && 'Desempeño de Profesionales'}
                          {activeReport === 'treatments' && 'Estadísticas de Tratamientos'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                          Periodo: {dateHelper.formatDateBuenosAires(new Date(filters.startDate))} al {dateHelper.formatDateBuenosAires(new Date(filters.endDate))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha de Generación</p>
                        <p className="text-sm font-medium text-gray-600">{dateHelper.formatDateTimeBuenosAires(new Date())}</p>
                      </div>
                    </div>

                    {/* Report Content */}
                    {activeReport === 'appointments' && (
                      <div className="space-y-8">
                        {/* Cards Summary */}
                        <div className="grid grid-cols-4 gap-4">
                          {[
                            { label: 'Total Turnos', value: appointmentStats.total, icon: CalendarDays, color: 'blue' },
                            { label: 'Completados', value: appointmentStats.completed, icon: UserCheck, color: 'emerald' },
                            { label: 'Cancelados', value: appointmentStats.cancelled, icon: Clock, color: 'rose' },
                            { label: 'Pendientes', value: appointmentStats.pending, icon: Activity, color: 'amber' }
                          ].map((stat, i) => (
                            <div key={i} className={`p-4 rounded-2xl border border-${stat.color}-100 bg-${stat.color}-50/30`}>
                              <div className="flex items-center justify-between mb-2">
                                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Appointments Table */}
                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50/50">
                                <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Fecha/Hora</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Paciente</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Doctor</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Motivo</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {filteredAppointments.slice(0, 20).map((apt, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-4 py-3">
                                    <p className="text-sm font-semibold text-gray-900">{apt.fecha}</p>
                                    <p className="text-xs text-gray-500">{apt.horaInicio}</p>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 font-medium">{apt.pacienteNombre || 'Paciente'}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{apt.doctorNombre || 'Doctor'}</td>
                                  <td className="px-4 py-3 text-sm text-gray-500 italic">{apt.motivo || 'Consulta'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                      apt.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' :
                                      apt.estado === 'cancelada' ? 'bg-rose-100 text-rose-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {apt.estado}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredAppointments.length > 20 && (
                            <div className="p-4 text-center border-t border-gray-100 bg-gray-50/30">
                              <p className="text-xs text-gray-500 font-medium">Mostrando los primeros 20 de {filteredAppointments.length} resultados. Descarga el CSV para ver el listado completo.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeReport === 'patients' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-3 gap-6">
                          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
                            <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">Total Pacientes</h4>
                            <p className="text-4xl font-black text-emerald-900">{patientStats.total}</p>
                            <p className="text-xs text-emerald-600 mt-1 font-medium">Registrados en la clínica</p>
                          </div>
                          <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-2">Nuevos Pacientes</h4>
                            <p className="text-4xl font-black text-blue-900">{patientStats.newInPeriod}</p>
                            <p className="text-xs text-blue-600 mt-1 font-medium">En el periodo seleccionado</p>
                          </div>
                          <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
                            <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2">Tasa de Crecimiento</h4>
                            <p className="text-4xl font-black text-indigo-900">
                              {Math.round((patientStats.newInPeriod / (patientStats.total || 1)) * 100)}%
                            </p>
                            <p className="text-xs text-indigo-600 mt-1 font-medium">Respecto al total</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                              <PieChart className="w-5 h-5 text-indigo-500" />
                              Distribución por Género
                            </h3>
                            <div className="space-y-4">
                              {Object.entries(patientStats.byGender).map(([gender, count]: [string, any]) => (
                                <div key={gender} className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="capitalize text-gray-600 font-medium">{gender}</span>
                                    <span className="font-bold text-gray-900">{count} ({Math.round((count / patientStats.total) * 100)}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${
                                        gender === 'masculino' ? 'bg-blue-500' : 
                                        gender === 'femenino' ? 'bg-pink-500' : 'bg-gray-400'
                                      }`}
                                      style={{ width: `${(count / patientStats.total) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-10 h-10 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">Crecimiento Constante</h3>
                              <p className="text-gray-500 text-sm max-w-[250px] mx-auto mt-2">
                                Tu base de pacientes ha crecido un <b>{Math.round((patientStats.newInPeriod / (patientStats.total || 1)) * 100)}%</b> este periodo.
                              </p>
                            </div>
                            <button 
                              onClick={() => setActiveReport('appointments')}
                              className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:underline"
                            >
                              Ver turnos asociados
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeReport === 'doctors' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                          {doctorStats.map((d, i) => (
                            <div key={i} className="flex items-center gap-6 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all group">
                              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">
                                {d.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900">{d.name}</h4>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Especialista</p>
                              </div>
                              <div className="grid grid-cols-3 gap-8 text-center px-8 border-x border-gray-50">
                                <div>
                                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Turnos</p>
                                  <p className="text-xl font-black text-gray-900">{d.total}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Completados</p>
                                  <p className="text-xl font-black text-emerald-600">{d.completed}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Cancelados</p>
                                  <p className="text-xl font-black text-rose-600">{d.cancelled}</p>
                                </div>
                              </div>
                              <div className="w-32">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Efectividad</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-emerald-500 h-full rounded-full" 
                                      style={{ width: `${Math.round((d.completed / (d.total || 1)) * 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-bold text-gray-700">
                                    {Math.round((d.completed / (d.total || 1)) * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeReport === 'treatments' && (
                      <div className="space-y-8">
                        <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl">
                          <h3 className="text-xl font-bold text-orange-900 mb-2">Análisis de Procedimientos</h3>
                          <p className="text-orange-700 text-sm">
                            Este reporte muestra los motivos de consulta más frecuentes registrados en el sistema. Úsalo para planificar insumos y especialidades.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {treatmentStats.map((t, i) => (
                            <div key={i} className="relative p-5 rounded-2xl border border-gray-100 overflow-hidden group">
                              <div 
                                className="absolute inset-y-0 left-0 bg-orange-500/5 transition-all group-hover:bg-orange-500/10"
                                style={{ width: `${t.percentage}%` }}
                              ></div>
                              <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-lg bg-white border border-orange-100 shadow-sm flex items-center justify-center font-bold text-orange-600">
                                    {i + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                                    <p className="text-xs text-gray-500 font-medium">{t.count} turnos registrados</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-black text-gray-900">{t.percentage}%</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">del total</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
