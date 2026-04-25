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
import { dateHelper } from '@/utils/date-helper';
import { RoleGuard } from '@/components/guards/RoleGuards';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { medicalRecordsService } from '@/services/api/medical-records.service';
import { printOdontogram } from '@/components/pdf/printOdontogram';
import { formatDocumentNumber } from '@/utils/document-formatters';

// Tipos de reportes
type ReportType = 'appointments' | 'patients' | 'doctors' | 'treatments' | 'monthly_odontograms';

interface ReportFilter {
  month: number;
  year: number;
  doctorId?: string;
  status?: string;
  obraSocial?: string;
}

export default function ReportsPage() {
  const { currentUser } = useAuth();
  const [activeReport, setActiveReport] = useState<ReportType>('appointments');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilter>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
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

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>('');
  const [isGeneratingOdontogram, setIsGeneratingOdontogram] = useState(false);

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

  // Obtener lista única de obras sociales de los pacientes
  const insuranceList = useMemo(() => {
    const insurances = data.patients
      .map(p => p.obraSocial)
      .filter((v, i, a) => v && a.indexOf(v) === i)
      .sort();
    return insurances;
  }, [data.patients]);

  // Filtrar datos según periodo seleccionado
  const filteredAppointments = useMemo(() => {
    return data.appointments.filter(apt => {
      const date = new Date(apt.fecha);
      const matchPeriod = date.getMonth() === filters.month && date.getFullYear() === filters.year;
      const matchDoctor = filters.doctorId ? apt.doctorId === filters.doctorId : true;
      const matchStatus = filters.status ? apt.estado === filters.status : true;
      
      // Si hay filtro de obra social, buscar el paciente para ver su obra social
      let matchInsurance = true;
      if (filters.obraSocial) {
        const patient = data.patients.find(p => p.id === apt.pacienteId);
        matchInsurance = patient?.obraSocial === filters.obraSocial;
      }
      
      return matchPeriod && matchDoctor && matchStatus && matchInsurance;
    });
  }, [data.appointments, filters, data.patients]);

  const filteredPatients = useMemo(() => {
    return data.patients.filter(p => {
      const date = new Date(p.createdAt);
      return date.getMonth() === filters.month && date.getFullYear() === filters.year;
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

  const handleGenerateMonthlyOdontogram = async (patientId: string) => {
    const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
    if (!clinicId || !patientId) return;

    try {
      setIsGeneratingOdontogram(true);
      setSelectedPatientId(patientId); // Asegurar que el spinner se muestre en el paciente correcto
      
      const recordsResponse = await medicalRecordsService.getPatientRecords(patientId, clinicId, 1, 1000);
      if (!recordsResponse.success || !recordsResponse.data || recordsResponse.data.length === 0) {
        alert('No se encontraron registros médicos para este paciente');
        return;
      }

      // El mes del reporte viene de los filtros
      const month = filters.month;
      const year = filters.year;
      const targetDate = new Date(year, month, 1);

      // Encontrar el último registro con odontograma hasta esa fecha (inclusive) o cualquiera anterior
      let lastRecord = recordsResponse.data
        .filter((record: any) => {
          const recordDate = new Date(record.fecha);
          return recordDate.getFullYear() < year || (recordDate.getFullYear() === year && recordDate.getMonth() <= month);
        })
        .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

      // Si no hay ninguno antes del mes, tomar el primer registro que exista del paciente (si existe alguno)
      if (!lastRecord && recordsResponse.data.length > 0) {
        lastRecord = recordsResponse.data.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];
      }

      const monthRecords = recordsResponse.data.filter((record: any) => {
        let rYear, rMonth;
        const dateStr = record.fecha || '';
        if (dateStr.includes('-')) {
          const parts = dateStr.split('T')[0].split('-');
          rYear = parseInt(parts[0]);
          rMonth = parseInt(parts[1]) - 1;
        } else if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          rYear = parseInt(parts[2]);
          rMonth = parseInt(parts[1]) - 1;
        } else {
          const d = new Date(dateStr);
          rYear = d.getFullYear();
          rMonth = d.getMonth();
        }
        return rYear === year && rMonth === month;
      }).sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      const targetRecord = monthRecords[0]; // El más reciente del mes

      if (!targetRecord) {
        alert(`No se encontraron registros para el mes ${month + 1}/${year}`);
        return;
      }

      const monthlyProceduresList: any[] = [];
      
      // 1. Extraer TODAS las prestaciones grabadas en el odontograma de ese registro
      const currentOdontogramConditions = targetRecord.odontogramas?.actual || [];
      currentOdontogramConditions.forEach((tooth: any) => {
        if (tooth.procedures && Array.isArray(tooth.procedures)) {
          tooth.procedures.forEach((proc: any) => {
            // Incluimos todas las prestaciones que el profesional grabó en este registro
            monthlyProceduresList.push({
              ...proc,
              toothNumber: tooth.number
            });
          });
        }
      });

      const patient = data.patients.find(p => p.id === patientId);
      const doctor = data.users.find(u => u.id === targetRecord.doctorId);

      await printOdontogram({
        patient,
        patientName: patient ? `${patient.apellidos}, ${patient.nombres}` : 'Paciente',
        consultationDate: targetDate,
        doctorName: doctor ? `${doctor.apellidos}, ${doctor.nombres}` : 'Odontólogo',
        doctorMatricula: doctor?.matricula || '',
        odontogramConditions: currentOdontogramConditions,
        monthlyProcedures: monthlyProceduresList,
        observaciones: targetRecord.observaciones || '',
        whiteMode: true
      });

    } catch (error) {
      console.error('Error generating monthly odontogram:', error);
      alert('Error al generar el odontograma mensual');
    } finally {
      setIsGeneratingOdontogram(false);
    }
  };

  const filteredPatientsList = useMemo(() => {
    let patients = data.patients;

    // Filtro por búsqueda
    if (patientSearchTerm) {
      patients = patients.filter(p => 
        `${p.nombres} ${p.apellidos}`.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        (p.numeroDocumento && p.numeroDocumento.includes(patientSearchTerm))
      );
    }

    // Filtro por obra social (si estamos en el reporte de odontogramas)
    if (activeReport === 'monthly_odontograms' && filters.obraSocial) {
      patients = patients.filter(p => p.obraSocial === filters.obraSocial);
    }

    return patients.slice(0, 10);
  }, [data.patients, patientSearchTerm, filters.obraSocial, activeReport]);

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
      filename = `reporte_turnos_${filters.month + 1}_${filters.year}`;
    } else if (activeReport === 'patients') {
      exportData = data.patients.map(p => ({
        Nombre: `${p.nombres} ${p.apellidos}`,
        Documento: p.numeroDocumento,
        Email: p.email || 'N/A',
        Telefono: p.telefono,
        Genero: p.genero,
        'Fecha Alta': p.createdAt?.split('T')[0]
      }));
      filename = `reporte_pacientes_${filters.month + 1}_${filters.year}`;
    } else if (activeReport === 'doctors') {
      exportData = doctorStats.map(d => ({
        Doctor: d.name,
        'Total Turnos': d.total,
        Completados: d.completed,
        Cancelados: d.cancelled
      }));
      filename = `reporte_desempeño_doctores_${filters.month + 1}_${filters.year}`;
    } else if (activeReport === 'treatments') {
      exportData = treatmentStats.map(t => ({
        Tratamiento: t.name,
        Frecuencia: t.count,
        Porcentaje: `${t.percentage}%`
      }));
      filename = `reporte_tratamientos_${filters.month + 1}_${filters.year}`;
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
      <div className="min-h-screen bg-gray-50/50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-xl shadow-sm">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
                  <p className="text-gray-600 mt-1">Gestión clínica y análisis de datos odontológicos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={exportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-6 py-8 space-y-8">

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
                    { id: 'treatments', label: 'Tratamientos', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { id: 'monthly_odontograms', label: 'Reportes Obras Sociales', icon: Printer, color: 'text-blue-700', bg: 'bg-blue-50' }
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
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Mes</label>
                      <select 
                        value={filters.month}
                        onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none bg-white appearance-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i}>
                            {new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(2000, i, 1)).charAt(0).toUpperCase() + new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(2000, i, 1)).slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Año</label>
                      <select 
                        value={filters.year}
                        onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none bg-white appearance-none"
                      >
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() - 2 + i;
                          return <option key={year} value={year}>{year}</option>;
                        })}
                      </select>
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
                    {activeReport === 'monthly_odontograms' && (
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Obra Social</label>
                        <select 
                          value={filters.obraSocial || ''}
                          onChange={(e) => setFilters({...filters, obraSocial: e.target.value || undefined})}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none appearance-none bg-white"
                        >
                          <option value="">Todas las obras sociales</option>
                          {insuranceList.map(insurance => (
                            <option key={insurance} value={insurance}>{insurance}</option>
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
                          {activeReport === 'monthly_odontograms' && 'Reportes Obras Sociales (Odontogramas Mensuales)'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                          Periodo: {new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date(filters.year, filters.month))}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {[
                            { label: 'Total Turnos', value: appointmentStats.total, icon: CalendarDays, color: 'blue' },
                            { label: 'Completados', value: appointmentStats.completed, icon: UserCheck, color: 'emerald' },
                            { label: 'Cancelados', value: appointmentStats.cancelled, icon: Clock, color: 'rose' },
                            { label: 'Pendientes', value: appointmentStats.pending, icon: Activity, color: 'amber' }
                          ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 bg-${stat.color}-50 rounded-lg text-${stat.color}-600 border border-${stat.color}-100 group-hover:bg-${stat.color}-600 group-hover:text-white transition-colors flex-shrink-0`}>
                                  <stat.icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{stat.label}</p>
                                  <p className="text-xl font-black text-gray-900 leading-none mt-1">{stat.value}</p>
                                </div>
                              </div>
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

                    {activeReport === 'monthly_odontograms' && (
                      <div className="space-y-8">
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
                          <h3 className="text-xl font-bold text-blue-900 mb-2">Reportes para Obras Sociales</h3>
                          <p className="text-blue-700 text-sm">
                            Selecciona un paciente para generar su reporte mensual (Odontograma en blanco + Tabla de prestaciones).
                            El reporte se basará en el periodo de <b>{new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date(filters.year, filters.month))}</b>.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              placeholder="Buscar paciente por nombre o DNI..."
                              value={patientSearchTerm}
                              onChange={(e) => setPatientSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredPatientsList.map((p) => (
                              <div 
                                key={p.id} 
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                                  selectedPatientId === p.id 
                                    ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                                    : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
                                }`}
                                onClick={() => setSelectedPatientId(p.id)}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                    selectedPatientId === p.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {p.nombres.charAt(0)}{p.apellidos.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900">{p.apellidos}, {p.nombres}</h4>
                                    <p className="text-xs text-gray-500">DNI: {p.numeroDocumento || '---'}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateMonthlyOdontogram(p.id);
                                  }}
                                  disabled={isGeneratingOdontogram}
                                  className={`p-2 rounded-lg transition-all ${
                                    isGeneratingOdontogram 
                                      ? 'bg-gray-100 text-gray-400' 
                                      : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'
                                  }`}
                                  title="Generar Odontograma PDF"
                                >
                                  {isGeneratingOdontogram && selectedPatientId === p.id ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Printer className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>

                          {filteredPatientsList.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">No se encontraron pacientes que coincidan con la búsqueda</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeReport === 'patients' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex-shrink-0">
                                <Users className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Total Pacientes</p>
                                <p className="text-xl font-black text-gray-900 leading-none mt-1">{patientStats.total}</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                                <UserCheck className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Nuevos Pacientes</p>
                                <p className="text-xl font-black text-gray-900 leading-none mt-1">{patientStats.newInPeriod}</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                                <TrendingUp className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Tasa de Crecimiento</p>
                                <p className="text-xl font-black text-gray-900 leading-none mt-1">
                                  {Math.round((patientStats.newInPeriod / (patientStats.total || 1)) * 100)}%
                                </p>
                              </div>
                            </div>
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
