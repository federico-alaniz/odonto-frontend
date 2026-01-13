'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { appointmentsService } from '@/services/api/appointments.service';
import { patientsService } from '@/services/api/patients.service';
import type { Appointment, Patient } from '@/types';
import { usersService } from '@/services/api/users.service';
import { medicalRecordsService } from '@/services/api/medical-records.service';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  MapPin,
  Phone,
  Mail,
  Activity,
  CheckCircle,
  AlertCircle,
  Edit
} from 'lucide-react';

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { buildPath } = useTenant();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctorName, setDoctorName] = useState<string>('');
  const [medicalRecordId, setMedicalRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const appointmentId = params.id as string;

  useEffect(() => {
    loadConsultationDetails();
  }, [appointmentId]);

  const loadConsultationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
      const doctorId = currentUser?.id as string;

      if (!clinicId || !doctorId) {
        setError('No se pudo obtener la información del usuario');
        return;
      }

      // Cargar cita
      const appointmentsRes = await appointmentsService.getAppointments(clinicId, { 
        doctorId,
        limit: 500 
      });

      const foundAppointment = appointmentsRes.data?.find((apt: Appointment) => apt.id === appointmentId);

      if (!foundAppointment) {
        setError('Consulta no encontrada');
        return;
      }

      setAppointment(foundAppointment);

      // Cargar paciente
      const patientsRes = await patientsService.getPatients(clinicId);
      const foundPatient = patientsRes.data?.find((p: Patient) => p.id === foundAppointment.patientId);
      
      if (foundPatient) {
        setPatient(foundPatient);
      }

      // Cargar doctor
      const [doctorsRes, adminsRes] = await Promise.all([
        usersService.getUsers(clinicId, { role: 'doctor' }),
        usersService.getUsers(clinicId, { role: 'admin' })
      ]);

      const adminDoctors = adminsRes.data?.filter((user: any) => user.isDoctor === true) || [];
      const allDoctors = [...(doctorsRes.data || []), ...adminDoctors];
      const doctor = allDoctors.find((d: any) => d.id === foundAppointment.doctorId);

      if (doctor) {
        setDoctorName(`Dr. ${doctor.nombres} ${doctor.apellidos}`);
      }

      // Cargar registro médico asociado
      if (foundPatient) {
        try {
          const medicalRecordsRes = await medicalRecordsService.getPatientRecords(
            foundPatient.id,
            clinicId,
            1,
            1000
          );
          
          const associatedRecord = medicalRecordsRes.data?.find(
            (record: any) => record.appointmentId === appointmentId
          );
          
          if (associatedRecord) {
            setMedicalRecordId(associatedRecord.id);
          }
        } catch (recordErr) {
          console.error('Error cargando registro médico:', recordErr);
        }
      }

    } catch (err: any) {
      console.error('Error cargando detalles de consulta:', err);
      setError(err?.message || 'Error al cargar los detalles de la consulta');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'programada':
        return {
          text: 'Programada',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Calendar
        };
      case 'confirmada':
        return {
          text: 'Confirmada',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Clock
        };
      case 'en_curso':
        return {
          text: 'En Curso',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: Activity
        };
      case 'completada':
        return {
          text: 'Completada',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: CheckCircle
        };
      case 'cancelada':
        return {
          text: 'Cancelada',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle
        };
      case 'no_asistio':
        return {
          text: 'No Asistió',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle
        };
      default:
        return {
          text: estado,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Calendar
        };
    }
  };

  const getTypeBadge = (tipo: string) => {
    switch (tipo) {
      case 'consulta':
        return { text: 'Consulta', className: 'bg-blue-50 text-blue-700' };
      case 'control':
        return { text: 'Control', className: 'bg-green-50 text-green-700' };
      case 'urgencia':
        return { text: 'Urgencia', className: 'bg-red-50 text-red-700' };
      case 'cirugia':
        return { text: 'Cirugía', className: 'bg-purple-50 text-purple-700' };
      default:
        return { text: tipo, className: 'bg-gray-50 text-gray-700' };
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando consulta..." />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">{error || 'Consulta no encontrada'}</p>
            <Link
              href="/doctor/consultations"
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a consultas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(appointment.estado);
  const typeBadge = getTypeBadge(appointment.tipo);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/doctor/consultations"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Detalles de Consulta</h1>
                  <p className="text-gray-600 mt-1">
                    {formatDate(appointment.fecha)} - {appointment.horaInicio}
                  </p>
                </div>
              </div>
            </div>

            {appointment.estado !== 'completada' && appointment.estado !== 'cancelada' && (
              <Link
                href={`/doctor/consultations/${appointment.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar Consulta
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Información del Paciente */}
          <div className="lg:col-span-1">
            {patient && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Información del Paciente
                </h2>
                
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {patient.nombres} {patient.apellidos}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    DNI: {patient.numeroDocumento}
                  </p>
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-4">
                  {patient.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{patient.telefono}</span>
                    </div>
                  )}
                  
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 break-all">{patient.email}</span>
                    </div>
                  )}
                  
                  {patient.direccion && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        {typeof patient.direccion === 'string' 
                          ? patient.direccion 
                          : `${patient.direccion.calle || ''} ${patient.direccion.numero || ''}, ${patient.direccion.ciudad || ''}, ${patient.direccion.provincia || ''} ${patient.direccion.codigoPostal || ''}`.trim()
                        }
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={buildPath(`/historiales/${patient.id}`)}
                  className="mt-6 block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Ver Historia clínica
                </Link>
              </div>
            )}
          </div>

          {/* Columna Principal */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Información de la Cita */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Información de la Cita
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha</label>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(appointment.fecha)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Horario</label>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {appointment.horaInicio} - {appointment.horaFin}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.className}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusBadge.text}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeBadge.className}`}>
                      {typeBadge.text}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Doctor</label>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-400" />
                    {doctorName || 'No asignado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Motivo de Consulta */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Motivo de Consulta
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {appointment.motivo || 'No especificado'}
              </p>
              
              {patient && medicalRecordId && (
                <Link
                  href={buildPath(`/historiales/${patient.id}/registro/${medicalRecordId}`)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Ver registro médico asociado
                </Link>
              )}
              
              {patient && !medicalRecordId && appointment.estado === 'completada' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No se encontró un registro médico asociado a esta consulta.
                  </p>
                </div>
              )}
            </div>

            {/* Notas */}
            {appointment.notas && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Notas
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {appointment.notas}
                </p>
              </div>
            )}

            {/* Motivo de Cancelación */}
            {appointment.estado === 'cancelada' && appointment.motivoCancelacion && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Motivo de Cancelación
                </h2>
                <p className="text-red-700 whitespace-pre-wrap">
                  {appointment.motivoCancelacion}
                </p>
              </div>
            )}

            {/* Metadatos del Sistema */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Metadatos del Sistema
              </h2>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-500 block mb-1">Registro Creado</label>
                  <p className="text-gray-900">
                    {new Date(appointment.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(appointment.createdAt).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <label className="text-gray-500 block mb-1">Última Actualización</label>
                  <p className="text-gray-900">
                    {new Date(appointment.updatedAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(appointment.updatedAt).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {appointment.canceladaAt && (
                  <div className="col-span-2">
                    <label className="text-gray-500 block mb-1">Cancelada</label>
                    <p className="text-gray-900">
                      {new Date(appointment.canceladaAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
