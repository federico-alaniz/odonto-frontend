/**
 * Central export point for all type definitions
 */

// Re-export existing types
export * from './roles';
export * from './next-auth.d';

// Patient types
export type {
  Direccion,
  ContactoEmergencia,
  SeguroMedico,
  Patient,
  CreatePatientData,
  UpdatePatientData,
  PatientFilters,
  PatientResponse,
  PatientsListResponse
} from './patient';

// Appointment types
export type {
  AppointmentStatus,
  AppointmentType,
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilters,
  AppointmentResponse,
  AppointmentsListResponse,
  AppointmentStatsResponse,
  DoctorSchedule
} from './appointment';

// Medical Record types
export type {
  SignosVitales,
  DatosOdontologicos,
  ToothSector,
  ToothCondition,
  Odontogramas,
  Prescripcion,
  ImagenDocumento,
  MedicalRecord,
  CreateMedicalRecordData,
  UpdateMedicalRecordData,
  MedicalRecordFilters,
  PatientSummary,
  MedicalRecordResponse,
  MedicalRecordsListResponse
} from './medical-record';
