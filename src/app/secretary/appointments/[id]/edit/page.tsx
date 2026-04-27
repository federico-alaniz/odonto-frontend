'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner, Spinner } from '@/components/ui/Spinner';
import { useRouter, useParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/hooks/useAuth';
import MedicalModal from '@/components/ui/MedicalModal';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Stethoscope,
  ArrowLeft,
  Save,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { appointmentsService } from '@/services/api/appointments.service';
import { patientsService } from '@/services/api/patients.service';
import type { Appointment, Patient, AppointmentStatus } from '@/types';
import { usersService } from '@/services/api/users.service';
import { User, HorarioAtencion } from '@/types/roles';
import Link from 'next/link';
import { dateHelper } from '@/utils/date-helper';

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const { buildPath } = useTenant();
  const appointmentId = params.id as string;
  const { showSuccess, showError } = useToast();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Datos del formulario
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [estado, setEstado] = useState<AppointmentStatus>('programada');

  // Estados para disponibilidad
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [tempFecha, setTempFecha] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [maxDuration, setMaxDuration] = useState(30);

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
      const [appointmentRes, doctorsRes, adminsRes] = await Promise.all([
        appointmentsService.getAppointmentById(clinicId, appointmentId),
        usersService.getUsers(clinicId, { role: 'doctor', estado: 'activo' }),
        usersService.getUsers(clinicId, { role: 'admin', estado: 'activo' })
      ]);

      if (appointmentRes.success && appointmentRes.data) {
        const apt = appointmentRes.data;
        
        // Check if appointment can be edited (only 'programada' or 'confirmada' status)
        if (!['programada', 'confirmada'].includes(apt.estado)) {
          showError('Error', 'Solo se pueden editar turnos con estado "programada" o "confirmada"');
          router.push(buildPath('/secretary/appointments'));
          return;
        }
        
        setAppointment(apt);
        setSelectedDoctorId(apt.doctorId);
        setFecha(apt.fecha);
        setTempFecha(apt.fecha);
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

      if (doctorsRes.success && adminsRes.success) {
        // Filtrar admins que tienen isDoctor = true
        const adminDoctors = adminsRes.data.filter((user: User) => user.isDoctor === true);
        // Combinar doctores y admin-doctores
        const allDoctors = [...doctorsRes.data, ...adminDoctors];
        setDoctors(allDoctors);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      showError('Error', 'No se pudo cargar la información del turno');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showAvailabilityModal && selectedDoctorId && tempFecha) {
      loadDoctorSchedule();
    }
  }, [showAvailabilityModal, selectedDoctorId, tempFecha]);

  const loadDoctorSchedule = async () => {
    if (!selectedDoctorId || !tempFecha || !clinicId) return;
    
    try {
      setLoadingSchedule(true);
      const response = await appointmentsService.getDoctorSchedule(
        clinicId,
        selectedDoctorId,
        tempFecha
      );
      
      // Excluir el turno actual de los ocupados si es en la misma fecha
      const occupied = response.data
        .filter((apt: any) => apt.id !== appointmentId)
        .map((apt: any) => apt.horaInicio);
        
      setBookedSlots(occupied);
      
      // Generate available slots
      const slots = generateAvailableTimeSlots();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading doctor schedule:', error);
      setBookedSlots([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const generateAvailableTimeSlots = (): TimeSlot[] => {
    const doctor = doctors.find(d => d.id === selectedDoctorId);
    if (!doctor || !tempFecha) return [];

    const date = new Date(tempFecha + 'T12:00:00');
    const dayOfWeek = date.getDay();
    const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    const horario = doctor.horariosAtencion?.find(
      h => h.activo && h.dia === backendDay
    );

    if (!horario) return [];

    const slots: TimeSlot[] = [];
    const [startHour, startMin] = horario.horaInicio.split(':').map(Number);
    const [endHour, endMin] = horario.horaFin.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      
      // Verificar si el slot está ocupado por otro turno
      const isBooked = bookedSlots.includes(timeStr);
      
      // Verificar si el horario ya pasó (solo si es el día de hoy)
      let isPast = false;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      if (tempFecha === todayStr) {
        const currentH = today.getHours();
        const currentM = today.getMinutes();
        if (currentHour < currentH || (currentHour === currentH && currentMin <= currentM)) {
          isPast = true;
        }
      }
      
      slots.push({ time: timeStr, available: !isBooked && !isPast });

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }

    return slots;
  };

  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
    
    // Calcular duración máxima disponible desde este slot
    const slots = availableSlots;
    const startIndex = slots.findIndex(s => s.time === time);
    let duration = 30;
    
    // Buscar cuántos slots seguidos de 30 min están disponibles
    for (let i = startIndex + 1; i < slots.length; i++) {
      if (slots[i].available) {
        duration += 30;
      } else {
        break;
      }
      
      // Limitar a una duración razonable, máximo 3 horas (180 min)
      if (duration >= 180) break;
    }
    
    setMaxDuration(Math.min(duration, 180));
    setSelectedDuration(30); // Default 30 min
  };

  const handleConfirmSlot = () => {
    if (!selectedSlot) return;
    
    setFecha(tempFecha);
    setHoraInicio(selectedSlot);
    
    // Calcular hora fin basada en duración seleccionada
    const [h, m] = selectedSlot.split(':').map(Number);
    let endTotalMinutes = h * 60 + m + selectedDuration;
    
    const endH = Math.floor(endTotalMinutes / 60);
    const endM = endTotalMinutes % 60;
    
    const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    setHoraFin(endTimeStr);
    
    setShowAvailabilityModal(false);
    setSelectedSlot(null);
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
    } catch (error) {
      console.error('Error actualizando turno:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo actualizar el turno';
      showError('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAppointment = async () => {
    try {
      setCancelling(true);
      const userId = (currentUser as any)?.id;
      const response = await appointmentsService.updateAppointment(
        clinicId,
        userId,
        appointmentId,
        { estado: 'cancelada' }
      );

      if (response.success) {
        showSuccess('Turno cancelado', 'El turno ha sido cancelado exitosamente');
        router.push(buildPath('/secretary/appointments'));
      } else {
        showError('Error', 'No se pudo cancelar el turno');
      }
    } catch (error) {
      console.error('Error cancelando turno:', error);
      showError('Error', 'Ocurrió un error al intentar cancelar el turno');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando turno..." />
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
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

              {/* Fecha y Hora (Selector de Disponibilidad) */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Programación
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedDoctorId) {
                        showError('Doctor requerido', 'Selecciona un doctor primero');
                        return;
                      }
                      setTempFecha(fecha);
                      setShowAvailabilityModal(true);
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Cambiar Fecha/Hora
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </label>
                    <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'No seleccionada'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora Inicio
                    </label>
                    <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {horaInicio || 'No seleccionada'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora Fin
                    </label>
                    <div className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-200" />
                      {horaFin || 'No seleccionada'}
                    </div>
                  </div>
                </div>
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
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              disabled={saving || cancelling}
              className="px-6 py-3 text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Cancelar Turno
            </button>

            <div className="flex gap-3">
              <Link
                href={buildPath('/secretary/appointments')}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Volver
              </Link>
              <button
                type="submit"
                disabled={saving || cancelling}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Spinner size="sm" color="white" />
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
          </div>
        </form>
      </div>

      {/* Modal de Confirmación de Cancelación */}
      <MedicalModal
        isOpen={showCancelModal}
        onClose={() => !cancelling && setShowCancelModal(false)}
        title="Confirmar Cancelación"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h4 className="text-red-900 font-bold">¿Estás seguro?</h4>
              <p className="text-red-700 text-sm">
                Esta acción no se puede deshacer y el turno quedará liberado.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleCancelAppointment}
              disabled={cancelling}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {cancelling ? (
                <>
                  <Spinner size="sm" color="white" />
                  Cancelando...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Sí, cancelar turno
                </>
              )}
            </button>
            <button
              onClick={() => setShowCancelModal(false)}
              disabled={cancelling}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              No, mantener turno
            </button>
          </div>
        </div>
      </MedicalModal>

      {/* Modal de Disponibilidad */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Disponibilidad del Doctor
              </h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-0 flex flex-col h-[600px]">
              {/* Selector de Fecha Superior */}
              <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={tempFecha}
                      onChange={(e) => setTempFecha(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {tempFecha ? new Date(tempFecha + 'T12:00:00').toLocaleDateString('es-AR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'short' 
                    }) : ''}
                  </div>
                </div>
              </div>

              {/* Cuerpo del Calendario Diario */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                {loadingSchedule ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Spinner size="lg" color="primary" />
                    <p className="text-gray-500 mt-4 font-medium">Consultando agenda...</p>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="space-y-2 max-w-md mx-auto">
                    <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                      <Clock className="w-3.5 h-3.5" />
                      Franjas Horarias
                    </div>
                    {availableSlots.map((slot) => (
                      <div key={slot.time} className="flex items-center gap-4 group">
                        <div className="w-16 text-right text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                          {slot.time}
                        </div>
                        <button
                          type="button"
                          disabled={!slot.available}
                          onClick={() => handleSlotSelect(slot.time)}
                          className={`
                            flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-left transition-all border-2
                            ${slot.available 
                              ? selectedSlot === slot.time
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md translate-x-1'
                                : 'bg-white border-white text-gray-700 shadow-sm hover:border-blue-500 hover:shadow-md hover:translate-x-1' 
                              : 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                            }
                          `}
                        >
                          <div className="flex justify-between items-center">
                            <span>{slot.available ? (selectedSlot === slot.time ? 'Seleccionado' : 'Disponible') : 'Ocupado'}</span>
                            {slot.available && (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${selectedSlot === slot.time ? 'bg-blue-500 text-white' : 'bg-blue-50 group-hover:bg-blue-500 group-hover:text-white'}`}>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Sin disponibilidad</h4>
                    <p className="text-gray-500 max-w-xs mx-auto">
                      El doctor no atiende en este día o la agenda está completa. Por favor, selecciona otra fecha.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Selector de Duración Inferior (Aparece al elegir un slot) */}
              {selectedSlot && (
                <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Configurar Duración
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="30"
                          max={maxDuration}
                          step="30"
                          value={selectedDuration}
                          onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                          className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                          {selectedDuration} <span className="text-xs font-medium">min</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Máximo disponible: <span className="font-semibold">{maxDuration} min</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedSlot(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSlot}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-all flex items-center gap-2"
                      >
                        Confirmar {selectedSlot} ({selectedDuration} min)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
