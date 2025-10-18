// Adaptador temporal para mantener compatibilidad con componentes existentes
// Esta interfaz mantiene la estructura antigua para los modales y componentes
export interface MedicalHistory {
  id: string;
  patientId: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    age: number;
    dni: string;
  };
  consultationDate: string;
  consultationTime: string;
  doctor: string;
  specialty: 'clinica-medica' | 'pediatria' | 'cardiologia' | 'traumatologia' | 'ginecologia' | 'dermatologia' | 'neurologia' | 'psiquiatria' | 'odontologia' | 'oftalmologia' | 'otorrinolaringologia' | 'urologia' | 'endocrinologia' | 'gastroenterologia' | 'nefrologia' | 'neumologia';
  type: 'consultation' | 'followup' | 'emergency' | 'checkup' | 'surgery' | 'therapy';
  diagnosis: string;
  symptoms: string;
  treatment: string;
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  notes?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  diagnosticImages?: {
    id: string;
    name: string;
    description?: string;
    type: 'radiografia' | 'ecografia' | 'tomografia' | 'resonancia' | 'endoscopia' | 'laboratorio' | 'otro';
    url: string;
    uploadDate: string;
  }[];
  odontogram?: {
    id: number;
    status: 'healthy' | 'caries' | 'filling' | 'crown' | 'extraction' | 'root_canal' | 'implant' | 'missing';
    notes?: string;
  }[];
  nextAppointment?: string;
  status: 'active' | 'follow_up' | 'closed';
  createdAt: string;
}

// Función para convertir MedicalEntry a MedicalHistory (para compatibilidad)
import { MedicalEntry, Patient } from './types';

export function convertEntryToHistory(entry: MedicalEntry, patient: Patient): MedicalHistory {
  return {
    id: entry.id,
    patientId: patient.id,
    patient: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      dni: patient.dni
    },
    consultationDate: entry.consultationDate,
    consultationTime: entry.consultationTime,
    doctor: entry.doctor,
    specialty: entry.specialty,
    type: entry.type,
    diagnosis: entry.diagnosis,
    symptoms: entry.symptoms,
    treatment: entry.treatment,
    medications: entry.medications,
    vitalSigns: entry.vitalSigns,
    notes: entry.notes,
    attachments: entry.attachments,
    diagnosticImages: entry.diagnosticImages,
    odontogram: entry.odontogram,
    nextAppointment: entry.nextAppointment?.date,
    status: entry.status === 'completed' ? 'closed' : entry.status === 'active' ? 'active' : 'follow_up',
    createdAt: entry.createdAt
  };
}

// Función para convertir MedicalHistory a MedicalEntry (para actualizar)
export function convertHistoryToEntry(history: MedicalHistory): MedicalEntry {
  return {
    id: history.id,
    consultationDate: history.consultationDate,
    consultationTime: history.consultationTime,
    doctor: history.doctor,
    specialty: history.specialty,
    type: history.type,
    chiefComplaint: '', // Campo nuevo, no disponible en la estructura antigua
    symptoms: history.symptoms,
    diagnosis: history.diagnosis,
    treatment: history.treatment,
    medications: history.medications,
    vitalSigns: history.vitalSigns,
    diagnosticImages: history.diagnosticImages,
    attachments: history.attachments?.map(att => ({
      ...att,
      uploadDate: new Date().toISOString()
    })),
    odontogram: history.odontogram,
    nextAppointment: history.nextAppointment ? {
      date: history.nextAppointment,
      time: '',
      reason: ''
    } : undefined,
    notes: history.notes,
    status: history.status === 'closed' ? 'completed' : history.status === 'active' ? 'active' : 'follow_up',
    createdAt: history.createdAt,
    updatedAt: new Date().toISOString()
  };
}