// Adaptador para convertir datos fake a formato de historiales médicos
import { 
  patients, 
  medicalRecords, 
  users, 
  calculateAge,
  type MedicalRecord as FakeMedicalRecord,
  type Patient as FakePatient
} from '@/utils/fake-data';
import { MedicalEntry } from './types';

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

// Función para convertir FakeMedicalRecord a MedicalHistory (para compatibilidad)
export function convertFakeToHistory(fakeRecord: FakeMedicalRecord, fakePatient: FakePatient): MedicalHistory {
  // Buscar información del doctor
  const doctor = users.find(u => u.id === fakeRecord.doctorId);
  
  return {
    id: fakeRecord.id,
    patientId: fakeRecord.patientId,
    patient: {
      firstName: fakePatient.nombres,
      lastName: fakePatient.apellidos,
      email: fakePatient.email,
      phone: fakePatient.telefono,
      age: calculateAge(fakePatient.fechaNacimiento),
      dni: fakePatient.numeroDocumento
    },
    consultationDate: fakeRecord.fecha.split('T')[0],
    consultationTime: fakeRecord.fecha.split('T')[1]?.substring(0, 5) || '10:00',
    doctor: doctor ? `Dr. ${doctor.nombres} ${doctor.apellidos}` : 'Dr. Desconocido',
    specialty: fakeRecord.especialidad as 'clinica-medica' | 'pediatria' | 'cardiologia' | 'traumatologia' | 'ginecologia' | 'dermatologia' | 'neurologia' | 'psiquiatria' | 'odontologia' | 'oftalmologia' | 'otorrinolaringologia' | 'urologia' | 'endocrinologia' | 'gastroenterologia' | 'nefrologia' | 'neumologia',
    type: fakeRecord.tipo === 'consulta' ? 'consultation' as const : 
          fakeRecord.tipo === 'control' ? 'followup' as const :
          fakeRecord.tipo === 'cirugia' ? 'surgery' as const :
          fakeRecord.tipo === 'emergencia' ? 'emergency' as const : 'consultation' as const,
    diagnosis: fakeRecord.diagnostico,
    symptoms: fakeRecord.sintomas,
    treatment: fakeRecord.tratamiento,
    medications: fakeRecord.medicamentos?.map(med => ({
      name: med.nombre,
      dosage: med.dosis,
      frequency: med.frecuencia,
      duration: med.duracion,
      instructions: med.instrucciones || ''
    })) || [],
    vitalSigns: fakeRecord.signosVitales ? {
      bloodPressure: fakeRecord.signosVitales.presionArterial,
      heartRate: fakeRecord.signosVitales.frecuenciaCardiaca,
      temperature: fakeRecord.signosVitales.temperatura,
      weight: fakeRecord.signosVitales.peso,
      height: fakeRecord.signosVitales.altura
    } : undefined,
    notes: fakeRecord.examenFisico,
    attachments: [],
    diagnosticImages: [],
    odontogram: [],
    nextAppointment: fakeRecord.proximaConsulta?.fecha,
    status: fakeRecord.estado === 'finalizado' ? 'closed' : 
            fakeRecord.estado === 'revisado' ? 'follow_up' : 'active',
    createdAt: fakeRecord.fechaCreacion
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
    chiefComplaint: '',
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

// Funciones helper para trabajar con datos fake
export function getAllMedicalHistories(): MedicalHistory[] {
  return medicalRecords.map(record => {
    const patient = patients.find(p => p.id === record.patientId);
    if (!patient) {
      throw new Error(`Patient not found for medical record ${record.id}`);
    }
    return convertFakeToHistory(record, patient);
  });
}

export function getMedicalHistoryById(historyId: string): MedicalHistory | null {
  const record = medicalRecords.find(r => r.id === historyId);
  if (!record) return null;
  
  const patient = patients.find(p => p.id === record.patientId);
  if (!patient) return null;
  
  return convertFakeToHistory(record, patient);
}

export function getMedicalHistoriesByPatientId(patientId: string): MedicalHistory[] {
  const patientRecords = medicalRecords.filter(r => r.patientId === patientId);
  const patient = patients.find(p => p.id === patientId);
  
  if (!patient) return [];
  
  return patientRecords.map(record => convertFakeToHistory(record, patient));
}