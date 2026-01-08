/**
 * Appointment-related type definitions
 */

export type AppointmentStatus = 
  | 'programada' 
  | 'confirmada' 
  | 'esperando'
  | 'en_curso' 
  | 'en-curso'
  | 'completada' 
  | 'cancelada' 
  | 'no_asistio'
  | 'no-show';

export type AppointmentType = 'consulta' | 'control' | 'urgencia' | 'cirugia';

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  motivo: string;
  estado: AppointmentStatus;
  tipo: AppointmentType;
  notas?: string;
  consultorio?: string;
  motivoCancelacion?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  canceladaAt?: string;
  canceladaBy?: string;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
  tipo?: AppointmentType;
  notas?: string;
  consultorio?: string;
  estado?: AppointmentStatus;
}

export interface UpdateAppointmentData {
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  motivo?: string;
  estado?: AppointmentStatus;
  tipo?: AppointmentType;
  notas?: string;
  consultorio?: string;
}

export interface AppointmentFilters {
  doctorId?: string;
  patientId?: string;
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: AppointmentStatus | string;
  tipo?: AppointmentType;
  page?: number;
  limit?: number;
}

export interface AppointmentResponse {
  success: boolean;
  data: Appointment;
  message?: string;
}

export interface AppointmentsListResponse {
  success: boolean;
  data: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AppointmentStatsResponse {
  success: boolean;
  data: {
    total: number;
    programadas: number;
    confirmadas: number;
    completadas: number;
    canceladas: number;
    hoy: number;
  };
}

export interface DoctorSchedule {
  doctorId: string;
  fecha: string;
  appointments: Appointment[];
}
