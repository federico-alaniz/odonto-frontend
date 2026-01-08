/**
 * Medical Record type definitions
 */

export interface SignosVitales {
  presionArterial?: string;
  frecuenciaCardiaca?: number;
  temperatura?: number;
  frecuenciaRespiratoria?: number;
  saturacionOxigeno?: number;
  peso?: number;
  altura?: number;
  imc?: number;
}

export interface DatosOdontologicos {
  motivoConsultaOdontologica?: string;
  historiaEnfermedadActual?: string;
  antecedentesOdontologicos?: string;
  habitosOrales?: string[];
  higieneBucal?: string;
  piezasDentales?: string;
  procedimiento?: string;
  materiales?: string;
}

export interface ToothSector {
  sector: 'top' | 'bottom' | 'left' | 'right' | 'center';
  hasRestoration: boolean;
}

export interface ToothCondition {
  number: number;
  status: 'healthy' | 'caries' | 'filling' | 'crown' | 'extraction' | 'root_canal' | 'implant' | 'missing';
  sectors?: ToothSector[];
  hasCrown?: boolean;
  hasProsthesis?: boolean;
  notes?: string;
}

export interface Odontogramas {
  historico: ToothCondition[];
  actual: ToothCondition[];
}

export interface Prescripcion {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones?: string;
}

export interface ImagenDocumento {
  nombre: string;
  url: string;
  tipo: 'imagen' | 'documento';
  fecha: string;
}

export interface MedicalRecord {
  id: string;
  clinicId: string;
  pacienteId: string;
  doctorId?: string;
  
  // Información General
  fecha: string;
  tipoConsulta: 'general' | 'odontologia';
  
  // Motivo y Antecedentes
  motivoConsulta?: string;
  anamnesis?: string;
  
  // Signos Vitales
  signosVitales?: SignosVitales;
  
  // Examen Físico
  examenFisico?: string;
  
  // Datos Odontológicos
  datosOdontologicos?: DatosOdontologicos;
  
  // Odontogramas
  odontogramas?: Odontogramas;
  
  // Diagnóstico
  diagnostico?: string;
  diagnosticoCIE10?: string[];
  
  // Tratamiento
  tratamiento?: string;
  prescripciones?: Prescripcion[];
  
  // Observaciones
  observaciones?: string;
  
  // Imágenes y Documentos
  imagenes?: ImagenDocumento[];
  documentos?: ImagenDocumento[];
  
  // Próxima Cita
  proximaCita?: string;
  
  // Estado
  estado: string;
  
  // Auditoría
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateMedicalRecordData {
  pacienteId: string;
  doctorId?: string;
  fecha: string;
  tipoConsulta: 'general' | 'odontologia';
  motivoConsulta?: string;
  anamnesis?: string;
  signosVitales?: SignosVitales;
  examenFisico?: string;
  datosOdontologicos?: DatosOdontologicos;
  odontogramas?: Odontogramas;
  diagnostico?: string;
  diagnosticoCIE10?: string[];
  tratamiento?: string;
  prescripciones?: Prescripcion[];
  observaciones?: string;
  imagenes?: ImagenDocumento[];
  documentos?: ImagenDocumento[];
  proximaCita?: string;
}

export interface UpdateMedicalRecordData {
  motivoConsulta?: string;
  anamnesis?: string;
  signosVitales?: SignosVitales;
  examenFisico?: string;
  datosOdontologicos?: DatosOdontologicos;
  odontogramas?: Odontogramas;
  diagnostico?: string;
  diagnosticoCIE10?: string[];
  tratamiento?: string;
  prescripciones?: Prescripcion[];
  observaciones?: string;
  imagenes?: ImagenDocumento[];
  documentos?: ImagenDocumento[];
  proximaCita?: string;
}

export interface MedicalRecordFilters {
  pacienteId?: string;
  tipoConsulta?: 'general' | 'odontologia';
  doctorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

export interface PatientSummary {
  totalConsultas: number;
  consultasGenerales: number;
  consultasOdontologicas: number;
  ultimaConsulta?: MedicalRecord;
  diagnosticosRecientes: Array<{
    fecha: string;
    diagnostico: string;
    recordId: string;
  }>;
  tratamientosActivos: Array<{
    fecha: string;
    tratamiento: string;
    recordId: string;
  }>;
  prescripcionesActivas: Array<{
    fecha: string;
    medicamento: string;
    dosis: string;
    recordId: string;
  }>;
}

export interface MedicalRecordResponse {
  success: boolean;
  data: MedicalRecord;
  message?: string;
}

export interface MedicalRecordsListResponse {
  success: boolean;
  data: MedicalRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
