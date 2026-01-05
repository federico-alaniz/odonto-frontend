'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Stethoscope,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { appointmentsService, Appointment } from '@/services/api/appointments.service';
import { patientsService, Patient } from '@/services/api/patients.service';
import { usersService } from '@/services/api/users.service';
import { User } from '@/types/roles';
import Link from 'next/link';

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const { buildPath } = useTenant();
  const appointmentId = params.id as string;
  const { showSuccess, showError } = useToast();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<User[]>([]);
  
  // Datos del formulario
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [estado, setEstado] = useState<'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio'>('programada');

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;

  useEffect(() => {
    if (clinicId && appointmentId) {
      loadData();
    }
  }, [clinicId, appointmentId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar cita, doctores y paciente en paralelo
      const [appointmentRes, doctorsRes] = await Promise.all([
        appointmentsService.getAppointmentById(clinicId, appointmentId),
        usersService.getUsers(clinicId, { role: 'doctor', estado: 'activo' })
      ]);

      if (appointmentRes.success && appointmentRes.data) {
        const apt = appointmentRes.data;
        setAppointment(apt);
        setSelectedDoctorId(apt.doctorId);
        setFecha(apt.fecha);
        setHoraInicio(apt.horaInicio);
        setHoraFin(apt.horaFin);
        setMotivo(apt.motivo || '');
        setEstado(apt.estado);

        // Cargar información del paciente
        const patientRes = await patientsService.getPatientById(apt.patientId, clinicId);
        if (patientRes.success && patientRes.data) {
          setPatient(patientRes.data);
        }
      }

      if (doctorsRes.success) {
        setDoctors(doctorsRes.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      showError('Error', 'No se pudo cargar la información del turno');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctorId || !fecha || !horaInicio || !horaFin) {
      showError('Campos requeridos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        doctorId: selectedDoctorId,
        fecha,
        horaInicio,
        horaFin,
        motivo,
        estado
      };

      const userId = (currentUser as any)?.id;
      const response = await appointmentsService.updateAppointment(
        clinicId,
        userId,
        appointmentId,
        updateData
      );

      if (response.success) {
        showSuccess('Turno actualizado', 'El turno se actualizó correctamente');
        router.push(buildPath('/secretary/appointments'));
      } else {
        showError('Error', 'No se pudo actualizar el turno');
      }
    } catch (error: any) {
      console.error('Error actualizando turno:', error);
      showError('Error', error.message || 'No se pudo actualizar el turno');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando turno...</p>
        </div>
      </div>
    );
  }

  if (!appointment || !patient) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se encontró el turno</p>
          <Link
            href={buildPath('/secretary/appointments')}
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Turnos
          </Link>
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
            <div className="flex items-center gap-4">
              <Link
                href={buildPath('/secretary/appointments')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Turno</h1>
                <p className="text-gray-600 mt-1">Modifica la información del turno</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Paciente (solo lectura) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Información del Paciente
            </h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-blue-700">Nombre:</span>
                  <p className="text-sm font-medium text-blue-900">
                    {patient.nombres} {patient.apellidos}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-blue-700">DNI:</span>
                  <p className="text-sm font-medium text-blue-900">{patient.numeroDocumento}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Turno */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Información del Turno
            </h2>
            
            <div className="space-y-4">
              {/* Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Stethoscope className="w-4 h-4 inline mr-1" />
                  Doctor *
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar doctor</option>
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

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha *
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Horarios */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="programada">Programada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="en_curso">En curso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="no_asistio">No asistió</option>
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la consulta
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe el motivo de la consulta..."
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <Link
              href={buildPath('/secretary/appointments')}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
