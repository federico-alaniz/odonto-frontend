'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import { 
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  MapPin,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { usersService } from '@/services/api/users.service';
import { patientsService, Patient } from '@/services/api/patients.service';
import { appointmentsService } from '@/services/api/appointments.service';
import { clinicSettingsService } from '@/services/api/clinic-settings.service';
import { User } from '@/types/roles';

function ConfirmAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { buildPath } = useTenant();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const doctorId = searchParams?.get('doctorId');
  const patientId = searchParams?.get('patientId');
  const date = searchParams?.get('date');
  const time = searchParams?.get('time');
  const motivo = searchParams?.get('motivo') || '';

  const [doctor, setDoctor] = useState<User | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultorio, setConsultorio] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [specialtyName, setSpecialtyName] = useState<string>('');

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;

  useEffect(() => {
    if (currentUser && clinicId && doctorId && patientId) {
      loadData();
    }
  }, [currentUser, clinicId, doctorId, patientId]);

  const loadData = async () => {
    if (!clinicId || !doctorId || !patientId) return;

    try {
      setLoading(true);
      
      // Cargar doctor
      const [doctorsRes, adminsRes] = await Promise.all([
        usersService.getUsers(clinicId, { role: 'doctor', limit: 100 }),
        usersService.getUsers(clinicId, { role: 'admin', limit: 100 })
      ]);

      const allDoctors = [...doctorsRes.data, ...adminsRes.data.filter((u: any) => u.isDoctor)];
      const foundDoctor = allDoctors.find(d => d.id === doctorId);
      
      if (foundDoctor) {
        setDoctor(foundDoctor);
        
        // Cargar especialidad
        const especialidadId = (foundDoctor as any).especialidades?.[0];
        if (especialidadId) {
          const specialtiesRes = await clinicSettingsService.getSpecialties(clinicId);
          if (specialtiesRes.success && specialtiesRes.data) {
            const spec = specialtiesRes.data.find((s: any) => s.id === especialidadId);
            if (spec) {
              setSpecialtyName((spec as any).nombre || (spec as any).name || 'Medicina General');
            } else {
              setSpecialtyName('Medicina General');
            }
          }
        } else {
          setSpecialtyName('Medicina General');
        }
        
        // Cargar nombre del consultorio
        const consultorioId = (foundDoctor as any).consultorio;
        if (consultorioId) {
          const consultoriosRes = await clinicSettingsService.getConsultingRooms(clinicId);
          if (consultoriosRes.success && consultoriosRes.data) {
            const cons = consultoriosRes.data.find((c: any) => c.id === consultorioId);
            if (cons) {
              setConsultorio((cons as any).nombre || (cons as any).name || consultorioId);
            }
          }
        }
      }

      // Cargar paciente
      const patientsRes = await patientsService.getPatients(clinicId, { limit: 1000 });
      const foundPatient = patientsRes.data.find(p => p.id === patientId);
      if (foundPatient) {
        setPatient(foundPatient);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!doctor || !patient || !date || !time) {
      showError('Faltan datos para crear el turno');
      return;
    }

    try {
      setCreating(true);

      // Calcular horaFin (30 minutos después de horaInicio)
      const [hours, minutes] = time.split(':').map(Number);
      let endMinutes = minutes + 30;
      let endHours = hours;
      if (endMinutes >= 60) {
        endMinutes -= 60;
        endHours += 1;
      }
      const horaFin = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

      const appointmentData = {
        patientId: patient.id,
        doctorId: doctor.id,
        fecha: date,
        horaInicio: time,
        horaFin: horaFin,
        motivo: motivo || 'Consulta general',
        estado: 'programado' as const
      };

      const response = await appointmentsService.createAppointment(clinicId!, currentUser!.id, appointmentData);

      if (response.success) {
        showSuccess('Turno creado exitosamente');
        router.push(buildPath('/secretary/appointments'));
      } else {
        showError('Error al crear el turno');
      }
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      showError(error.message || 'Error al crear el turno');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!doctor || !patient || !date || !time) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Datos incompletos</h3>
          <p className="text-gray-600 mb-4">Faltan datos para confirmar el turno</p>
          <button
            onClick={() => router.push(buildPath('/secretary/appointments'))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a turnos
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Confirmar Turno
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Revisa los detalles antes de confirmar
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(buildPath('/secretary/appointments'))}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-4">

        {/* Appointment Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-3 border-b border-blue-200">
            <h2 className="text-base font-bold text-blue-900">Detalles del Turno</h2>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-purple-600 font-medium mb-0.5">Fecha</div>
                  <div className="font-semibold text-gray-900 text-sm capitalize">{formattedDate}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-teal-600 font-medium mb-0.5">Hora</div>
                  <div className="font-semibold text-gray-900 text-sm">{time} hs</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                PROFESIONAL
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 overflow-hidden">
                  {(doctor as any).avatar ? (
                    <img
                      src={(doctor as any).avatar}
                      alt={`${doctor.nombres} ${doctor.apellidos}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{doctor.nombres?.[0]?.toUpperCase()}{doctor.apellidos?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-base">
                    Dr. {doctor.nombres} {doctor.apellidos}
                  </div>
                  <div className="text-blue-600 text-xs font-medium">
                    {specialtyName || 'Medicina General'}
                  </div>
                  {consultorio && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{consultorio}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                PACIENTE
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 overflow-hidden">
                  {(patient as any).avatar ? (
                    <img
                      src={(patient as any).avatar}
                      alt={`${patient.nombres} ${patient.apellidos}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{patient.nombres?.[0]?.toUpperCase()}{patient.apellidos?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-base">
                    {patient.nombres} {patient.apellidos}
                  </div>
                  <div className="text-xs text-gray-600">
                    DNI: {patient.numeroDocumento}
                  </div>
                  {(patient as any).obraSocial && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {(patient as any).obraSocial} {(patient as any).numeroAfiliado}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {motivo && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  MOTIVO DE CONSULTA
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900 text-sm">{motivo}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xs text-blue-900">
              <p className="font-bold mb-0.5">Importante</p>
              <p>
                Al confirmar, se enviará una notificación al paciente con los detalles del turno.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={creating}
            className="flex-1 px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={creating}
            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Confirmando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirmar Turno</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmAppointmentContent />
    </Suspense>
  );
}
