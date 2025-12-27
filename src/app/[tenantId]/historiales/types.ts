// Tipos e interfaces para el sistema de historias clínicas

// Información básica del paciente
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  dni: string;
  gender: 'masculino' | 'femenino' | 'otro';
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Un registro médico individual (una consulta/visita)
export interface MedicalEntry {
  id: string;
  consultationDate: string;
  consultationTime: string;
  doctor: string;
  specialty: 'clinica-medica' | 'pediatria' | 'cardiologia' | 'traumatologia' | 'ginecologia' | 'dermatologia' | 'neurologia' | 'psiquiatria' | 'odontologia' | 'oftalmologia' | 'otorrinolaringologia' | 'urologia' | 'endocrinologia' | 'gastroenterologia' | 'nefrologia' | 'neumologia';
  type: 'consultation' | 'followup' | 'emergency' | 'checkup' | 'surgery' | 'therapy';
  chiefComplaint: string; // Motivo principal de consulta
  symptoms: string;
  physicalExam?: string;
  diagnosis: string;
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
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  diagnosticImages?: {
    id: string;
    name: string;
    description?: string;
    type: 'radiografia' | 'ecografia' | 'tomografia' | 'resonancia' | 'endoscopia' | 'laboratorio' | 'otro';
    url: string;
    uploadDate: string;
  }[];
  labResults?: {
    id: string;
    testName: string;
    result: string;
    normalRange: string;
    date: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }[];
  // Específico para odontología
  odontogram?: {
    id: number;
    status: 'healthy' | 'caries' | 'filling' | 'crown' | 'extraction' | 'root_canal' | 'implant' | 'missing';
    notes?: string;
  }[];
  nextAppointment?: {
    date: string;
    time: string;
    reason: string;
  };
  notes?: string;
  status: 'active' | 'follow_up' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// La historia clínica completa de un paciente
export interface MedicalRecord {
  id: string;
  patientId: string;
  patient: Patient;
  entries: MedicalEntry[]; // Todos los registros médicos del paciente
  allergies: string[];
  chronicConditions: string[];
  familyHistory?: {
    condition: string;
    relationship: string;
    notes?: string;
  }[];
  surgicalHistory?: {
    procedure: string;
    date: string;
    surgeon: string;
    complications?: string;
  }[];
  socialHistory?: {
    smoking: 'never' | 'former' | 'current';
    alcohol: 'never' | 'occasional' | 'moderate' | 'heavy';
    exercise: 'sedentary' | 'light' | 'moderate' | 'active';
    occupation?: string;
  };
  immunizations?: {
    vaccine: string;
    date: string;
    provider: string;
  }[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Filtros para búsqueda de historias clínicas
export interface MedicalRecordFilters {
  patientName?: string;
  doctorName?: string;
  specialty?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  diagnosis?: string;
}

// Resumen estadístico de una historia clínica
export interface MedicalRecordSummary {
  totalEntries: number;
  lastVisit?: string;
  nextAppointment?: string;
  activeConditions: string[];
  currentMedications: string[];
  recentDiagnoses: string[];
}